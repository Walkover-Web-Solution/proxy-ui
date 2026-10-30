// Run: node --test tools/tests/activity.test.cjs
// Exercises actual component/service TypeScript with RxJS; Angular DI and signals
// are hosted locally. Browser rendering and backend authorization are separate checks.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const { Subject, of, throwError } = require('rxjs');

function load(relative, dependencies = {}) {
    const source = readFileSync(path.resolve(__dirname, '../..', relative), 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.CommonJS,
            experimentalDecorators: true,
        },
    }).outputText;
    const module = { exports: {} };
    vm.runInNewContext(compiled, {
        module,
        exports: module.exports,
        URL,
        require: (name) => {
            if (Object.hasOwn(dependencies, name)) return dependencies[name];
            if (name === 'rxjs') return require(name);
            if (name.startsWith('@angular/')) return {};
            throw new Error(`Unexpected runtime dependency: ${name}`);
        },
    });
    return module.exports;
}
const modelPath = 'apps/36-blocks/src/app/panel/activity/activity.models.ts';
const models = load(modelPath);
const componentPath = 'apps/36-blocks/src/app/panel/activity/activity.component.ts';
function createComponent(service, target = null) {
    class ActivatedRoute {}
    const signal = (initial) => {
        let value = initial;
        const get = () => value;
        get.set = (next) => {
            value = next;
        };
        return get;
    };
    const { ActivityComponent } = load(componentPath, {
        '@angular/core': {
            Component: () => (target) => target,
            ChangeDetectionStrategy: {},
            inject: (token) =>
                token === ActivatedRoute ? { snapshot: { queryParamMap: { get: () => target } } } : service,
            signal,
        },
        '@angular/router': { ActivatedRoute },
        './activity.models': models,
        './activity.service': { ActivityService: class {} },
    });
    return new ActivityComponent();
}
const empty = { hasError: false, data: { data: [], totalEntityCount: 0, totalPageCount: 0 } };

test('activity distinguishes denied, failed and empty responses and recovers on retry', () => {
    let response = throwError(() => ({ errorCode: 403 }));
    const component = createComponent({ getOperations: () => response });
    component.ngOnInit();
    assert.match(component.error(), /view_operations/);
    assert.equal(component.loading(), false);
    response = of({ hasError: true, data: empty.data });
    component.load(1);
    assert.match(component.error(), /could not be loaded/);
    response = of(empty);
    component.load(1);
    assert.equal(component.error(), null);
    assert.equal(component.rows().length, 0);
});

test('new requests clear stale rows and cancel older work', () => {
    const first = new Subject();
    const second = new Subject();
    let count = 0;
    const component = createComponent({ getOperations: () => (++count === 1 ? first : second) });
    component.ngOnInit();
    first.next({ data: { data: [{ id: 1 }], totalEntityCount: 1, totalPageCount: 1 } });
    component.load(2);
    assert.equal(first.observers.length, 0);
    assert.equal(component.rows().length, 0);
    assert.equal(component.loading(), true);
    second.next(empty);
    assert.equal(component.loading(), false);
    component.ngOnDestroy();
    assert.equal(second.observers.length, 0);
});

test('pagination uses applied filters rather than unsaved form edits; clear resets page and filters', () => {
    const requests = [];
    const component = createComponent({
        getOperations: (params) => {
            requests.push(params);
            return of(empty);
        },
    });
    component.filters.operation = '  Login as  ';
    component.filters.target_user_id = '17';
    component.applyFilters();
    component.filters.operation = 'Unsaved';
    component.load(2);
    assert.equal(requests[1].operation, 'Login as');
    assert.equal(requests[1].target_user_id, '17');
    assert.equal(requests[1].pageNo, 2);
    assert.equal(Object.hasOwn(requests[1], 'outcome'), false);
    component.clearFilters();
    assert.equal(requests[2].pageNo, 1);
    assert.equal(Object.hasOwn(requests[2], 'operation'), false);
});

test('reversed dates prevent a request', () => {
    const component = createComponent({
        getOperations: () => {
            throw new Error('must not send');
        },
    });
    component.filters.startDate = '2026-10-28';
    component.filters.endDate = '2026-10-27';
    component.applyFilters();
    assert.match(component.error(), /end date/);
});

