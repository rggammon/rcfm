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
    if (ctx.isUnauthenticated()) {
        ctx.response.status = 401;
        return;
    }

    const squawkKey = `squawk_${ctx.request.body.tag}`;
    const rowKey = "data";

    const entity = {
        PartitionKey: entGen.String(squawkKey),
        RowKey: entGen.String(rowKey),
        data: entGen.String(JSON.stringify(ctx.request.body.data))
    };

    return new Promise<void>((resolve, reject) => {

        const userLink = {
            PartitionKey: entGen.String(`twitter_${ctx.state.user.id}`),
            RowKey: entGen.String(squawkKey),
        };
    
        tableSvc.insertOrMergeEntity('rcfm', userLink, (error, result, response) => {
            if (error) {
                reject(error);
                return;
            }

            tableSvc.insertOrMergeEntity('rcfm', entity, (error, result, response) => {
                if (error) {
                    reject(error);
                    return;
                }

                ctx.response.status = 200;
                resolve();
            });
        });
    });
});

export default router;