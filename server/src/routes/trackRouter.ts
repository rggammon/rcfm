import Router from "koa-router";
import { DefaultState, Context } from 'koa';
import azure from 'azure-storage';

const router = new Router<DefaultState, Context>();

const tableSvc = azure.createTableService();

const entGen = azure.TableUtilities.entityGenerator;

router.post(`/api/v1/users/me/track`, (ctx) => {
    const trackId = new Date().getTime().toString(16).padStart(16, "0");
    const partitionKey = `eth_${ctx.state.user.ethAddress}`;
    const rowKey = `track_${trackId}`;

    const entity = {
        PartitionKey: entGen.String(partitionKey),
        RowKey: entGen.String(rowKey),
        src: ctx.request.body.src,
        license: ctx.request.body.license,
        title: ctx.request.body.title,
        artist: ctx.request.body.artist
    };

    return new Promise((resolve, reject) => {
        tableSvc.insertOrMergeEntity('rcfm', entity, (error, result, response) => {
            if (error) {
                ctx.response.status = 400;
            } else {
                ctx.response.status = 200;
            }
            resolve();
        });
    });
});

export default router;