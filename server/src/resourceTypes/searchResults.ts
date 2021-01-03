export interface SearchResult {
    "score": number;
    "document": {
        id: string;
        name: string;
    };
}
