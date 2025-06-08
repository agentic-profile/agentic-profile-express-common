import {
    Response,
    Request
} from "express";
import { Resolver } from "did-resolver";
import {
    b64u,
    ClientAgentSession,
    ClientAgentSessionStore,
    createChallenge,
    handleAuthorization,
} from "@agentic-profile/auth";


/**
  * If an authorization header is provided, then an attemot to resolve an agent session is made,
  * otherwise a 401 response with a new challenge in the WWW-Authenticate header.
  * @returns a ClientAgentSession, or null if request handled by 401/challenge
  * @throws {Error} if authorization header is invalid.  If authorization is expired or not
  *   found, then no error is thrown and instead a new challenge is issued.
  */ 
export async function resolveAgentSession(
    req: Request,
    res: Response,
    store: ClientAgentSessionStore,
    didResolver: Resolver
): Promise<ClientAgentSession | null> {
    const { authorization } = req.headers;
    if( authorization ) {
        const agentSession = await handleAuthorization( authorization, store, didResolver );
        if( agentSession )
            return agentSession;
    }

    const challenge = await createChallenge( store );
    res.status(401)
        .set('WWW-Authenticate', `Agentic ${b64u.objectToBase64Url(challenge)}`)
        .end();
    return null;  
}
