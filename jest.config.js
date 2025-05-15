export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
        '^.+\\.(js|ts|tsx)$': 'babel-jest',
    },
    verbose: true,
    "transformIgnorePatterns": [
        "node_modules/(?!@agentic-profile/common|@noble)"
    ],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
}