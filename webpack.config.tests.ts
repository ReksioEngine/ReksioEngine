import webpack from 'webpack'
import { typeGuard } from './transformers'
import path from 'path'
import * as fs from 'node:fs'

module.exports = (env: any) => ({
    mode: 'production',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'reksioengine.js',
        library: {
            name: 'ReksioEngine',
            type: 'umd',
        },
        globalObject: 'this',
        chunkFormat: false,
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.debug': env.debug === true,
            'process.env.manualTick': env.manualTick,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    configFile: path.resolve(__dirname, 'tsconfig.tests.json'),
                    getCustomTransformers: (program: any) => ({
                        before: [typeGuard(program)],
                    }),
                },
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    externals: fs.readdirSync('node_modules'),
    devServer: {
        stats: {
            assets: false,
            hash: false,
            chunks: false,
            errors: true,
            errorDetails: true,
        },
        overlay: true
    },
})
