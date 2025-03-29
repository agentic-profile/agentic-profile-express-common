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
import { mkdir, readFile, writeFile } from "fs/promises";


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
    profile: AgenticProfile,
    keyring: JWKSet[]
}

export async function saveProfile({ dir, profile, keyring }: SaveProfileParams) {
    await mkdir(dir, { recursive: true });

    const profilePath = join(dir, "did.json");
    await writeFile(
        profilePath,
        prettyJSON( profile ),
        "utf8"
    );

    const keyringPath = join(dir, "keyring.json");
    await writeFile(
        keyringPath,
        prettyJSON( keyring ),
        "utf8"
    );  

    return { profilePath, keyringPath }
}

export async function loadProfile( dir: string ) {
    let buffer = await readFile( join( dir, "did.json"), "utf-8" );
    const profile = JSON.parse( buffer );

    buffer = await readFile( join( dir, "keyring.json"), "utf-8" );
    const keyring = JSON.parse( buffer );

    return { profile, keyring };
}