import {
    Request, 
    Response
} from "express";
import { inherits } from "util";
import log from "loglevel";
import { prettyJson } from "@agentic-profile/common";


function errorCodeToStatusCode( code: any ) {
    if( !code || !Array.isArray(code) )
        return 500;
    const parts = code as any[];
    if( parts.length === 0 || parts.some(e=>Number.isFinite(e) !== true) )
        return 500;

    let result = parts[0]*100;
    if( parts.length > 1 )
        result += parts[1];

    return result;
}

// Use this method when we have an Error object
export function signalError( req: Request, res: Response, err:any ) {
    console.log( 'signalError', err );
    const { code, details, name, message, stack, statusCode } = err;
    
    // Handle custom error types that have a statusCode property (like ScrapingDogAPIError)
    let httpStatusCode: number;
    if (statusCode && typeof statusCode === 'number') {
        httpStatusCode = statusCode;
    } else {
        httpStatusCode = errorCodeToStatusCode(code);
    }
    
    const failure = {
        code,
        message: message ?? name,
        details: details ?? stack?.split(/\n/).map((e:string)=>e.trim()).slice(0,7)
    }
    logFailure( req,failure, err );
    res.status( httpStatusCode ).json({ failure });
}

export function logFailure( req: Request, failure: any, err?: any ) {
    const auth = (req as any).auth;
    log.error( 'ERROR:', prettyJson({
        url: req.originalUrl,
        headers: req.headers,
        auth,
        body: req.body,
        failure,
        errorMessage: err?.message
    }) );
}

export class ServerError extends Error {
    code: number[];           // Array of HTTP status codes
    details: string[] | undefined;  // Optional technical or support details

    // code: []
    // messagge: Human readable
    // details: [] Tech support understandable
    constructor(code: number[], message: string, details?: string[]) {
        super(message);       // Call the parent class constructor
        Error.captureStackTrace(this, this.constructor); // Attach the stack trace
        this.name = this.constructor.name;  // Set the error name

        this.code = code;     // Assign the provided status code(s)
        this.details = details;  // Assign the provided details
    }
}

// Ensure proper inheritance of Error class in older environments
inherits(ServerError, Error);