
export function parseUrl(url:string) {
    if (url.startsWith("/")) throw new Error('Url must be absolute');
    if (!url.includes("://")){
        url = "https://" + url;
    }
    return new URL(url);
}