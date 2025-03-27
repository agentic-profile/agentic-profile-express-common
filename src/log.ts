import { Request } from "express";
import { prettyJSON } from "./util.js";

export function log( req: Request, failure: any, err?: any ) {
    const auth = (req as any).auth;
    console.error( 'ERROR:', prettyJSON({
        url: req.originalUrl,
        headers: req.headers,
        auth,
        body: req.body,
        failure,
        errorMessage: err?.message
    }) );
}

export function logAxiosResult( axiosResult: any ) {
    const { config, status } = axiosResult;
    const data = axiosResult.data ?? axiosResult.response?.data;
    const { method, url } = config ?? {};

    const request = { method, url, headers: config?.headers, data: config?.data, };
    const response = { status, data };

    console.log( "HTTP summary:", prettyJSON({ request, response }) );
}