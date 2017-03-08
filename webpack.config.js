const path = require('path');
const webpack = require('webpack');

const config = {
    entry: './js/index.js',

    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'build'),
        publicPath: 'build'
    },

    resolve: {
        extensions: ['.js']
    },

    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: ['babel-loader', 'eslint-loader']
        }]
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': { 'NODE_ENV': JSON.stringify(process.env.NODE_ENV) }
        })
    ]
};

if (process.env.NODE_ENV !== 'production') {
    config.devtool = 'cheap-module-source-map';
}

module.exports = config;
