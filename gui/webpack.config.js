const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/index.js',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Language Playground',
            template: './src/index.html'
        })
    ],
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist')
    }
};
