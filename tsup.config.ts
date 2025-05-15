import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/**/*.ts"],
    format: ["cjs", "esm"], // Build for commonJS and ESmodules
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    outDir: "dist",
    target: "esnext",
    external: [
        "loglevel",
        "@agentic-profile/common"
    ]
});