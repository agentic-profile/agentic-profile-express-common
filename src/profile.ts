import {
    AgenticProfile,
    JWKSet,
    prettyJson
} from "@agentic-profile/common";
import {
    AgenticChallenge,
    resolveVerificationKey,
    signChallenge
} from "@agentic-profile/auth";

import { join } from "path";
import {
    access,
    mkdir,
    readFile,
    writeFile
} from "fs/promises";


type SaveProfileParams = {
    dir: string,
    profile?: AgenticProfile,
    keyring?: JWKSet[]
}

export async function saveProfile({ dir, profile, keyring }: SaveProfileParams) {
    await mkdir(dir, { recursive: true });

    const profilePath = join(dir, "did.json");
    if( profile ) {
        await writeFile(
            profilePath,
            prettyJson( profile ),
            "utf8"
        );
    }

    const keyringPath = join(dir, "keyring.json");
    if( keyring ) {
        await writeFile(
            keyringPath,
            prettyJson( keyring ),
            "utf8"
        );
    }  

    return { profilePath, keyringPath }
}

export async function loadProfileAndKeyring( dir: string ) {
    const profile = await loadProfile( dir );
    const keyring = await loadKeyring( dir );
    return { profile, keyring };
}

export async function loadProfile( dir: string ) {
    return loadJson<AgenticProfile>( dir, "did.json" );
}

export async function loadKeyring( dir: string ) {
    return loadJson<JWKSet[]>( dir, "keyring.json" );
}

export async function loadJson<T>( dir: string, filename: string ): Promise<T | undefined> {
    const path = join( dir, filename );
    if( await fileExists( path ) !== true )
        return undefined;

    const buffer = await readFile( path, "utf-8" );
    return JSON.parse( buffer ) as T;
}

//
// Authentication Helpers
//

type GenerateAuthTokenParams = {
    agentSubtype: string,
    agenticChallenge: AgenticChallenge,
    profileDir: string
}

export async function generateAuthToken({ agentSubtype, agenticChallenge, profileDir }: GenerateAuthTokenParams) {
    const { profile, keyring } = await loadProfileAndKeyring( profileDir );
    if( !profile )
        throw new Error(`Failed to load agentic profile from ${profileDir}/did.json`);
    if( !keyring )
        throw new Error(`Failed to load agentic keyring from ${profileDir}/keyring.json`);
    
    const agentDid = `${profile.id}#agent-${agentSubtype}`;
    const { verificationId, privateJwk } = resolveVerificationKey( agentDid, profile, keyring );
    const attestation = { agentDid, verificationId };
    const { challenge } = agenticChallenge;
    return await signChallenge({ challenge, attestation, privateJwk });
}


//
// General util
//

async function fileExists(path: string): Promise<boolean> {
    try {
        await access(path);
        return true;
    } catch (error) {
        return false;
    }
}