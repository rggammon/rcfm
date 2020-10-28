import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import passport from "koa-passport";
import session from "koa-session";
import authRouter from "./routes/authRouter";
import trackRouter from "./routes/trackRouter";
import searchRouter from "./routes/searchRouter";
import { Profile, Strategy, StrategyOptions } from "passport-coinbase";
import process from "process";
import azure from 'azure-storage';
import Web3 from 'web3';

//
// Read config from environment variables
//
const PORT = process.env.PORT || 5000;
const koaKey = process.env["KOA_KEY"];
const clientID = process.env["OAUTH2_CLIENTID"];
const clientSecret = process.env["OAUTH2_CLIENTSECRET"];
const callbackURL = process.env["OAUTH2_CALLBACK"];
const ethEndpoint = process.env["ETH_ENDPOINT"];

if (!clientID || !clientSecret || !callbackURL || !koaKey || !ethEndpoint) {
  console.error("Missing rcfm environment settings");
  process.exit(1);
}

//
// Configure Azure Storage
//
const tableSvc = azure.createTableService();
tableSvc.createTableIfNotExists('rcfm', function (error, result, response){
  if (error) {
    console.error(`Error creating azure storage table: ${error}`);
    process.exit(1);
  }
});

const entGen = azure.TableUtilities.entityGenerator;

//
// Configure web3 / ethereum
//
const web3 = new Web3(ethEndpoint);

//
// Configure passport
//
const options: StrategyOptions = {
  clientID,
  clientSecret,
  callbackURL,
  scope: ['wallet:user:read', 'wallet:user:email'],
  accountCurrency: "MKR"
};

passport.use(
  new Strategy(options, 
    (accessToken: string, refreshToken: string, profile: Profile, done) => {
      const partitionKey = `coinbaseuser_${profile.id}`;
      const rowKey = 'profile';
      
      tableSvc.retrieveEntity('rcfm', partitionKey, rowKey, {}, (error, coinBaseUserEntity: any, response) => {
        if (response.statusCode === 404) {
          const web3account = web3.eth.accounts.create();

          // Create an eth account
          coinBaseUserEntity = {
            ethAddress: entGen.String(web3account.address),
            ethPrivateKey: entGen.String(web3account.privateKey)
          };
        }
        else if (error) {
          console.error(`Error retrieving user: ${error}`);
          done(error);
        }

        Object.assign(coinBaseUserEntity, {
          PartitionKey: entGen.String(partitionKey),
          RowKey: entGen.String(rowKey),
          displayName: entGen.String(profile.displayName),
          email: entGen.String(profile.emails![0].value),
          lastLogin: entGen.DateTime(new Date()),
          refreshToken: entGen.String(refreshToken)
        });  

        tableSvc.insertOrMergeEntity('rcfm', coinBaseUserEntity, (error, result, response) => {
          if (error) {
            console.error(`Error inserting user: ${error}`);
            done(error);
          } else {
            done(null, {
              id: profile.id,
              displayName: profile.displayName,
              email: profile.emails![0],
              ethAddress: coinBaseUserEntity.ethAddress._,
              accessToken
            });    
          }
        })
      });
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
  maxAge: 86400000,
  renew: true
};

app.use(bodyParser());
app.use(logger());
app.use(session(config, app));
app.use(passport.initialize())
app.use(passport.session())

//
// Add routes
//
app.use(authRouter.routes());

// Require authentication
app.use((ctx, next) => {
  if (ctx.isAuthenticated()) {
    return next()
  } else {
    ctx.response.status = 401;
  }
})

app.use(trackRouter.routes());
app.use(searchRouter.routes());

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

export default server;