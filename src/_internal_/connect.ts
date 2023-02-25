import type {InklyAccessDetails, IInklyFetcher, InklyWhere, InklySchemaField} from "../types";
import { InklyError } from "./error";
import { op, serializeWhereCondition } from "./synt/condition";
import { INKLY_ENDPOINT } from "./utils/defaults";
import { parseUrl } from "./utils/url";
import {InklyBucket, InklySchema, InklySchemaStat} from "../types";

type ConnectionConstructorOptions = {
    endpoint?: string,
	projectSlug: string,
	authToken: string,
}

export type BaseModel = { id:string, createdAt: Date, updatedAt: Date };
export type ContentModel<T = {}> = BaseModel & T;
export type AssetModel<T = {}> = {
    size:number, 
    mime:string, 
    storageRef:string,
    ext: string,
    fileName: string,
    extras?: T
} & BaseModel;

type SchemaCreationConfig = {
    name?: string,
    reference: string,
    description?: string,
    template?: string
}

type BucketCreationConfig = {
    name?: string,
    reference: string,
}

export class InklyConnection {
    constructor(private readonly options:ConnectionConstructorOptions){}

    async getAccessDetails(): Promise<InklyAccessDetails>{
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/accessDetails";
        endpoint.searchParams.set('projectSlug', this.options.projectSlug);

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

    content<T extends any>(collectionName:string): InklyContentFetcher<ContentModel<T>> {
        return new InklyContentFetcher<ContentModel<T>>(collectionName, this.options);
    }

    assets<T extends any>(bucketName:string): InklyAssetFetcher<AssetModel<T>> {
        return new InklyAssetFetcher<AssetModel<T>>(bucketName, this.options);
    }

    get schema(){
        return new InklySchemaManager(this.options);
    }

    get bucket(){
        return new InklyBucketManager(this.options);
    }
}

export class InklyBucketManager {
    constructor (private options:ConnectionConstructorOptions){}

    async create(config:BucketCreationConfig){
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/bucket/create";
        endpoint.searchParams.set('projectSlug', this.options.projectSlug);

        const headers = new Headers();
        headers.set("Content-Type", 'application/json');

        const endpointResponse = await fetch(endpoint.href, {
            headers,
            method: 'POST',
            body: JSON.stringify({
                name: config.name ?? config.reference,
                reference: config.reference
            })
        });

        if (!endpointResponse.ok) throw new InklyError("Failed to create bucket", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to create bucket", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as InklyBucket;
    }

}

export class InklySchemaManager {
    constructor (private options:ConnectionConstructorOptions){}

    async listAll(){
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/schema/list";
        endpoint.searchParams.set('projectSlug', this.options.projectSlug);

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, {
            headers,
            method: 'GET'
        });

        if (!endpointResponse.ok) throw new InklyError("Failed to list schema", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to list schema", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as Array<InklySchema>;
    }

    async getById(schemaId:string){
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/schema/get";
        endpoint.searchParams.set('projectSlug', this.options.projectSlug);
        endpoint.searchParams.set('schemaId', schemaId);

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, {
            headers,
            method: 'GET'
        });

        if (!endpointResponse.ok) throw new InklyError("Failed to get schema", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to get schema", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as InklySchema;
    }

    async getStatsByRef(schemaRef:string){
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/schema/stats";
        endpoint.searchParams.set('projectSlug', this.options.projectSlug);
        endpoint.searchParams.set('schemaRef', schemaRef);

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, {
            headers,
            method: 'GET'
        });

        if (!endpointResponse.ok) throw new InklyError("Failed to get schema stats", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to get schema stats", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as InklySchemaStat;
    }

    async deleteAllByReference(schemaRef:string){
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/schema/delete";
        endpoint.searchParams.set('projectSlug', this.options.projectSlug);
        endpoint.searchParams.set('schemaRef', schemaRef);

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, {
            headers,
            method: 'DELETE'
        });

        if (!endpointResponse.ok) throw new InklyError("Failed to delete schema", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to delete schema", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as {count:number};
    }

    async deleteById(schemaId:string){
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/schema/delete";
        endpoint.searchParams.set('projectSlug', this.options.projectSlug);
        endpoint.searchParams.set('schemaId', schemaId);

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, {
            headers,
            method: 'DELETE'
        });

        if (!endpointResponse.ok) throw new InklyError("Failed to delete schema", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to delete schema", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as InklySchema;
    }

    async create(config:SchemaCreationConfig){
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/schema/create";
        endpoint.searchParams.set('projectSlug', this.options.projectSlug);

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);
        headers.set("Content-Type", 'application/json');

        const endpointResponse = await fetch(endpoint.href, {
            headers,
            method: 'POST',
            body: JSON.stringify({
                name: config.name ?? config.reference,
                reference: config.reference,
                template: config.template ?? 'custom',
                description: config.description ?? config.name ?? config.reference
            })
        });

        if (!endpointResponse.ok) throw new InklyError("Failed to create schema", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to create schema", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as InklySchema;
    }

    async update(schemaId:string, updatedSchema:Partial<InklySchema>){
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/schema/update";
        endpoint.searchParams.set('projectSlug', this.options.projectSlug);
        endpoint.searchParams.set('schemaId', schemaId);

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);
        headers.set("Content-Type", 'application/json');

        const endpointResponse = await fetch(endpoint.href, {
            headers,
            method: 'PATCH',
            body: JSON.stringify(updatedSchema)
        });

