import type { Config } from 'jest'

const jestConfig: Config = {
    testTimeout: 30_000,
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.tests.json',
                astTransformers: { before: ['<rootDir>/jest.transformer.js'] },
            },
        ],
    },
    testRegex: '\\.(spec|test)\\.ts$',
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'js'],
    moduleNameMapper: { '\\.(html|png)$': '<rootDir>/jest.htmlStub.js' },
    setupFiles: ['<rootDir>/e2e/engine/globalThisSetup.ts', '<rootDir>/e2e/engine/baseTextureSetup.ts'],
}

export default jestConfig
