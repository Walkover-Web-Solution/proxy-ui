'use strict';

/**
 * Prebuild script: generates env-variables.ts for both apps from environment variables.
 * Replaces the webpack DefinePlugin({ 'process.env': ... }) pattern.
 *
 * Usage:
 *   node tools/set-env            # reads .env file + process.env
 *   node tools/set-env --proxy    # only proxy app
 *   node tools/set-env --auth     # only proxy-auth app
 */

const fs = require('fs');
const path = require('path');

// Load .env file if present (same logic as webpack.config.js used dotenv)
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not available, rely solely on process.env
}

const env = process.env;
const root = path.resolve(__dirname, '..');

const isCI = env['CI'] === 'true' || env['NODE_ENV'] === 'production' || !!env['AWS_BRANCH'];
const missingKeys = [];

// Debug logging for AWS build troubleshooting
const DEBUG = isCI || env['DEBUG_SET_ENV'] === 'true';
if (DEBUG) {
    console.log('[set-env DEBUG] Environment detection:');
    console.log(`  CI: ${env['CI']}`);
    console.log(`  NODE_ENV: ${env['NODE_ENV']}`);
    console.log(`  AWS_BRANCH: ${env['AWS_BRANCH']}`);
    console.log(`  isCI: ${isCI}`);
}

function get(key, fallback = undefined) {
    const value = env[key] !== undefined ? env[key] : fallback;
    
    // Debug logging to track credential source
    if (DEBUG) {
        if (value !== undefined) {
            // Show first 8 chars for verification without exposing full secrets
            const preview = typeof value === 'string' && value.length > 8 
                ? `${value.substring(0, 8)}...` 
                : '***SET***';
            console.log(`[set-env DEBUG] ${key} = ${preview}`);
        } else {
            console.log(`[set-env DEBUG] ${key} = MISSING`);
        }
    }
    
    if (value === undefined) {
        if (isCI) missingKeys.push(key);
        else console.warn(`[set-env] WARNING: env var "${key}" is not set`);
    }
    return value;
}

function assertNoMissingKeys() {
    if (missingKeys.length > 0) {
        console.error(`[set-env] FATAL: missing required env vars: ${missingKeys.join(', ')}`);
        process.exit(1);
    }
}

// ── proxy app ──────────────────────────────────────────────────────────────
function writeProxyEnv() {
    const content = `export const envVariables = {
    firebaseConfig: {
        apiKey: ${JSON.stringify(get('FIREBASE_CONFIG_API_KEY'))},
        authDomain: ${JSON.stringify(get('FIREBASE_CONFIG_AUTH_DOMAIN'))},
        projectId: ${JSON.stringify(get('FIREBASE_CONFIG_PROJECT_ID'))},
        storageBucket: ${JSON.stringify(get('FIREBASE_CONFIG_STORAGE_BUCKET'))},
        messagingSenderId: ${JSON.stringify(get('FIREBASE_CONFIG_MESSAGING_SENDER_ID'))},
        appId: ${JSON.stringify(get('FIREBASE_CONFIG_APP_ID'))},
    },

    // VIASOCKET INTERFACE
    interfaceScriptUrl: ${JSON.stringify(get('INTERFACE_SCRIPT_URL'))},
};
`;
    const outPath = path.join(root, 'apps/36-blocks/src/environments/env-variables.ts');
    fs.writeFileSync(outPath, content, 'utf8');
    console.log(`[set-env] Written: ${outPath}`);
}

// ── proxy-auth app ─────────────────────────────────────────────────────────
function writeProxyAuthEnv() {
    const content = `export const envVariables = {
    uiEncodeKey: ${JSON.stringify(get('AUTH_UI_ENCODE_KEY'))},
    uiIvKey: ${JSON.stringify(get('AUTH_UI_IV_KEY'))},
    apiEncodeKey: ${JSON.stringify(get('AUTH_API_ENCODE_KEY'))},
    apiIvKey: ${JSON.stringify(get('AUTH_API_IV_KEY'))},
    hCaptchaSiteKey: ${JSON.stringify(get('HCAPTCHA_SITE_KEY'))},
    sendOtpAuthKey: ${JSON.stringify(get('SEND_OTP_AUTH_KEY'))},
};
`;
    const outPath = path.join(root, 'apps/36-blocks-widget/src/environments/env-variables.ts');
    fs.writeFileSync(outPath, content, 'utf8');
    console.log(`[set-env] Written: ${outPath}`);
}

// ── run ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const onlyProxy = args.includes('--proxy');
const onlyAuth = args.includes('--auth');

if (!onlyAuth) writeProxyEnv();
if (!onlyProxy) writeProxyAuthEnv();
assertNoMissingKeys();