        if (!endpointResponse.ok) throw new InklyError("Failed to update schema", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to update schema", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as InklySchema;
    }

    async deleteField(schemaId:string, fieldRef:string) {
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/schema/deleteField";
        endpoint.searchParams.set('projectSlug', this.options.projectSlug);
        endpoint.searchParams.set('schemaId', schemaId);
        endpoint.searchParams.set('fieldRef', fieldRef);

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, {
            headers,
            method: 'DELETE'
        });

        if (!endpointResponse.ok) throw new InklyError("Failed to delete field", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to delete field", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as InklySchema;
    }

    async updateField(schemaId:string, fieldRef:string, field:InklySchemaField) {
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/schema/updateField";
        endpoint.searchParams.set('projectSlug', this.options.projectSlug);
        endpoint.searchParams.set('schemaId', schemaId);
        endpoint.searchParams.set('fieldRef', fieldRef);

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, {
            headers,
            method: 'PATCH',
            body: JSON.stringify(field)
        });

        if (!endpointResponse.ok) throw new InklyError("Failed to update field", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to update field", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as InklySchema;
    }

}

export class InklyContentFetcher<T extends ContentModel> implements IInklyFetcher<T> {
    constructor(private readonly collectionName:string, private readonly options:ConnectionConstructorOptions){}
    
    async getAll(limit:number=Infinity): Promise<T[]> {
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = `/content/${this.options.projectSlug}/${this.collectionName}/query`;
        endpoint.searchParams.set('limit', limit === Infinity ? 'inf' : limit.toString());

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, { headers });

        if (!endpointResponse.ok) throw new InklyError(`Failed to get all ${this.collectionName}`, {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError(`Failed to get all ${this.collectionName}`, {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as T[];
    }

    async getAllWhere(condition:InklyWhere<T>, limit:number=Infinity): Promise<T[]> {
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = `/content/${this.options.projectSlug}/${this.collectionName}/query`;
        endpoint.searchParams.set('iql', serializeWhereCondition(condition));
        endpoint.searchParams.set('limit', limit === Infinity ? 'inf' : limit.toString());

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, { headers });

        if (!endpointResponse.ok) throw new InklyError(`Failed to get ${limit === 1 ? 'first' : 'all'} ${this.collectionName} based on condition`, {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError(`Failed to get ${limit === 1 ? 'first' : 'all'} ${this.collectionName} based on condition`, {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as T[];
    }

    async getFirstWhere(condition: InklyWhere<T>): Promise<T> {
        let result = await this.getAllWhere(condition, 1);
        return result?.at(0);
    }
    
    async getById(id: string): Promise<T> {
        let result = await this.getAllWhere({
            id: op.equals(id)
        } as any, 1);
        return result?.at(0);
    }
}

export class InklyAssetFetcher<T extends AssetModel> implements IInklyFetcher<T> {
    constructor(private readonly bucketName:string, private readonly options:ConnectionConstructorOptions){}
    
    async getAll(limit:number=Infinity): Promise<T[]> {
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = `/bucket/${this.options.projectSlug}/${this.bucketName}/query`;
        endpoint.searchParams.set('limit', limit === Infinity ? 'inf' : limit.toString());

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, { headers });

        if (!endpointResponse.ok) throw new InklyError(`Failed to get all ${this.bucketName}`, {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError(`Failed to get all ${this.bucketName}`, {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as T[];
    }

    async getAllWhere(condition:InklyWhere<T>, limit:number=Infinity): Promise<T[]> {
        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = `/bucket/${this.options.projectSlug}/${this.bucketName}/query`;
        endpoint.searchParams.set('iql', serializeWhereCondition(condition));
        endpoint.searchParams.set('limit', limit === Infinity ? 'inf' : limit.toString());

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", this.options.authToken);

        const endpointResponse = await fetch(endpoint.href, { headers });

        if (!endpointResponse.ok) throw new InklyError(`Failed to get ${limit === 1 ? 'first' : 'all'} ${this.bucketName} based on condition`, {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError(`Failed to get ${limit === 1 ? 'first' : 'all'} ${this.bucketName} based on condition`, {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as T[];
    }

    async getFirstWhere(condition: InklyWhere<T>): Promise<T> {
        let result = await this.getAllWhere(condition, 1);
        return result?.at(0);
    }
    
    async getById(id: string): Promise<T> {
        let result = await this.getAllWhere({
            id: op.equals(id)
        } as any, 1);
        return result?.at(0);
    }

    async getAssetUrl(idOrAsset:string|T){
        const paramIsString = typeof idOrAsset === "string";
        const asset = typeof idOrAsset === "string" ? await this.getById(idOrAsset) : idOrAsset;

        if (!asset) throw new InklyError(`Failed to getAssetUrl for ${paramIsString ? idOrAsset : idOrAsset.id}`, {
            reason: `Couldn't find the asset`
        });

        const endpoint = parseUrl(this.options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = `/assets/${this.options.projectSlug}/${this.bucketName}/${asset.storageRef}/${asset.fileName}.${asset.ext}`;
        return endpoint
    }

    async getStream(idOrAsset:string|T):Promise<ReadableStream>{
        let resourceLink = await this.getAssetUrl(idOrAsset);
        let response = await fetch(resourceLink);
        return response.body;
    }
}