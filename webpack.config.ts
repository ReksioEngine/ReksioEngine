import {
    Program
} from 'typescript'

import HTMLWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import {typeGuard} from './transformers'

module.exports = (env: any) => ({
    entry: './src/index.ts',
    mode: 'development',
    devServer: {
        contentBase: 'dist',
        port: 3000
    },
    devtool: 'source-map',
    plugins: [
        new HTMLWebpackPlugin({
            template: 'static/index.html',
            filename: 'index.html'
        }),
        new webpack.DefinePlugin({
            'process.env.debug': env.debug === true,
        })
    ],
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    getCustomTransformers: (program: Program) => ({
                        before: [typeGuard(program)]
                    })
                }
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
})