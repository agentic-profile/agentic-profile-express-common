import {
    NextFunction,
    Request, 
    Response
} from "express";

import { signalError } from "./error.js";

export type AsyncMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncMiddleware) => function( req: Request, res: Response, next: NextFunction ) {
    const fnReturn = fn(req,res,next)
    return Promise.resolve(fnReturn).catch( err => {
        signalError(req,res,err);
    });
}

export function baseUrl( req: Request ) {
    return (req.protocol + "://" + req.get('host')).toLowerCase();
}