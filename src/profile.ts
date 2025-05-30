import {
    AgenticProfile,
    JWKSet,
} from "@agentic-profile/common/schema";
import { prettyJson } from "@agentic-profile/common";

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

export async function loadJson<T>( dir: string, filename: string ): Promise<T> {
    const path = join( dir, filename );
    if( await fileExists( path ) !== true )
        throw new Error(`Failed to load ${path} - file not found`);

    const buffer = await readFile( path, "utf-8" );
    return JSON.parse( buffer ) as T;
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