/*
import {
    OpaqueChallenge,
    resolveVerificationKey,
    sendAgenticPayload,
    signChallenge
} from "@agentic-profile/auth";
import {
    AgenticProfile,
    DID,
    JWKSet,
} from "@agentic-profile/common";

import { loadProfileAndKeyring } from "./profile.js";

export type SendAuthorizedPayloadParams = {
    challenge: OpaqueChallenge, // usually { id:, secret: } but can be any JSONable object
    method?: "PUT" | "POST",
    payload: any,
    peerAgentUrl: string,       // service endpoint
    profileDir: string,
    type: string,
}

export async function sendAuthorizedPayload({
    challenge,
    method,
    payload,
    peerAgentUrl: url,  // e.g. `http://localhost:${port}/users/2/agent-chats`
    profileDir,         // to load our profile and private keys
    type,
}: SendAuthorizedPayloadParams ) {
    const { profile, keyring } = await loadProfileAndKeyring( profileDir );
    if( !profile )
        throw new Error(`Failed to load agentic profile from ${profileDir}/did.json`);
    if( !keyring )
        throw new Error(`Failed to load agentic keyring from ${profileDir}/keyring.json`);
    
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
    const { verificationId, privateJwk } = resolveVerificationKey( agentDid, profile, keyring );
    const attestation = { agentDid, verificationId };

    const authToken = await signChallenge({ challenge, attestation, privateJwk });
    return sendAgenticPayload({ method, url, authToken, payload });
}
*/
