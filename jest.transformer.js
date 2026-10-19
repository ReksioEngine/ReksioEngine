require('ts-node').register({ project: __dirname + '/tsconfig.app.json', transpileOnly: true })
const { typeGuard } = require('./transformers')

module.exports = {
    name: 'method-type-guard',
    version: 2,
    factory: (compiler) => typeGuard(compiler.program),
}
