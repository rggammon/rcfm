import Router from "koa-router";
import { DefaultState, Context } from 'koa';
import { AzureKeyCredential, SearchClient } from "@azure/search-documents";
import process from "process";

const endpoint = process.env["SEARCH_API_ENDPOINT"];
const apiKey = process.env["SEARCH_API_KEY"];
const indexName = "rcfm-track-index";

if (!endpoint || !apiKey) {
    console.error("Missing rcfm environment search settings");
    process.exit(1);
}

const router = new Router<DefaultState, Context>();

const searchClient = new SearchClient<any>(endpoint, indexName, new AzureKeyCredential(apiKey));

router.get(`/api/v1/search`, async (ctx) => {
    let searchOptions = {
        includeTotalCount: true,
        select: ["title", "src"]
    };

    let results = [];
    let searchResults = await searchClient.search("*", searchOptions);
    for await (const result of searchResults.results) {
        results.push(result);
    }
    
    ctx.body = results;
});

export default router;