export default {
    verbose: true,
    preset: 'ts-jest/presets/default-esm',
    "transformIgnorePatterns": [
        "node_modules/(?!@agentic-profile/common|@noble)"
    ],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    }
}