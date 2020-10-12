import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import Router from "koa-router";

const app = new Koa();

const PORT = process.env.PORT || 5000;

app.use(bodyParser());
app.use(logger());

const router = new Router();

router.get(`/api/hello`, async (ctx) => {
  try {
    ctx.body = {
      status: "success",
    };
  } catch (err) {
    console.error(err);
  }
});

app.use(router.routes());
const server = app
  .listen(PORT, async () => {
    console.log(`Server listening on port: ${PORT}`);
  })
  .on("error", err => {
    console.error(err);
  });

export default server;