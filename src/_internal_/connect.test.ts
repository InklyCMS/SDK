import { describe, expect, test, vi } from "vitest";
import { op, serializeWhereCondition } from "./synt/condition";
import { InklyConnection } from "./connect";

type TestMyArticle = {
    id: string,
    slug: string,
    title: string,
    content: string,
    tags: Array<string>,
    meta: {
        readCount: number,
        likeCount: number
    }
}

vi.stubGlobal('fetch', vi.fn());

describe("content fetching", ()=>{

    test("should correctly make fetch call to API endpoint when getById is called", async ()=>{
        let mockedFetch = vi.mocked(fetch).mockImplementationOnce(async ()=>{
            return {
                json: async ()=>[{}],
                text: async ()=>vi.fn(),
                ok: true,
                bodyUsed: false
            } as any
        });

        let inkly = new InklyConnection({
            authToken: 'token',
            projectSlug: 'proj-id'
        });

        let articles = inkly.content<TestMyArticle>('myArticles');

        let specificArticle = await articles.getById('random-article-id');

        expect(mockedFetch).toHaveBeenCalledWith("https://connect.inkly.cc/content/proj-id/myArticles/query?iql=%22id%22%3D%22random-article-id%22&limit=1", {
            headers: new Headers({
                "x-inkly-auth-token": "token"
            })
        });

        expect(specificArticle).toBeDefined();

        mockedFetch.mockClear();
    });

    test("should correctly make fetch call to API endpoint when getFirstWhere is called", async ()=>{
        let mockedFetch = vi.mocked(fetch).mockImplementationOnce(async ()=>{
            return {
                json: async ()=>[{}],
                text: async ()=>vi.fn(),
                ok: true,
                bodyUsed: false
            } as any
        });

        let inkly = new InklyConnection({
            authToken: 'token',
            projectSlug: 'proj-id'
        });

        let articles = inkly.content<TestMyArticle>('myArticles');

        let specificArticle = await articles.getFirstWhere({
            slug: 'my-article',
            tags: op.contains('how-to')
        });

        expect(mockedFetch).toHaveBeenCalledWith("https://connect.inkly.cc/content/proj-id/myArticles/query?iql=%22slug%22%3D%22my-article%22%26%22tags%22%3C-%22how-to%22&limit=1", {
            headers: new Headers({
                "x-inkly-auth-token": "token"
            })
        });

        expect(specificArticle).toBeDefined();

        mockedFetch.mockClear();
    });

    test("should correctly make fetch call to API endpoint with limit when getAllWhere(,13) is called", async ()=>{
        let mockedFetch = vi.mocked(fetch).mockImplementationOnce(async ()=>{
            return {
                json: async ()=>[{}],
                text: async ()=>vi.fn(),
                ok: true,
                bodyUsed: false
            } as any
        });

        let inkly = new InklyConnection({
            authToken: 'token',
            projectSlug: 'proj-id'
        });

        let articles = inkly.content<TestMyArticle>('myArticles');

        let matches = await articles.getAllWhere({
            slug: 'my-article',
            tags: op.contains('how-to')
        }, 13);

        expect(mockedFetch).toHaveBeenCalledWith("https://connect.inkly.cc/content/proj-id/myArticles/query?iql=%22slug%22%3D%22my-article%22%26%22tags%22%3C-%22how-to%22&limit=13", {
            headers: new Headers({
                "x-inkly-auth-token": "token"
            })
        });

        expect(Array.isArray(matches)).toBe(true);

        mockedFetch.mockClear();
    });

    test("should correctly make fetch call to API endpoint with limit when getAll(55) is called", async ()=>{
        let mockedFetch = vi.mocked(fetch).mockImplementationOnce(async ()=>{
            return {
                json: async ()=>[{}],
                text: async ()=>vi.fn(),
                ok: true,
                bodyUsed: false
            } as any
        });

        let inkly = new InklyConnection({
            authToken: 'token',
            projectSlug: 'proj-id'
        });

        let articles = inkly.content<TestMyArticle>('myArticles');

        let matches = await articles.getAll(55);

        expect(mockedFetch).toHaveBeenCalledWith("https://connect.inkly.cc/content/proj-id/myArticles/query?limit=55", {
            headers: new Headers({
                "x-inkly-auth-token": "token"
            })
        });

        expect(Array.isArray(matches)).toBe(true);

        mockedFetch.mockClear();
    });

    test("should correctly make fetch call to API endpoint when getAllWhere is called", async ()=>{
        let mockedFetch = vi.mocked(fetch).mockImplementationOnce(async ()=>{
            return {
                json: async ()=>[{}],
                text: async ()=>vi.fn(),
                ok: true,
                bodyUsed: false
            } as any
        });

        let inkly = new InklyConnection({
            authToken: 'token',
            projectSlug: 'proj-id'
        });

        let articles = inkly.content<TestMyArticle>('myArticles');

        let matches = await articles.getAllWhere({
            slug: 'my-article',
            tags: op.contains('how-to')
        });

        expect(mockedFetch).toHaveBeenCalledWith("https://connect.inkly.cc/content/proj-id/myArticles/query?iql=%22slug%22%3D%22my-article%22%26%22tags%22%3C-%22how-to%22&limit=inf", {
            headers: new Headers({
                "x-inkly-auth-token": "token"
            })
        });

        expect(Array.isArray(matches)).toBe(true);

        mockedFetch.mockClear();
    });

    test("should correctly make fetch call to API endpoint when getAll is called", async ()=>{
        let mockedFetch = vi.mocked(fetch).mockImplementationOnce(async ()=>{
            return {
                json: async ()=>[{}],
                text: async ()=>vi.fn(),
                ok: true,
                bodyUsed: false
            } as any
        });

        let inkly = new InklyConnection({
            authToken: 'token',
            projectSlug: 'proj-id'
        });

        let articles = inkly.content<TestMyArticle>('myArticles');

        let matches = await articles.getAll();

        expect(mockedFetch).toHaveBeenCalledWith("https://connect.inkly.cc/content/proj-id/myArticles/query?limit=inf", {
            headers: new Headers({
                "x-inkly-auth-token": "token"
            })
        });

        expect(Array.isArray(matches)).toBe(true);

        mockedFetch.mockClear();
    });
});

