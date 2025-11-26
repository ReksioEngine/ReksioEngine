import { Program } from 'typescript'

import HTMLWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import { typeGuard } from './transformers'
import path from 'path'

module.exports = (env: any) => ({
    entry: './src/devPlayer.ts',
    mode: 'development',
    devServer: {
        contentBase: 'dist',
        port: 3000,
    },
    devtool: 'source-map',
    plugins: [
        new HTMLWebpackPlugin({
            template: 'static/index.html',
            filename: 'index.html',
        }),
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
                    configFile: path.resolve(__dirname, 'tsconfig.app.json'),
                    getCustomTransformers: (program: Program) => ({
                        before: [typeGuard(program)],
                    }),
                },
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
})
