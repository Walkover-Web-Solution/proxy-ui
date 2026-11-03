const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, copyFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

test('environment generation reports presence without leaking credential prefixes', () => {
    const root = mkdtempSync(path.join(tmpdir(), '36blocks-env-'));
    try {
        mkdirSync(path.join(root, 'tools'));
        mkdirSync(path.join(root, 'apps/36-blocks-widget/src/environments'), { recursive: true });
        copyFileSync(path.resolve(__dirname, '../set-env.js'), path.join(root, 'tools/set-env.js'));
        const secret = 'SYNTHETIC-TEST-SECRET-not-a-real-credential';
        const result = spawnSync(process.execPath, [path.join(root, 'tools/set-env.js'), '--auth'], {
            encoding: 'utf8',
            env: {
                DEBUG_SET_ENV: 'true',
                AUTH_UI_ENCODE_KEY: secret,
                AUTH_UI_IV_KEY: secret,
                AUTH_API_ENCODE_KEY: secret,
                AUTH_API_IV_KEY: secret,
                HCAPTCHA_SITE_KEY: secret,
                SEND_OTP_AUTH_KEY: secret,
            },
        });
        assert.equal(result.status, 0);
        const output = result.stdout + result.stderr;
        assert.ok(output.includes('AUTH_UI_ENCODE_KEY = SET'));
        assert.ok(!output.includes(secret));
        assert.ok(!output.includes(secret.substring(0, 8)));
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});
