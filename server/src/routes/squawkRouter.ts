import Router from "koa-router";
import { DefaultState, Context } from 'koa';
import { TableClient } from "@azure/data-tables";
import { Squawk } from '../resourceTypes/squawk';

const router = new Router<DefaultState, Context>();

var entityResolver = function(entity: any) {
    var resolvedEntity: any = {};

    for (var key in entity) {
        resolvedEntity[key] = entity[key]._;
    }
    return resolvedEntity;
}

var options: any = {};
options.entityResolver = entityResolver;

router.get("/api/v1/users/me/squawks", async (ctx) => {
    const tableClient: TableClient = ctx.deps.tableClient;
    const iter = await tableClient.listEntities<Squawk>({
        queryOptions: {
            filter: "PartitionKey gt 'twitter_' and PartitionKey lt 'twitter`' and RowKey gt 'squawk_' and RowKey lt 'squawk`'"
        }
    });

    ctx.body = { 
        value: []
    }

    for await (const entity of iter) {
        ctx.body.value.push(entity);
    }  
});

router.get("/api/v1/users/me/squawks/:id", async (ctx) => {
    const tableClient: TableClient = ctx.deps.tableClient;
    let twitterUserId = "220252062";

    const squawk = await tableClient.getEntity<Squawk>(`twitter_${twitterUserId}`, `squawk_${ctx.params.id}`);
    ctx.body = {
        value: JSON.parse(squawk.data)
    };
});

router.post("/api/v1/users/me/squawks", async (ctx) => {
    if (ctx.isUnauthenticated()) {
        ctx.response.status = 401;
        return;
    }

    const tableClient: TableClient = ctx.deps.tableClient;
    const entity = {
        partitionKey: "twitter_220252062",
        rowKey: "squawk_1",
        id: 1,
        data: "[" + JSON.stringify(ctx.request.body.data[0]) + "]",
        tweetId: "1344360359910547457"
    };

    const upsertResp = await tableClient.createEntity(entity);

    ctx.response.status = 201;
});

export default router;