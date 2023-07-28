'use strict';

const webpack = require('webpack');
// const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Custom webpack configuration
 */
module.exports = {
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
    ],
};
