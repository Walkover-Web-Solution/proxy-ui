// Checks the actual public example without making provider or network requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const source = fs.readFileSync(
    path.resolve(__dirname, '../../apps/36-blocks/src/app/website/docs/widget-example.ts'),
    'utf8'
);
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports: exportsObject,
});
const example = exportsObject.WIDGET_EXAMPLE;

function executeExample() {
    const status = { textContent: '' };
    let config;
    const context = vm.createContext({
        document: { getElementById: (id) => (id === 'auth-status' ? status : null) },
        window: {
            initVerification: (configuration) => {
                config = configuration;
            },
        },
    });
    const inlineScript = example.match(/<script>([\s\S]*?)<\/script>/)[1];
    vm.runInContext(inlineScript, context);
    const onload = example.match(/onload="([^"]+)"/)[1];
    vm.runInContext(onload, context);
    return { status, config };
}

test('public example loads the built asset and initializes authorization at the matching mount point', () => {
    const { config } = executeExample();
    assert.match(example, /src="WIDGET_ORIGIN\/assets\/proxy-auth\/proxy-auth.js"/);
    assert.equal(config.type, 'authorization');
    assert.equal(config.theme, 'system');
    assert.ok(example.includes(`id="${config.referenceId}"`));
    assert.equal(typeof config.success, 'function');
});

test('public callbacks report completion and failure without exposing callback payloads', () => {
    const { status, config } = executeExample();
    config.success({ token: 'PRIVATE_TEST_TOKEN' });
    assert.match(status.textContent, /Authentication completed/);
    assert.ok(!status.textContent.includes('PRIVATE_TEST_TOKEN'));
    config.failure({ secret: 'PRIVATE_TEST_TOKEN' });
    assert.match(status.textContent, /Authentication failed/);
    assert.ok(!status.textContent.includes('PRIVATE_TEST_TOKEN'));
});
