const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = readFileSync('apps/36-blocks/src/app/panel/layout/theme-preference.ts', 'utf8');
const output = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const loaded = { exports: {} };
vm.runInNewContext(output, { module: loaded, exports: loaded.exports });
const { preferenceFromStored, resolveThemeClass, readStoredUiSettings, UI_SETTINGS_TTL_MS } = loaded.exports;

test('explicit preference wins over a previously resolved class', () => {
    assert.equal(preferenceFromStored({ themePreference: 'system', theme: 'dark-theme' }), 'system');
    assert.equal(preferenceFromStored({ themePreference: 'light', theme: 'dark-theme' }), 'light');
    assert.equal(preferenceFromStored({ themePreference: 'dark' }), 'dark');
});

test('older records that only stored a body class still map to light or dark', () => {
    assert.equal(preferenceFromStored({ theme: 'dark-theme' }), 'dark');
    assert.equal(preferenceFromStored({ theme: 'light-theme' }), 'light');
    assert.equal(preferenceFromStored({}), 'light');
    assert.equal(preferenceFromStored(null), 'light');
    assert.equal(preferenceFromStored({ themePreference: 'sepia' }), 'light');
});

test('system follows the OS scheme and light or dark ignore it', () => {
    assert.equal(resolveThemeClass('light', true), 'light-theme');
    assert.equal(resolveThemeClass('dark', false), 'dark-theme');
    assert.equal(resolveThemeClass('system', true), 'dark-theme');
    assert.equal(resolveThemeClass('system', false), 'light-theme');
});

test('stored settings expire after 30 days and reject corrupt JSON', () => {
    const now = 1_700_000_000_000;
    const fresh = JSON.stringify({
        themePreference: 'system',
        theme: 'light-theme',
        sideNavOpen: false,
        _savedAt: now - 1000,
    });
    const read = readStoredUiSettings(fresh, now, true);
    assert.equal(read.themePreference, 'system');
    assert.equal(read.theme, 'dark-theme');
    assert.equal(read.sideNavOpen, false);

    const expired = JSON.stringify({
        themePreference: 'dark',
        theme: 'dark-theme',
        _savedAt: now - UI_SETTINGS_TTL_MS,
    });
    assert.equal(readStoredUiSettings(expired, now, false), null);
    assert.equal(readStoredUiSettings('{', now, false), null);
    assert.equal(readStoredUiSettings(null, now, false), null);
});

test('the boot script in index.html uses the same storage key and theme names', () => {
    const html = readFileSync('apps/36-blocks/src/index.html', 'utf8');
    assert.match(html, /ui-settings/);
    assert.match(html, /themePreference/);
    assert.match(html, /prefers-color-scheme: dark/);
    assert.match(html, /light-theme/);
    assert.match(html, /dark-theme/);
    assert.match(html, /30 \* 24 \* 60 \* 60 \* 1000/);
});
