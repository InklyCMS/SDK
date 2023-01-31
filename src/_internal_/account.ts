import type { IInklyAccount, InklySession } from "../types";
import { INKLY_ENDPOINT } from "./utils/defaults";
import { parseUrl } from "./utils/url";
import { InklyError } from "./error";

type InklyAccountActionOptions = {
    authToken: string,
    endpoint?: string
}

export class InklyAccount implements IInklyAccount {

    id: string;
    firstName: string;
    lastName?: string | undefined;
    email?: string | undefined;
    username: string;
    createdAt: Date;
    banned?: { until?: Date | undefined; reason: string; } | undefined;
    accessibleProjects: { id: string; fullName: string; iconPath?: string | undefined; }[];

    protected constructor(values:IInklyAccount){
        Object.entries(values).forEach(([k,v]) => {
            this[k] = v;
        });
    }
    
    static async getDetails(options: InklyAccountActionOptions) {
        const endpoint = parseUrl(options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/accounts/getByAuthToken";

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", options.authToken);

        const endpointResponse = await fetch(endpoint, {headers});

        if (!endpointResponse.ok) throw new InklyError("Failed to create session", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        let acc = await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to create session", {
                reason: `Response was not understood. ${endpointResponse.bodyUsed ? '' : await endpointResponse.text()}`,
                cause: e
            });
        }) as IInklyAccount;

        return new InklyAccount(acc);
    }
    
    static async signOut(options:InklyAccountActionOptions) {
        const endpoint = parseUrl(options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/auth/close";

        const headers = new Headers();
        headers.set("X-Inkly-Auth-Token", options.authToken);

        const endpointResponse = await fetch(endpoint, {headers});

        return endpointResponse.ok;
    };

}