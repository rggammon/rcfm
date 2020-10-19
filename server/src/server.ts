import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import passport from "koa-passport";
import session from "koa-session";
import authRouter from "./routes/authRouter";
import { Profile, Strategy, StrategyOptions } from "passport-coinbase";
import process from "process";

//
// Read config from environment variables
//
const PORT = process.env.PORT || 5000;
const koaKey = process.env["KOA_KEY"];
const clientID = process.env["OAUTH2_CLIENTID"];
const clientSecret = process.env["OAUTH2_CLIENTSECRET"];
const callbackURL = process.env["OAUTH2_CALLBACK"];

if (!clientID || !clientSecret || !callbackURL || !koaKey) {
  console.error("Missing rcfm environment settings");
  process.exit(1);
}

//
// Configure passport
//
const options: StrategyOptions = {
  clientID,
  clientSecret,
  callbackURL,
  scope: ['wallet:user:read', 'wallet:user:email']
};

passport.use(
  new Strategy(options, 
    (accessToken: string, refreshToken: string, profile: Profile, done) => {
      done(null, {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.email
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