// eslint-disable-next-line no-undef
module.exports = {
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
    setupFiles: ['<rootDir>/tests/engine/globalThisSetup.ts'],
}
