// eslint-disable-next-line no-undef
module.exports = {
    transform: {
        '^.+\\.ts?$': [
            'ts-jest',
            {
                tsconfig: './tsconfig.library.json',
                astTransformers: { before: ['<rootDir>/jest.transformer.js'] },
            },
        ],
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    moduleNameMapper: { '\\.(html|png)$': '<rootDir>/jest.htmlStub.js' },
}
