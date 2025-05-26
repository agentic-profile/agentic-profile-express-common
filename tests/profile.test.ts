import os from "os";
import { join } from "path";

import { createAgenticProfile } from "@agentic-profile/common";
import { createEdDsaJwk } from "@agentic-profile/auth";

import {
    loadProfileAndKeyring,
    saveProfile
} from "../src/profile";

describe("Agentic Profile Test", () => {

    test("create", async () => {
        const services = [
            { subtype:"presence", url:"http://example.com/locations" },
            { subtype:"chat", url:"http://example.com/chats" },
        ];
        const { profile, keyring } = await createAgenticProfile({ services, createJwkSet: createEdDsaJwk });
        expect( profile.id ).toBe( "TBD" );

        const dir = join( os.homedir(), ".agentic", "iam", "alpha" );
        await saveProfile({ dir, profile, keyring });

        const loaded = await loadProfileAndKeyring( dir );
        expect( profile ).toEqual( loaded.profile );
        expect( keyring ).toEqual( loaded.keyring );
    });
});