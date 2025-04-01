import { VerificationMethod } from "did-resolver";
import {
    AgenticProfile,
    AgentService,
    prettyJSON
} from "@agentic-profile/common";
import {
    createEdDsaJwk,
    JWKSet
} from "@agentic-profile/auth";

import { join } from "path";
import {
    access,
    mkdir,
    readFile,
    writeFile
} from "fs/promises";


type ProfileTemplate = {
    name?: string
}

type ServiceTemplate = {
    type: string,
    url: string
}

type Params = {
    template?: ProfileTemplate,
    services: ServiceTemplate[]
}

export async function createAgenticProfile({ template = {}, services }: Params ) {

    const keyring: JWKSet[] = [];
    const service: AgentService[] = [];
    for( const { type, url } of services ) {
        const jwk = await createEdDsaJwk();
        keyring.push( jwk );

        const verificationMethod = {
            id: `#agent-${type}-key-0`,
            type: "JsonWebKey2020",
            publicKeyJwk: jwk.publicJwk
        } as VerificationMethod;

        service.push({
            name: `${type} agent`,
            id: `#agent-${type}`,
            type: `Agentic/${type}`,
            serviceEndpoint: url,
            capabilityInvocation: [
                verificationMethod
            ] 
        });
    };

    const generalJwk = await createEdDsaJwk();
    keyring.push( generalJwk );

    const profile = {
        "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/jws-2020/v1",
            "https://iamagentic.org/ns/agentic-profile/v1"
        ],
        id: "TBD",
        //name: "Atlas",
        ...template,
        verificationMethod: [
            {
                id: `#general-key-0`,
                type: "JsonWebKey2020",
                publicKeyJwk: generalJwk.publicJwk
            } as VerificationMethod
        ],
        service
    } as AgenticProfile;

    return { profile, keyring };
}

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
            prettyJSON( profile ),
            "utf8"
        );
    }

    const keyringPath = join(dir, "keyring.json");
    if( keyring ) {
        await writeFile(
            keyringPath,
            prettyJSON( keyring ),
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
    return loadJson( dir, "did.json" );
}

export async function loadKeyring( dir: string ) {
    return loadJson( dir, "keyring.json" );
}

export async function loadJson( dir: string, filename: string ) {
    const path = join( dir, filename );
    if( await fileExists( path ) !== true )
        return undefined;

    const buffer = await readFile( path, "utf-8" );
    return JSON.parse( buffer );
}

export function resolvePublicKey( profile: AgenticProfile ) {
    const found = profile.verificationMethod?.find(isGeneralVerificationMethod);
    if( !found )
        throw new Error( "Failed to find general verification method from " + profile.verificationMethod );
    if( !!found.publicKeyJwk?.x )
        return found.publicKeyJwk.x;
    else 
        throw new Error( "Verification method missing missing public key: " + found );
}

function isGeneralVerificationMethod( method: VerificationMethod ) {
    const { id, type, publicKeyJwk } = method;
    if( !id )
        return false;
    if( id.startsWith('#agent') )
        return false;
    if( type !== "JsonWebKey2020" )
        return false;
    if( !publicKeyJwk )
        return false;

    return true;
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