// Run: node --test tools/tests/oauth-consent.test.cjs
// Pure logic of the AI-tool authorization page: reading the request, building API requests, classifying outcomes.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function load(relative, deps = {}) {
    const source = readFileSync(path.resolve(__dirname, '../..', relative), 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
    const module = { exports: {} };
    vm.runInNewContext(compiled, {
        module,
        exports: module.exports,
        URL,
        require: (name) => {
            if (name in deps) return deps[name];
            throw new Error('Unexpected runtime dependency');
        },
    });
    return module.exports;
}

const c = load('apps/36-blocks/src/app/oauth/oauth-consent.ts');
const loose = require('node:assert').deepEqual;

const full = {
    client_id: 'client-1',
    redirect_uri: 'http://127.0.0.1:33418/callback',
    response_type: 'code',
    state: 'st+ate',
    scope: 'blocks:write',
    code_challenge: 'Zm9vYmFy',
    code_challenge_method: 'S256',
};
const getter = (values) => (key) => (key in values ? values[key] : null);

test('a complete request is read verbatim', () => {
    const parsed = c.parseAuthorizeRequest(getter(full));
    assert.equal(parsed.ok, true);
    loose(parsed.params, full);
});

test('state and scope are optional and read as empty strings', () => {
    const { state, scope, ...rest } = full;
    const parsed = c.parseAuthorizeRequest(getter(rest));
    assert.equal(parsed.ok, true);
    assert.equal(parsed.params.state, '');
    assert.equal(parsed.params.scope, '');
});

test('a request missing a required value is invalid and names the field', () => {
    for (const key of ['client_id', 'redirect_uri', 'response_type', 'code_challenge', 'code_challenge_method']) {
        const values = { ...full };
        delete values[key];
        const parsed = c.parseAuthorizeRequest(getter(values));
        assert.equal(parsed.ok, false, key);
        assert.equal(parsed.reason, 'missing');
        loose(parsed.fields, [key]);
        assert.match(c.invalidRequestMessage(parsed.reason, parsed.fields), new RegExp(key));
    }
    assert.equal(c.parseAuthorizeRequest(getter({ ...full, client_id: '   ' })).ok, false);
    assert.equal(c.parseAuthorizeRequest(getter({})).ok, false);
});

test('only the authorization code flow is supported', () => {
    const parsed = c.parseAuthorizeRequest(getter({ ...full, response_type: 'token' }));
    assert.equal(parsed.ok, false);
    assert.equal(parsed.reason, 'unsupported');
});

test('oversized or control-character values are rejected before any request is made', () => {
    assert.equal(c.parseAuthorizeRequest(getter({ ...full, state: 'x'.repeat(3000) })).reason, 'malformed');
    assert.equal(c.parseAuthorizeRequest(getter({ ...full, scope: 'a\nb' })).reason, 'malformed');
    assert.equal(c.parseAuthorizeRequest(getter({ ...full, client_id: 'a\u0000' })).reason, 'malformed');
});

test('the authorize query forwards the request verbatim and leaves empty optionals out', () => {
    const parsed = c.parseAuthorizeRequest(getter(full));
    loose(c.buildAuthorizeQuery(parsed.params), full);
    const bare = c.parseAuthorizeRequest(getter({ ...full, state: undefined, scope: undefined }));
    const query = c.buildAuthorizeQuery(bare.params);
    assert.equal('state' in query, false);
    assert.equal('scope' in query, false);
});

test('the decision body has exactly the contract fields, verbatim, plus the action', () => {
    const parsed = c.parseAuthorizeRequest(getter(full));
    for (const action of ['approve', 'deny']) {
        const body = c.buildDecisionRequest(parsed.params, action);
        loose(Object.keys(body).sort(), [
            'action',
            'client_id',
            'code_challenge',
            'code_challenge_method',
            'redirect_uri',
            'scope',
            'state',
        ]);
        assert.equal(body.action, action);
        assert.equal(body.client_id, full.client_id);
        assert.equal(body.redirect_uri, full.redirect_uri);
        assert.equal(body.state, full.state);
        assert.equal(body.code_challenge, full.code_challenge);
        assert.equal(body.code_challenge_method, full.code_challenge_method);
        assert.equal('response_type' in body, false);
    }
    const bare = c.parseAuthorizeRequest(getter({ ...full, state: undefined, scope: undefined }));
    const body = c.buildDecisionRequest(bare.params, 'approve');
    assert.equal(body.state, '');
    assert.equal(body.scope, '');
});

test('only an absolute http(s) URL is ever a navigation target', () => {
    assert.equal(
        c.safeRedirectTarget('http://127.0.0.1:33418/callback?code=abc&state=x'),
        'http://127.0.0.1:33418/callback?code=abc&state=x'
    );
    assert.equal(
        c.safeRedirectTarget('https://claude.ai/api/mcp/auth_callback?code=a'),
        'https://claude.ai/api/mcp/auth_callback?code=a'
    );
    for (const bad of [
        '',
        null,
        undefined,
        42,
        '/relative',
        '//evil.example',
        'javascript:alert(1)',
        'data:text/html,hi',
        'cursor://anysphere/oauth?code=a',
        'file:///etc/passwd',
        'https://evil.example/\\@x',
        'https://a.example/\nx',
        'https://' + 'a'.repeat(9000),
    ]) {
        assert.equal(c.safeRedirectTarget(bad), null, JSON.stringify(bad));
    }
});

