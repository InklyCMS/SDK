

export class InklyError extends Error {
    public readonly reason?:string;
    public readonly cause?:Error;

    constructor(message?:string, meta?:{reason?:string, cause?:Error}) {
        super(message);
        this.name = this.constructor.name;
        this.reason = meta?.reason;
        this.cause = meta?.cause;
        Error.captureStackTrace(this, this.constructor);
    }
}