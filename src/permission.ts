import { Request } from "express";

export function isAdmin( req: Request ) {
    const admin_token = process.env.ADMIN_TOKEN;
    if( !admin_token )
        return false;   // not set up

    // auth token as a query parameter?
    if( req.query.auth === admin_token )
        return true;

    // auth token as Authorization header?
    const [ bearer, token ] = req.headers?.authorization?.split(/\s+/) ?? [];
    return bearer?.toLowerCase() === "bearer" && token === admin_token;
}