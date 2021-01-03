import Router from "koa-router";
import { DefaultState, Context } from 'koa';
import azure from 'azure-storage';

const router = new Router<DefaultState, Context>();

const tableSvc = azure.createTableService();

const entGen = azure.TableUtilities.entityGenerator;

var entityResolver = function(entity: any) {
    var resolvedEntity: any = {};

    for (var key in entity) {
        resolvedEntity[key] = entity[key]._;
    }
    return resolvedEntity;
}

var options: any = {};
options.entityResolver = entityResolver;

router.get(`/api/v1/users/me/squawk/:id`, (ctx) => {
    return new Promise<void>((resolve, reject) => {
        tableSvc.retrieveEntity('rcfm', `squawk_${ctx.params.id}`, "data", options, (error, result, response) => {
            if (error) {
                ctx.response.status = 400;
            } else {
                ctx.response.status = 200;
                const body = response.body as any;
                ctx.body = {
                    data: JSON.parse(body.data)
                };
                resolve();
            }
        });
    });
});

router.post(`/api/v1/users/me/squawk`, (ctx) => {
    const squawkId = new Date().getTime().toString(16).padStart(16, "0");
    // const partitionKey = `twitter_${ctx.state.user.id}`;
    // const rowKey = `squawk_${squawkId}`;

    const partitionKey = "squawk_0";
    const rowKey = "data";

    const entity = {
        PartitionKey: entGen.String(partitionKey),
        RowKey: entGen.String(rowKey),
        data: entGen.String(JSON.stringify(ctx.request.body.data))
    };

    return new Promise<void>((resolve, reject) => {
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