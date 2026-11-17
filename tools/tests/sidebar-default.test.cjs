// Run: node --test tools/tests/sidebar-default.test.cjs
// Which workspaces start with the dashboard sidebar collapsed.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function load(relative) {
    const source = readFileSync(path.resolve(__dirname, '../..', relative), 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
    const module = { exports: {} };
    vm.runInNewContext(compiled, { module, exports: module.exports });
    return module.exports;
}

const { shouldCollapseSidebarForEmptyWorkspace: collapse } = load(
    'apps/36-blocks/src/app/panel/layout/sidebar-default.ts'
);
const empty = { clientId: 7, status: 'loaded', total: 0 };

test('a loaded workspace with no blocks starts collapsed', () => {
    assert.equal(collapse(empty, null), true);
});

test('a workspace with blocks keeps the saved sidebar state', () => {
    assert.equal(collapse({ ...empty, total: 1 }, null), false);
    assert.equal(collapse({ ...empty, total: 25 }, null), false);
});

test('loading, failed and denied reads never change the sidebar', () => {
    for (const status of ['idle', 'loading', 'error', 'denied']) {
        assert.equal(collapse({ clientId: 7, status, total: null }, null), false, status);
        assert.equal(collapse({ clientId: 7, status, total: 0 }, null), false, status);
    }
});

test('an unknown workspace or an unknown count does nothing', () => {
    assert.equal(collapse({ clientId: null, status: 'loaded', total: 0 }, null), false);
    assert.equal(collapse({ clientId: 7, status: 'loaded', total: null }, null), false);
});

test('a workspace is handled once, so a sidebar the user opened is not collapsed again', () => {
    assert.equal(collapse(empty, 7), false);
    // A different workspace is handled on its own.
    assert.equal(collapse({ ...empty, clientId: 8 }, 7), true);
});
