// Run: node --test tools/tests/return-url.test.cjs
// The post-login return URL helper must only ever accept same-origin relative paths.
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
    vm.runInNewContext(compiled, {
        module,
        exports: module.exports,
        URL,
        URLSearchParams,
        require: () => {
            throw new Error('Unexpected runtime dependency');
        },
    });
    return module.exports;
}

const r = load('libs/utils/src/return-url.ts');
const loose = require('node:assert').deepEqual;

test('safe relative paths are accepted unchanged, including OAuth query strings', () => {
    for (const url of [
        '/app/dashboard',
        '/app',
        '/app/features/manage/12?tab=settings#top',
        '/oauth/authorize?client_id=abc&redirect_uri=http%3A%2F%2Flocalhost%3A33418%2Fcallback&state=x%20y&code_challenge=Zm9v',
        '/widget-preview/ref_123',
        '/%2F%2Fevil.example',
    ]) {
        assert.equal(r.sanitizeReturnUrl(url), url, url);
    }
});

test('anything that could leave the origin is rejected', () => {
    for (const url of [
        '',
        'app/dashboard',
        '//evil.example',
        '//evil.example/app',
        '/\\evil.example',
        '\\\\evil.example',
        '/app\\..\\evil',
        'https://evil.example',
        'http://localhost:4200/app',
        'javascript:alert(1)',
        'data:text/html,hi',
        'mailto:a@b.c',
        '/\t/evil.example',
        '/\n/evil.example',
        '/ /evil.example',
        '/app\u0000',
        ' /app',
        '/app ',
        '/app\u007f',
        '/' + 'a'.repeat(5000),
        null,
        undefined,
        42,
        {},
        ['/app'],
    ]) {
        assert.equal(r.sanitizeReturnUrl(url), null, JSON.stringify(url));
    }
});

test('the login, register and onboarding pages are never a return target', () => {
    for (const url of ['/login', '/login?returnUrl=%2Fapp', '/register', '/onboarding?token=x', '/login/x']) {
        assert.equal(r.sanitizeReturnUrl(url), null, url);
    }
    // A path that only starts with the same letters is fine.
    assert.equal(r.sanitizeReturnUrl('/loginx'), '/loginx');
});

test('only protected app pages are captured when sending someone to sign in', () => {
    for (const url of ['/app/dashboard', '/oauth/authorize?client_id=a', '/widget-preview/abc', '/project']) {
        assert.equal(r.captureReturnUrl(url), url, url);
    }
    for (const url of ['/', '/pricing', '/docs', '/login', '/onboarding', '/application', '//evil.example', null]) {
        assert.equal(r.captureReturnUrl(url), null, String(url));
    }
});

test('query params for the login link are empty unless there is something safe to return to', () => {
    loose(r.returnUrlQueryParams('/oauth/authorize?client_id=a&state=b'), {
        returnUrl: '/oauth/authorize?client_id=a&state=b',
    });
    loose(r.returnUrlQueryParams('/'), {});
    loose(r.returnUrlQueryParams('https://evil.example'), {});
    loose(r.returnUrlQueryParams(undefined), {});
    assert.equal(r.RETURN_URL_PARAM, 'returnUrl');
});

test('the post-login target is the sanitised return URL, otherwise the fallback', () => {
    assert.equal(r.resolvePostLoginTarget('/oauth/authorize?x=1', '/app/dashboard'), '/oauth/authorize?x=1');
    assert.equal(r.resolvePostLoginTarget(null, '/app/dashboard'), '/app/dashboard');
    assert.equal(r.resolvePostLoginTarget('//evil.example', '/app/dashboard'), '/app/dashboard');
    assert.equal(r.resolvePostLoginTarget('https://evil.example', '/app/setup'), '/app/setup');
    assert.equal(r.resolvePostLoginTarget('/login', '/app/dashboard'), '/app/dashboard');
});

test('the return URL is read back out of a router URL, decoded and re-checked', () => {
    const inner = '/oauth/authorize?client_id=a&state=b%20c';
    const login = `/login?returnUrl=${encodeURIComponent(inner)}`;
    assert.equal(r.readReturnUrlFromUrl(login), inner);
    // A raw space survives decoding only if it was encoded twice, which is rejected.
    assert.equal(r.readReturnUrlFromUrl('/login?returnUrl=%2Fapp%3Fx%3Da%20b'), null);
    assert.equal(r.readReturnUrlFromUrl('/login'), null);
    assert.equal(r.readReturnUrlFromUrl('/login?returnUrl='), null);
    assert.equal(r.readReturnUrlFromUrl(`/login?returnUrl=${encodeURIComponent('//evil.example')}`), null);
    assert.equal(r.readReturnUrlFromUrl(`/login?returnUrl=${encodeURIComponent('https://evil.example')}`), null);
    assert.equal(r.readReturnUrlFromUrl(null), null);
});

test('a round trip through the login URL preserves the full authorize query', () => {
    const authorize =
        '/oauth/authorize?client_id=c1&redirect_uri=http%3A%2F%2F127.0.0.1%3A5555%2Fcb&response_type=code&state=s%2B1&scope=a%20b&code_challenge=abc-_&code_challenge_method=S256';
    const params = r.returnUrlQueryParams(authorize);
    const login = `/login?returnUrl=${encodeURIComponent(params.returnUrl)}`;
    assert.equal(r.readReturnUrlFromUrl(login), authorize);
});