describe("bucket asset fetching", ()=>{

    test("should correctly make fetch call to API endpoint when getById is called", async ()=>{
        let mockedFetch = vi.mocked(fetch).mockImplementationOnce(async ()=>{
            return {
                json: async ()=>[{}],
                text: async ()=>vi.fn(),
                ok: true,
                bodyUsed: false
            } as any
        });

        let inkly = new InklyConnection({
            authToken: 'token',
            projectSlug: 'proj-id'
        });

        let assets = inkly.assets('uploads');

        let specificAsset = await assets.getById('random-article-id');

        expect(mockedFetch).toHaveBeenCalledWith("https://connect.inkly.cc/bucket/proj-id/uploads/query?iql=%22id%22%3D%22random-article-id%22&limit=1", {
            headers: new Headers({
                "x-inkly-auth-token": "token"
            })
        });

        expect(specificAsset).toBeDefined();

        mockedFetch.mockClear();
    });

    test("should correctly make fetch call to API endpoint when getFirstWhere is called", async ()=>{
        let mockedFetch = vi.mocked(fetch).mockImplementationOnce(async ()=>{
            return {
                json: async ()=>[{}],
                text: async ()=>vi.fn(),
                ok: true,
                bodyUsed: false
            } as any
        });

        let inkly = new InklyConnection({
            authToken: 'token',
            projectSlug: 'proj-id'
        });

        let assets = inkly.assets('uploads');

        let specificAsset = await assets.getFirstWhere({
            id: 'my-article',
        });

        expect(mockedFetch).toHaveBeenCalledWith("https://connect.inkly.cc/bucket/proj-id/uploads/query?iql=%22id%22%3D%22my-article%22&limit=1", {
            headers: new Headers({
                "x-inkly-auth-token": "token"
            })
        });

        expect(specificAsset).toBeDefined();

        mockedFetch.mockClear();
    });

    test("should correctly make fetch call to API endpoint with limit when getAllWhere(,13) is called", async ()=>{
        let mockedFetch = vi.mocked(fetch).mockImplementationOnce(async ()=>{
            return {
                json: async ()=>[{}],
                text: async ()=>vi.fn(),
                ok: true,
                bodyUsed: false
            } as any
        });

        let inkly = new InklyConnection({
            authToken: 'token',
            projectSlug: 'proj-id'
        });

        let assets = inkly.assets('uploads2');

        let matches = await assets.getAllWhere({
            id: 'my-article'
        }, 13);

        expect(mockedFetch).toHaveBeenCalledWith("https://connect.inkly.cc/bucket/proj-id/uploads2/query?iql=%22id%22%3D%22my-article%22&limit=13", {
            headers: new Headers({
                "x-inkly-auth-token": "token"
            })
        });

        expect(Array.isArray(matches)).toBe(true);

        mockedFetch.mockClear();
    });

    test("should correctly make fetch call to API endpoint with limit when getAll(55) is called", async ()=>{
        let mockedFetch = vi.mocked(fetch).mockImplementationOnce(async ()=>{
            return {
                json: async ()=>[{}],
                text: async ()=>vi.fn(),
                ok: true,
                bodyUsed: false
            } as any
        });

        let inkly = new InklyConnection({
            authToken: 'token',
            projectSlug: 'proj-id'
        });

        let assets = inkly.assets('uploads2');

        let matches = await assets.getAll(55);

        expect(mockedFetch).toHaveBeenCalledWith("https://connect.inkly.cc/bucket/proj-id/uploads2/query?limit=55", {
            headers: new Headers({
                "x-inkly-auth-token": "token"
            })
        });

        expect(Array.isArray(matches)).toBe(true);

        mockedFetch.mockClear();
    });

    test("should correctly make fetch call to API endpoint when getAllWhere is called", async ()=>{
        let mockedFetch = vi.mocked(fetch).mockImplementationOnce(async ()=>{
            return {
                json: async ()=>[{}],
                text: async ()=>vi.fn(),
                ok: true,
                bodyUsed: false
            } as any
        });

        let inkly = new InklyConnection({
            authToken: 'token',
            projectSlug: 'proj-id'
        });

        let assets = inkly.assets('uploads2');

        let matches = await assets.getAllWhere({
            id: 'my-article'
        });

        expect(mockedFetch).toHaveBeenCalledWith("https://connect.inkly.cc/bucket/proj-id/uploads2/query?iql=%22id%22%3D%22my-article%22&limit=inf", {
            headers: new Headers({
                "x-inkly-auth-token": "token"
            })
        });

        expect(Array.isArray(matches)).toBe(true);

        mockedFetch.mockClear();
    });

    test("should correctly make fetch call to API endpoint when getAll is called", async ()=>{
        let mockedFetch = vi.mocked(fetch).mockImplementationOnce(async ()=>{
            return {
                json: async ()=>[{}],
                text: async ()=>vi.fn(),
                ok: true,
                bodyUsed: false
            } as any
        });

        let inkly = new InklyConnection({
            authToken: 'token',
            projectSlug: 'proj-id'
        });

        let assets = inkly.assets('uploads2');

        let matches = await assets.getAll();

        expect(mockedFetch).toHaveBeenCalledWith("https://connect.inkly.cc/bucket/proj-id/uploads2/query?limit=inf", {
            headers: new Headers({
                "x-inkly-auth-token": "token"
            })
        });

        expect(Array.isArray(matches)).toBe(true);

        mockedFetch.mockClear();
    });
})