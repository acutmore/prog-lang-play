const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        bundle: './src/index.js',
        ['output-worker']: './src/output-worker.js'
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['bundle'],
            title: 'Language Playground',
            template: './src/index.html'
        })
    ],
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist')
    }
};
