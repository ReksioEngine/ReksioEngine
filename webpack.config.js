const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.ts',
    mode: 'development',
    devServer: {
        contentBase: 'dist',
        port: 3000
    },
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{
                from: 'static/assets',
                to: 'assets'
            }]
        }),
        new HTMLWebpackPlugin({
            template: 'static/index.html',
            filename: 'index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.(def)$/i,
                use: [
                    {
                        loader: 'raw-loader',
                    },
                ]
            },
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
}