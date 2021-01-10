import Router from "koa-router";
import { DefaultState, Context } from 'koa';
import azure from 'azure-storage';
import { Squawk } from '../resourceTypes/squawk';

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

router.get("/api/v1/users/me/squawks", (ctx) => {
    return new Promise<void>((resolve, reject) => {
        try {
            var query = new azure.TableQuery().top(10).where("PartitionKey gt 'squawk_' and RowKey eq 'data'");
            var continuationToken = null as unknown as azure.TableService.TableContinuationToken;
            tableSvc.queryEntities<Squawk>('rcfm', query, continuationToken, options, function(error, results, response) {
                if (error) {
                    ctx.response.status = 400;
                } else {
                    ctx.response.status = 200;
                    ctx.body = {
                        value: results.entries
                    }
                }
                resolve();
            });
        } 
        catch (err) {
            reject(err);
        }
    });
});

router.get("/api/v1/users/me/squawks/:id", (ctx) => {
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
            }
            resolve();
        });
    });
});

router.post("/api/v1/users/me/squawks/:id", (ctx) => {
    if (ctx.isUnauthenticated()) {
        ctx.response.status = 401;
        return;
    }

    const squawkKey = `squawk_${ctx.params.id}`;
    const rowKey = "data";

    const entity = {
        PartitionKey: entGen.String(squawkKey),
        RowKey: entGen.String(rowKey),
        id: entGen.Int64(ctx.params.id),
        data: entGen.String(JSON.stringify(ctx.request.body.data)),
        tweetId: "1344360359910547457"
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