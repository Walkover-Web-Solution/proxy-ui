'use strict';

const webpack = require('webpack');
let customEnvConfig = require('dotenv')?.config()?.parsed || {};

function stringifyValues(object = {}) {
    return Object.entries(object).reduce((acc, curr) => ({ ...acc, [`${curr[0]}`]: JSON.stringify(curr[1]) }), {});
}
customEnvConfig = { ...stringifyValues(process.env), ...stringifyValues(customEnvConfig) };

// const CopyWebpackPlugin = require('copy-webpack-plugin');

const SILENCE_SASS_DEPRECATIONS = ['import', 'mixed-decls', 'global-builtin', 'color-functions'];
const SASS_OPTIONS = { silenceDeprecations: SILENCE_SASS_DEPRECATIONS, quietDeps: true };

/**
 * Custom webpack configuration
 */
function patchSassLoader(use) {
    if (!Array.isArray(use)) return;
    use.forEach((entry) => {
        if (entry && typeof entry === 'object' && entry.loader && entry.loader.includes('sass-loader')) {
            entry.options = entry.options || {};
            entry.options.sassOptions = entry.options.sassOptions || {};
            entry.options.sassOptions.silenceDeprecations = SILENCE_SASS_DEPRECATIONS;
        }
    });
}

function patchRules(rules) {
    if (!Array.isArray(rules)) return;
    rules.forEach((rule) => {
        if (!rule) return;
        patchSassLoader(rule.use);
        if (rule.oneOf) patchRules(rule.oneOf);
        if (rule.rules) patchRules(rule.rules);
    });
}

module.exports = (config) => {
    if (config.module && config.module.rules) {
        patchRules(config.module.rules);
    }

    config.plugins = [
        ...(config.plugins || []),
        new webpack.DefinePlugin({ 'process.env': customEnvConfig }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
    ];

    return config;
};
