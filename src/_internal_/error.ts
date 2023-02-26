

export class InklyError extends Error {
    public readonly reason?:string;
    public readonly cause?:Error;

    constructor(message?:string, meta?:{reason?:string, cause?:Error}) {
        super(message);
        this.name = this.constructor.name;
        this.reason = meta?.reason;
        this.cause = meta?.cause;
        if ('captureStackTrace' in Error) Error.captureStackTrace(this, this.constructor);
    }

    static elaborate(error:InklyError|Error){
        console.group('InklyError Elaborate:');
        console.error(error);
        console.groupEnd();

        const tryParseMessage = (text:string)=>{
            try { return JSON.parse(text).message ?? text }
            catch(e) { return text }
        }

        if (error instanceof InklyError && !!error.reason){
            return `${error.message}: \n${tryParseMessage(error.reason)}`
        }
        if (error instanceof Error){
            if ("cause" in error){
                let errorCause = error.cause as Error;
                return `${error.message}: ${"message" in errorCause ? tryParseMessage(errorCause.message) : (errorCause as Error).toString()}`
            }
            return tryParseMessage(error.message);
        }
        return `An unknown error has occured:\n${error}`
    }
}