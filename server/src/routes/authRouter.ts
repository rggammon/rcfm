import Router from "koa-router";
import { DefaultState, Context } from 'koa';
import passport from "koa-passport";

const router = new Router<DefaultState, Context>();

router.get(`/api/v1/me`, async (ctx : Context) => {
    if (ctx.isUnauthenticated()) {
        ctx.response.status = 401;
        return;
    }
    ctx.body = ctx.state.user;
});

router.get(`/api/v1/signin`, passport.authenticate('coinbase'));

router.get(`/api/v1/callback`, passport.authenticate('coinbase', {
    successRedirect: '/',
    failureRedirect: '/autherror'
}));

router.get(`/api/v1/signout`, async (ctx : Context) => {
    ctx.session = null;
    ctx.redirect("/");
});

export default router;