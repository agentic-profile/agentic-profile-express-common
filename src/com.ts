import {
    Base64Url,
    JWKSet,
    OpaqueChallenge,
    signChallenge,
    util as authUtil
} from "@agentic-profile/auth";
import {
    AgenticProfile,
    AgentService,
    DID,
    FragmentID
} from "@agentic-profile/common";
import {
    VerificationMethod
} from "did-resolver";

import { loadProfileAndKeyring } from "./profile.js";


export type SendAgenticPayloadParams = {
    challenge: OpaqueChallenge, // usually { id:, secret: } but can be any JSONable object
    method?: "PUT" | "POST",
    payload: any,
    peerAgentUrl: string,       // service endpoint
    profileDir: string,
    type: string,
}

export async function sendAgenticPayload({
    challenge,
    method,
    payload,
    peerAgentUrl: url,  // e.g. `http://localhost:${port}/users/2/agent-chats`
    profileDir,         // to load our profile and private keys
    type,
}: SendAgenticPayloadParams ) {
    const { profile, keyring } = await loadProfileAndKeyring( profileDir );
    const agentDid = `${profile.id}#agent-${type}`;
    return signAndSendPayload({ agentDid, challenge, keyring, method, payload, profile, url });
}


export type SignAndSendPayloadParams = {
    agentDid: DID,
    challenge: OpaqueChallenge,
    keyring: JWKSet[],
    method?: "PUT" | "POST",
    payload: any,
    profile: AgenticProfile,
    url: string
}

export async function signAndSendPayload({ agentDid, challenge, keyring, method, payload, profile, url }: SignAndSendPayloadParams ) {
    const { verificationId, privateJwk } = resolveVerification( agentDid, profile, keyring );
    const attestation = { agentDid, verificationId };

    const authToken = await signChallenge({ challenge, attestation, privateJwk });
    return sendAuthorizedPayload({ method, url, authToken, payload });
}

function resolveVerification( agentDid: DID, profile: AgenticProfile, keyring: JWKSet[] ) {
    const agent = profile.service?.find(e=>authUtil.matchingFragmentIds( e.id, agentDid ) ) as AgentService;
    if( !agent )
        throw new Error("Failed to find agent service for " + agentDid );

    for( const idOrMethod of agent.capabilityInvocation ) {
        let verificationId: FragmentID;
        let verificationMethod: VerificationMethod | undefined;

        if( typeof idOrMethod === 'string' ) {
            verificationId = idOrMethod as FragmentID;
            const found = profile.verificationMethod?.find(e=>e.id===verificationId);
            if( !found ) {
                console.log( `INVALID agentic profile, verification method does not resolve for ${agentDid} verification id ${verificationId}` );
                continue;   // invalid AgenticProfile... fix!
            }
            verificationMethod = found;
        } else {
            verificationMethod = idOrMethod as VerificationMethod;
            verificationId = verificationMethod.id;
        }

        if( verificationMethod.type !== "JsonWebKey2020" ) {
            console.log( `Skipping unsupported verification type ${verificationMethod.type} for ${agentDid}` )
            continue;
        }

        const b64uPublicKey = verificationMethod.publicKeyJwk?.x;    // Only for JsonWebKey2020!
        if( !b64uPublicKey )
            throw new Error(`Failed to find public key for ${agentDid} verificationMethod ${verificationId}` );

        const privateJwk = resolvePrivateJwk( keyring, b64uPublicKey );
        if( !privateJwk )
            throw new Error(`Failed to find private key for ${agentDid} public key ${b64uPublicKey}` );

        return { verificationId, privateJwk };
    }

    throw new Error("Failed to find a cap " + agentDid );
}

function resolvePrivateJwk( keyring: JWKSet[], b64uPublicKey: Base64Url ) {
    return keyring.find(e=>e.b64uPublicKey===b64uPublicKey)?.privateJwk;
}

type SendAuthorizedPayloadParams = {
    authToken: string,
    method?: "PUT" | "POST",
    payload: any,
    url: string
}

export async function sendAuthorizedPayload({ method = "PUT", url, authToken, payload }: SendAuthorizedPayloadParams) {
    return fetchJson( url, payload, {
        method,
        headers: {
            "Authorization": 'Agentic ' + authToken,
        },
    });
}

type FetchJsonOptions = {
    method?: "GET" | "PUT" | "POST",
    headers?: any
}

export async function fetchJson( url: string, payload: any, options: FetchJsonOptions = {} ) {
    const config = {
        method: "GET",
        headers: {},
        ...options
    } as any;
    if( !config.body && !!payload ) {
        config.body = JSON.stringify( payload );
        if( !hasHeader( config, "content-type") ) {
            config.headers['Content-Type'] = "application/json";
        }
        if( config.method !== "PUT" && config.method !== "POST" )
            config.method = "POST"
    }
    config.headers["Accept"] = "application/json";

    const response = await fetch( url, config );
    if( !response.ok )
        throw new Error(`Failed to fetch ${url} - ${response.status} ${response.statusText}`)

    const data = await response.json();
    return { data, response };
}

function hasHeader( config: any, type: string ) {
    const headers = config.headers;
    if( !headers )
        return false;
    for( const key in headers )
        if( key.toLowerCase() === type )
            return true;

    return false;
}
