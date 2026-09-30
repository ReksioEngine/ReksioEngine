// eslint-disable-next-line no-undef
module.exports = {
    transform: { '^.+\\.ts?$': ['ts-jest', { tsconfig: './tsconfig.library.json' }] },
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
}
