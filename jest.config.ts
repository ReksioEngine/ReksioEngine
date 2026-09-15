import type { Config } from 'jest'

const jestConfig: Config = {
    watch: false,
    preset: 'ts-jest/presets/js-with-ts',
    testTimeout: 30_000,
    transform: {
        '^.+\\.ts$': ['ts-jest', { compiler: 'ts-patch/compiler', tsconfig: 'tsconfig.tests.json' }],
        '^.+\\.html?$': 'jest-html-loader',
    },
    testRegex: '\\.(spec|test)\\.ts$',
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'js'],
    setupFiles: ['<rootDir>/tests/engine/globalThisSetup.ts']
}

export default jestConfig
