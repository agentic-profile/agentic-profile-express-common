import os from "os";
import { join } from "path";

import {
	createAgenticProfile,
	loadProfile,
	saveProfile
} from "../src/profile";

describe("Agentic Profile Test", () => {

    test("create", async () => {
    	const services = [
    		{ type:"presence", url:"http://example.com/locations" },
    		{ type:"chat", url:"http://example.com/chats" },
    	];
    	const { profile, keyring } = await createAgenticProfile({ services });
        expect( profile.id ).toBe( "TBD" );

        const dir = join( os.homedir(), ".agentic", "iam", "alpha" );
        await saveProfile({ dir, profile, keyring });

        const loaded = await loadProfile( dir );
        expect( profile ).toEqual( loaded.profile );
        expect( keyring ).toEqual( loaded.keyring );
    });
});