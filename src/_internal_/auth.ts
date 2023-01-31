import { parseUrl } from "./utils/url";
import { INKLY_ENDPOINT } from "./utils/defaults";
import { InklyError } from "./error";
import type { InklyAuthLinkGenerationResponse } from "../types";

type AuthLinkGenerationOption = {
    expiry: Date,
    appIdentifier: string,
    callbackUrl: string,
    endpoint?: string
}

export class InklyAuth {

    static async generateInklyAuthLink(options:AuthLinkGenerationOption):Promise<string> {

        const endpoint = parseUrl(options.endpoint ?? INKLY_ENDPOINT);
        endpoint.pathname = "/auth/generateLink";
        endpoint.searchParams.set("appIdentifier", options.appIdentifier);
        endpoint.searchParams.set("callbackUrl", options.callbackUrl);
        endpoint.searchParams.set("expiryISO", options.expiry.toISOString());

        const endpointResponse = await fetch( endpoint.href ).catch(e => {
            throw new InklyError("Failed to generate authentication link", {
                reason: `Endpoint response was not as expected. ${endpointResponse?.statusText}`,
                cause: e
            });
        });

        if (!endpointResponse.ok) throw new InklyError("Failed to generate authentication link", {
            reason: await endpointResponse.text().catch(()=>null) ?? endpointResponse.statusText
        });

        const response = await endpointResponse.json().catch(async e => {
            throw new InklyError("Failed to generate authentication link", {
                reason: `Endpoint response was in the expected format: ${endpointResponse.bodyUsed ? '': await endpointResponse.text()}`,
                cause: e
            });
        }) as InklyAuthLinkGenerationResponse;

        if ( ("link" in response) === false ){
            throw new InklyError("Failed to generate authentication link", {
                reason: `Did not receive a link from endpoint: ${JSON.stringify(response)}`
            });
        }

        return response.link;

    }

}