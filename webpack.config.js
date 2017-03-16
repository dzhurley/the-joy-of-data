const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
    entry: './js/index.js',

    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'build'),
        publicPath: 'build'
    },

    resolve: {
        extensions: ['.js', '.scss']
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ['babel-loader', 'eslint-loader']
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader!postcss-loader'
                })
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin('style.css'),
        new webpack.DefinePlugin({
            'process.env': { 'NODE_ENV': JSON.stringify(process.env.NODE_ENV) }
        })
    ]
};

if (process.env.NODE_ENV !== 'production') {
    config.devtool = 'cheap-module-source-map';
}

module.exports = config;
