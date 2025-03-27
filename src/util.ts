import { Request } from "express";

export function prettyJSON(obj:any) {
    return JSON.stringify(obj,null,4);
}

export function baseUrl( req: Request ) {
    return (req.protocol + "://" + req.get('host')).toLowerCase();
}