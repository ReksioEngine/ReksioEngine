// eslint-disable-next-line no-undef
module.exports = {
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.tests.json' }],
        '^.+\\.html?$': 'jest-html-loader',
    },
    testRegex: '\\.(spec|test)\\.ts$',
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'js'],
    setupFiles: ['<rootDir>/tests/engine/globalThisSetup.ts'],
}
