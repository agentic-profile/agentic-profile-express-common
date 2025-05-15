import {
    Response,
    Request
} from "express";
import { Resolver } from "did-resolver";
import {
    ClientAgentSession,
    ClientAgentSessionStore,
    createChallenge,
    handleAuthorization,
} from "@agentic-profile/auth";
import { prettyJson } from "@agentic-profile/common";


// returns:
// - agent session
// - null if request handled by 401/challenge
// - or throws an Error
export async function resolveAgentSession(
    req: Request,
    res: Response,
    store: ClientAgentSessionStore,
    didResolver: Resolver
): Promise<ClientAgentSession | null> {
    const { authorization } = req.headers;
    if( authorization )
        return await handleAuthorization( authorization, store, didResolver );

    const challenge = await createChallenge( store );
    res.status(401)
        .set('Content-Type', 'application/json')
        .send( prettyJson(challenge) );
    return null;  
}
