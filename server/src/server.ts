import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import passport from "koa-passport";
import session from "koa-session";
import depsi from "koa-depsi";
import authRouter from "./routes/authRouter";
import squawkRouter from "./routes/squawkRouter";
import { IStrategyOption, Profile, Strategy } from "passport-twitter";
import { User } from "./resourceTypes/user";
import process from "process";
import { TableClient } from "@azure/data-tables";
import * as appInsights from 'applicationinsights';

async function run(): Promise<void>
{
  //
  // Read config from environment variables
  //
  const PORT = process.env.PORT || 5000;
  const koaKey = process.env["KOA_KEY"];
  const clientID = process.env["OAUTH2_CLIENTID"];
  const clientSecret = process.env["OAUTH2_CLIENTSECRET"];
  const callbackURL = process.env["OAUTH2_CALLBACK"];
  const appInsightsInstrumentationKey = process.env["APPINSIGHTS_INSTRUMENTATIONKEY"];
  const azureConnectionString = process.env["AZURE_STORAGE_CONNECTION_STRING"];

  if (!clientID || !clientSecret || !callbackURL || !koaKey || !azureConnectionString) {
    console.error("Missing rcfm environment settings");
    process.exit(1);
  }

  appInsights
    .setup(appInsightsInstrumentationKey)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start();

  //
  // Configure Azure Storage
  //

  const tableClient = TableClient.fromConnectionString(azureConnectionString, 'rcfm');
  try {
    const createTableResp = await tableClient.create();
  } catch (err) {
    if (err.response?.parsedBody?.odataError?.code !== "TableAlreadyExists") {
      throw err;
    }
  }

  //
  // Configure passport
  //
  const options: IStrategyOption = {
    consumerKey: clientID,
    consumerSecret: clientSecret,
    callbackURL
  };

  async function strategyCallback(accessToken: string, refreshToken: string, profile: Profile) : Promise<User> {
    const partitionKey: string = `twitter_${profile.id}`;
    const rowKey: string = 'profile';
    
    const profileResp = await tableClient.getEntity(partitionKey, rowKey);
    if (profileResp._response.status >= 400 && 
        profileResp._response.status !== 404) {
      console.error("Error retrieving user");
      throw new Error("Error retrieving user");
    }

    const userEntity = {
      ...profileResp,
      partitionKey: partitionKey,
      rowKey: rowKey,
      email: (profile.emails && profile.emails[0].value) || "",
      photo: (profile.photos && profile.photos[0].value) || "",
      accessToken,
      refreshToken
    };

    const upsertResp = await tableClient.upsertEntity(userEntity, "Merge");
    if (upsertResp._response.status >= 400) {
      console.error("Error upserting user");
      throw new Error("Error upserting user");
    } else {
      return {
        id: profile.id,
        displayName: profile.displayName,
        username: profile.username,
        email: userEntity.email,
        photo: userEntity.photo
      };
    }
  }

  passport.use(
    new Strategy(options, 
      (accessToken: string, refreshToken: string, profile: Profile, done) => {
        strategyCallback(accessToken, refreshToken, profile)
          .then(resp => done(null, resp))
          .catch(err => done(err));
      }
    )
  );

  passport.serializeUser(function(user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
  });
  
  //
  // Configure Koa
  //
  const app = new Koa();
  app.keys = [koaKey];

  const config = {
    key: 'rcfm.sess',
    maxAge: 90 * 86400000, // 90 days
    renew: true
  };

  app.use(bodyParser());
  app.use(logger());
  app.use(session(config, app));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(depsi({
    tableClient
  }));

  //
  // Add routes
  //
  app.use(authRouter.routes());
  app.use(squawkRouter.routes());

  // Require authentication
  app.use((ctx, next) => {
    if (ctx.isAuthenticated()) {
      return next()
    } else {
      ctx.response.status = 401;
    }
  })

  //
  // Start server
  //
  const server = app
    .listen(PORT, async () => {
      console.log(`Server listening on port: ${PORT}`);
    })
    .on("error", err => {
      console.error(err);
    });
}

run()
  .catch((error) => {
    console.error(`Error: ${error}`);
    process.exit(1);
  });
