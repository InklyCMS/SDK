import type { InklySession } from "../types";
import { fetch } from "undici";
import { parseUrl } from "./utils/url";
import { INKLY_ENDPOINT } from "./utils/defaults";
import { InklyError } from "./error";
import { InklyProject } from "./project";

type SessionCreationOptions = {
    authToken: string,
    endpoint?: string
}

type ProjectCreationOptions = {
    authToken: string,
    endpoint?: string
}

export class InklyActivity {

    static async createSession(options:SessionCreationOptions):Promise<InklySession> {

        const endpoint = parseUrl(options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/sessions/create";

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", options.authToken);

        const endpointResponse = await fetch(endpoint.href, { headers });

        if (!endpointResponse.ok) throw new InklyError("Failed to create session", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        return await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to create session", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as InklySession;
        
    }

    static async createProject(options:ProjectCreationOptions):Promise<Partial<InklyProject>> {

        const endpoint = parseUrl(options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/projects/create";

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", options.authToken);

        const endpointResponse = await fetch(endpoint.href, { headers });

        if (!endpointResponse.ok) throw new InklyError("Failed to create project", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        let response = await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to create project", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as Partial<InklyProject>;

        if ("id" in response) {
            return response;
        }

        throw new InklyError("Failed to create project", {
            reason: `Did not receive an id from endpoint: ${JSON.stringify(response)}`
        });
        
    }

}