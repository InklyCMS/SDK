import type { InklyAccessDetails, IInklyFetcher, InklyWhere } from "../types";
import { InklyError } from "./error";
import { INKLY_ENDPOINT } from "./utils/defaults";
import { parseUrl } from "./utils/url";


type ConnectionConstructorOptions = {
    endpoint?: string,
	projectId: string,
	authToken: string,
}

export class InklyConnection {
    constructor(private readonly options:ConnectionConstructorOptions){}

    async getAccessDetails(): Promise<InklyAccessDetails>{
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/accessDetails";
        endpoint.searchParams.set('projectId', this.options.projectId);

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, { headers });

        if (!endpointResponse.ok) throw new InklyError("Failed to get access details", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to get access details", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as InklyAccessDetails;
    }

    content<T>(collectionName:string):InklyContentFetcher<T> {
        return new InklyContentFetcher<T>(collectionName, this.options);
    }

    assets<T>(bucketName:string):InklyAssetFetcher<T> {
        return new InklyAssetFetcher<T>(bucketName, this.options);
    }
}

export class InklyContentFetcher<T> implements IInklyFetcher<T> {
    constructor(private readonly colletionName:string, private readonly options:ConnectionConstructorOptions){}
    
    async getAll(): Promise<T[]> {
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/content/query";

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, { headers });

        if (!endpointResponse.ok) throw new InklyError(`Failed to get all ${this.colletionName}`, {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError(`Failed to get all ${this.colletionName}`, {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as T[];
    }

    async getAllWhere(condition:InklyWhere<T>): Promise<T[]> {
        throw new Error("Method not implemented.");
    }

    getFirstWhere(condition: InklyWhere<T>): Promise<T> {
        throw new Error("Method not implemented.");
    }
    
    async getById(id: string): Promise<T> {
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/content/query";
        endpoint.searchParams.set("id", id);

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, { headers });

        if (!endpointResponse.ok) throw new InklyError(`Failed to get ${this.colletionName} by id "${id}"`, {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError(`Failed to get ${this.colletionName} by id "${id}"`, {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as T;
    }
}

export class InklyAssetFetcher<T> implements IInklyFetcher<T> {
    constructor(private readonly bucketName:string, private readonly options:ConnectionConstructorOptions){}
    getAll(): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    getAllWhere(): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    getFirstWhere(): Promise<T> {
        throw new Error("Method not implemented.");
    }
    getById(id: string): Promise<T> {
        throw new Error("Method not implemented.");
    }
}