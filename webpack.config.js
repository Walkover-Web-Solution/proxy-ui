'use strict';

const webpack = require('webpack');
let customEnvConfig = require('dotenv')?.config()?.parsed || {};

function stringifyValues(object = {}) {
    return Object.entries(object).reduce((acc, curr) => ({ ...acc, [`${curr[0]}`]: JSON.stringify(curr[1]) }), {});
}
customEnvConfig = { ...stringifyValues(process.env), ...stringifyValues(customEnvConfig) };

// const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Custom webpack configuration
 */
module.exports = {
    plugins: [
        new webpack.DefinePlugin({ 'process.env': customEnvConfig }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
    ],
};
