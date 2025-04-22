import webpack from 'webpack'
import { typeGuard } from './transformers'
import path from 'path'
import CopyPlugin from 'copy-webpack-plugin'
import * as fs from 'node:fs'

module.exports = (env: any) => ({
    entry: './src/index.ts',
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
        new CopyPlugin({
            patterns: [
                {
                    from: 'static/library-package.json',
                    to: 'package.json',
                    transform: (input) => {
                        const pkg = JSON.parse(fs.readFileSync('./package.json').toString());

                        const libraryManifest = JSON.parse(input.toString())
                        libraryManifest.dependencies = pkg.dependencies || {}
                        libraryManifest.version = pkg.version || {}

                        return JSON.stringify(libraryManifest, null, "    ")
                    }
                },
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    configFile: path.resolve(__dirname, 'tsconfig.library.json'),
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
})