test('the return host is shown for http(s) redirect URIs only', () => {
    assert.equal(c.redirectHost('http://127.0.0.1:33418/callback'), '127.0.0.1:33418');
    assert.equal(c.redirectHost('https://claude.ai/cb'), 'claude.ai');
    assert.equal(c.redirectHost('cursor://x'), null);
    assert.equal(c.redirectHost(undefined), null);
});

const ready = {
    hasError: false,
    status: 'success',
    data: {
        client_name: 'Claude Code',
        redirect_uri: 'http://127.0.0.1:33418/callback',
        state: 'st',
        scopes: [
            { key: 'blocks:write', label: 'Create and configure blocks' },
            { key: 'blocks:write', label: 'duplicate' },
            { key: 'login:write', label: 'Configure login methods' },
        ],
        workspace: { id: 7, name: 'Acme' },
    },
};

test('a valid response becomes the ready state with the workspace, tool and unique scope labels', () => {
    const outcome = c.classifyAuthorizeResponse(ready);
    assert.equal(outcome.kind, 'ready');
    assert.equal(outcome.consent.clientName, 'Claude Code');
    loose(outcome.consent.workspace, { id: 7, name: 'Acme' });
    assert.equal(outcome.consent.redirectHost, '127.0.0.1:33418');
    loose(
        outcome.consent.scopes.map((scope) => scope.label),
        ['Create and configure blocks', 'Configure login methods']
    );
});

test('no current workspace is its own state, not an error', () => {
    const outcome = c.classifyAuthorizeResponse({ ...ready, data: { ...ready.data, workspace: null } });
    assert.equal(outcome.kind, 'no-workspace');
    assert.equal(outcome.clientName, 'Claude Code');
});

test('an envelope with hasError is an invalid request with the server message; nothing redirects', () => {
    const outcome = c.classifyAuthorizeResponse({ hasError: true, errors: ['Unknown client.'], data: null });
    assert.equal(outcome.kind, 'invalid');
    assert.equal(outcome.message, 'Unknown client.');
    assert.equal(
        c.classifyAuthorizeResponse({ hasError: true, errors: { redirect_uri: ['Not allowed.'] } }).message,
        'Not allowed.'
    );
    assert.match(c.classifyAuthorizeResponse({ hasError: true }).message, /did not accept/);
});

test('a malformed success body is an error (retry), never ready', () => {
    for (const res of [
        null,
        undefined,
        {},
        { data: {} },
        { data: { client_name: '' } },
        { data: { client_name: 'X', workspace: {} } },
    ]) {
        assert.equal(c.classifyAuthorizeResponse(res).kind, 'error', JSON.stringify(res));
    }
});

test('request failures are classified as denied, invalid (no retry) or error (retry)', () => {
    assert.equal(c.classifyRequestFailure({ errorCode: 403, hasError: true }).kind, 'denied');
    assert.equal(c.classifyRequestFailure({ status: 403 }).kind, 'denied');
    const bad = c.classifyRequestFailure({ errorCode: 400, hasError: true, errors: ['redirect_uri mismatch'] });
    assert.equal(bad.kind, 'invalid');
    assert.equal(bad.message, 'redirect_uri mismatch');
    assert.equal(
        c.classifyRequestFailure({ status: 'fail', hasError: true, errors: 'Invalid client' }).kind,
        'invalid'
    );
    assert.equal(c.classifyRequestFailure({ status: 422, error: { errors: ['x'] } }).kind, 'invalid');
    // Server errors, rate limits and dropped connections can succeed on retry.
    assert.equal(c.classifyRequestFailure({ errors: 'Internal server error', hasError: true }).kind, 'error');
    assert.equal(c.classifyRequestFailure({ errorCode: 429, hasError: true }).kind, 'error');
    assert.equal(c.classifyRequestFailure({ status: 0 }).kind, 'error');
    assert.equal(c.classifyRequestFailure(null).kind, 'error');
});

test('operator URLs go to the operator OAuth endpoints under the API base', () => {
    const urls = load('apps/36-blocks/src/app/oauth/oauth.urls.ts', {
        '@proxy/service': { createUrl: (base, url) => `${base}/${url}` },
    }).OAuthUrls;
    const base = 'https://api.example.com/api';
    assert.equal(urls.authorize(base), `${base}/operator/oauth/authorize`);
    assert.equal(urls.decision(base), `${base}/operator/oauth/decision`);
    assert.equal(urls.connections(base), `${base}/operator/oauth/connections`);
    assert.equal(urls.revokeConnection(base, 12), `${base}/operator/oauth/connections/12/revoke`);
    assert.equal(urls.revokeConnection(base, 'a/b'), `${base}/operator/oauth/connections/a%2Fb/revoke`);
});