test('Login as requires valid target, reason and explicit confirmation before sending credentials request', () => {
    const calls = [];
    const component = createComponent({
        loginAs: (request) => {
            calls.push(request);
            return of({ data: { redirect_url: 'https://app.example.test/?token=example' } });
        },
        getOperations: () => of(empty),
    });
    component.loginTarget = '17';
    component.loginReason = '  Support ticket 123  ';
    component.loginAs();
    assert.equal(calls.length, 0);
    assert.match(component.loginError(), /confirm/);
    component.loginConfirmed = true;
    component.loginAs();
    assert.equal(calls[0].user_id, 17);
    assert.equal(calls[0].reason, 'Support ticket 123');
    assert.equal(Object.hasOwn(calls[0], 'company_id'), false);
    assert.equal(component.loginConfirmed, false);
    assert.equal(component.loginRedirect(), 'https://app.example.test/?token=example');
});

test('Login as never presents a returned raw token or unsafe redirect', () => {
    const component = createComponent({
        loginAs: () =>
            of({ data: { redirect_url: 'javascript:alert(1)', proxy_auth_token: 'secret', refresh_token: 'secret' } }),
        getOperations: () => of(empty),
    });
    component.loginTarget = '17';
    component.loginReason = 'Support';
    component.loginConfirmed = true;
    component.loginAs();
    assert.equal(component.loginRedirect(), null);
    assert.match(component.loginMessage(), /no safe application redirect/);
    assert.equal(component.loginMessage().includes('secret'), false);
});

test('Login as permission failures remain actionable and do not display backend errors', () => {
    const component = createComponent({
        loginAs: () => throwError(() => ({ errorCode: 403, errors: 'secret' })),
        getOperations: () => of(empty),
    });
    component.loginTarget = '17';
    component.loginReason = 'Support';
    component.loginConfirmed = true;
    component.loginAs();
    assert.match(component.loginError(), /Owner, Admin/);
    assert.equal(component.loginError().includes('secret'), false);
    assert.equal(component.loggingIn(), false);
});

test('credential redirects allow HTTPS and loopback HTTP only, without embedded userinfo', () => {
    for (const value of [
        'javascript:alert(1)',
        '//app.test/path',
        'data:text/plain,a',
        'http://app.test/',
        'https://user:pass@app.test/',
        null,
    ]) {
        assert.equal(models.safeLoginRedirect(value), null);
    }
    assert.equal(models.safeLoginRedirect('https://app.test/path#fragment'), 'https://app.test/path#fragment');
    assert.equal(models.safeLoginRedirect('http://localhost:4200/path'), 'http://localhost:4200/path');
});

test('service uses authenticated wrapper and POST JSON for impersonation reason', () => {
    const calls = [];
    const http = { get: (...args) => calls.push(['get', ...args]), post: (...args) => calls.push(['post', ...args]) };
    class Wrapper {}
    const { ActivityService } = load('apps/36-blocks/src/app/panel/activity/activity.service.ts', {
        '@angular/core': { Injectable: () => (target) => target, Inject: () => () => {}, inject: () => http },
        '@proxy/models/root-models': { ProxyBaseUrls: { BaseURL: 'BASE_URL' } },
        '@proxy/service': { createUrl: (base, endpoint) => `${base}/${endpoint}` },
        '@proxy/services/httpWrapper': { HttpWrapperService: Wrapper },
    });
    const service = new ActivityService('https://api.example.test/api');
    service.getOperations({ pageNo: 2 });
    service.loginAs({ user_id: 17, reason: 'Support' });
    assert.equal(calls[0][1], 'https://api.example.test/api/operations');
    assert.equal(calls[1][0], 'post');
    assert.equal(calls[1][1], 'https://api.example.test/api/loginAs');
    assert.equal(calls[1][2].reason, 'Support');
});

test('editing the impersonation target clears the previous credential link and confirmation', () => {
    const component = createComponent({});
    component.loginRedirect.set('https://app.test/?token=example');
    component.loginMessage.set('Created');
    component.loginConfirmed = true;
    component.clearLoginResult();
    assert.equal(component.loginRedirect(), null);
    assert.equal(component.loginMessage(), null);
    assert.equal(component.loginConfirmed, false);
});

test('a user investigation link prefills a valid target without creating a session', () => {
    let params;
    const component = createComponent(
        {
            getOperations: (value) => {
                params = value;
                return of(empty);
            },
            loginAs: () => {
                throw new Error('Must not submit from navigation');
            },
        },
        '25'
    );
    component.ngOnInit();
    assert.equal(params.target_user_id, '25');
    assert.equal(component.loginTarget, '25');
    assert.equal(component.loginConfirmed, false);
    const malformed = createComponent(
        {
            getOperations: (value) => {
                params = value;
                return of(empty);
            },
        },
        '25<script>'
    );
    malformed.ngOnInit();
    assert.equal(params.target_user_id, undefined);
    assert.equal(malformed.loginTarget, '');
});
