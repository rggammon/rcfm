import Router from "koa-router";
import { DefaultState, Context } from 'koa';
import { TableClient } from "@azure/data-tables";
import { Squawk } from '../resourceTypes/squawk';
import baseX from "base-x";
import moment from "moment";

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = baseX(BASE62)

const router = new Router<DefaultState, Context>();

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
    let twitterUserId;
    let squawkId;
    if (ctx.params.id === "0") {
        twitterUserId = "220252062";
        squawkId = 0;
    } else {
        const decoded = base62.decode(ctx.params.id);
        twitterUserId = decoded.readBigUInt64BE();
        squawkId = decoded.readUInt32BE(8).toString(16).padStart(8, "0")
    }

    const squawk = await tableClient.getEntity<Squawk>(`twitter_${twitterUserId}`, `squawk_${squawkId}`);
    let tracks = [];
    let i = 0;
    while (true) {
        const trackId = (squawk as any)[`track_${i}`];
        if (!trackId) {
            break;
        }

        tracks.push({
            id: trackId
        });

        i++;
    }

    ctx.body = {
        value: {
            tracks
        }
    };
});

router.post("/api/v1/users/me/squawks", async (ctx) => {
    if (ctx.isUnauthenticated()) {
        ctx.response.status = 401;
        return;
    }

    if (!(ctx.request.body.value?.length > 0) || ctx.request.body.value?.length > 13) {
        ctx.response.status = 400;
        return;
    }

    const userId = ctx.state.user.id;
    const timestamp = moment().unix();
    const buf = Buffer.alloc(12);
    buf.writeBigUInt64BE(BigInt(ctx.state.user.id));
    buf.writeUInt32BE(timestamp, 8);

    const usid = base62.encode(buf);
    const squawkId = timestamp.toString(16).padStart(8, "0");
    const tableClient: TableClient = ctx.deps.tableClient;
    const entity = {
        partitionKey: `twitter_${userId}`,
        rowKey: `squawk_${squawkId}`,
        userId,
        usid
    };

    for (let i = 0; i < ctx.request.body.value?.length; i++) {
        (entity as any)[`track_${i}`] = ctx.request.body.value[i];
    }

    const upsertResp = await tableClient.createEntity(entity);

    ctx.response.status = 201;
});

export default router;