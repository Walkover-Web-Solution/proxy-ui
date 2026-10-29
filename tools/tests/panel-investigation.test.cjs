// Run: node --test tools/tests/panel-investigation.test.cjs
// Execute actual TypeScript classes with RxJS. Only framework DI/state hosting is
// stubbed, so these checks do not replace a browser or Angular template build.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const { BehaviorSubject, Subject, of, throwError, firstValueFrom, map, tap } = require('rxjs');

class StateHost {
    constructor(state) {
        this.state$ = new BehaviorSubject(state);
    }
    select(selector) {
        return this.state$.pipe(map(selector));
    }
    patchState(patch) {
        const state = this.state$.value;
        this.state$.next({ ...state, ...(typeof patch === 'function' ? patch(state) : patch) });
    }
    updater(update) {
        return () => this.state$.next(update(this.state$.value));
    }
    effect(project) {
        const requests = new Subject();
        project(requests).subscribe();
        return (request) => requests.next(request);
    }
}

function loadClass(relativePath, dependencies) {
    const source = readFileSync(path.resolve(__dirname, '../..', relativePath), 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.CommonJS,
            experimentalDecorators: true,
            useDefineForClassFields: false,
        },
    }).outputText;
    const module = { exports: {} };
    const importModule = (name) => {
        if (Object.hasOwn(dependencies, name)) return dependencies[name];
        if (name === 'rxjs' || name === 'rxjs/operators') return require(name);
        throw new Error(`Unexpected runtime dependency: ${name}`);
    };
    vm.runInNewContext(compiled, { module, exports: module.exports, require: importModule });
    return module.exports;
}

const angular = { Injectable: () => (target) => target };
const { LogsComponentStore } = loadClass('apps/36-blocks/src/app/panel/logs/log/logs.store.ts', {
    '@angular/core': angular,
    '@ngrx/component-store': { ComponentStore: StateHost },
    '@ngrx/operators': { tapResponse: (next, error) => tap({ next, error }) },
    '@proxy/models/root-models': { errorResolver: () => ['Request failed'] },
});
const { ProjectGuard } = loadClass('apps/36-blocks/src/app/panel/guard/project.guard.ts', {
    '@angular/core': angular,
    '@ngrx/store': { select: (selector) => map(selector) },
    '../../core/ngrx': { selectProjectAccessState: (state) => state },
    '../../core/ngrx/actions': { rootActions: { getAllProject: () => ({ type: 'load projects' }) } },
});

function createLogsStore(service) {
    return new LogsComponentStore(service, { error() {} });
}

test('a failed logs response remains distinguishable from an empty successful result and can recover', () => {
    let response = { hasError: true, errors: ['Unavailable'], data: { data: [{ id: 'stale' }] } };
    const store = createLogsStore({ getProxyLogs: () => of(response) });
    store.getLogs({});
    assert.equal(store.state$.value.logs, null);
    assert.match(store.state$.value.logsError, /could not be loaded/);
    assert.equal(store.state$.value.logsInProcess, false);
    response = { hasError: false, data: { data: [] } };
    store.getLogs({});
    assert.equal(store.state$.value.logsError, null);
    assert.equal(store.state$.value.logs.data.length, 0);
});

test('transport failures clear loading and a later retry still runs', () => {
    let failed = true;
    const store = createLogsStore({
        getProxyLogs: () => (failed ? throwError(() => ({ errors: ['Offline'] })) : of({ data: { data: [] } })),
    });
    store.getLogs({});
    assert.equal(store.state$.value.logsInProcess, false);
    assert.match(store.state$.value.logsError, /could not be loaded/);
    failed = false;
    store.getLogs({});
    assert.equal(store.state$.value.logsError, null);
});

test('a new list request clears stale rows while it is pending', () => {
    const pending = new Subject();
    const store = createLogsStore({ getProxyLogs: () => pending });
    store.patchState({ logs: { data: [{ id: 1 }] } });
    store.getLogs({});
    assert.equal(store.state$.value.logs, null);
    assert.equal(store.state$.value.logsInProcess, true);
    pending.next({ data: { data: [] } });
    assert.equal(store.state$.value.logsInProcess, false);
});

test('failed detail envelopes never become a fabricated successful detail object', () => {
    const store = createLogsStore({ getProxyLogsById: () => of({ hasError: true, data: { headers: 'private' } }) });
    store.getLogsById('request-id');
    assert.equal(store.state$.value.reqLogs, null);
    assert.match(store.state$.value.reqLogsError, /could not be loaded/);
    store.resetReqLog();
    assert.equal(store.state$.value.reqLogsError, null);
});

test('detail retry clears errors and decodes nested JSON without altering literal markup', () => {
    let failed = true;
    const store = createLogsStore({
        getProxyLogsById: () =>
            failed
                ? throwError(() => ({ errors: ['Offline'] }))
                : of({
                      data: {
                          headers: JSON.stringify(JSON.stringify({ label: '<b>literal</b>' })),
                          request_body: 'plain text',
                      },
                  }),
    });
    store.getLogsById('request-id');
    assert.equal(store.state$.value.reqLogsInProcess, false);
    assert.match(store.state$.value.reqLogsError, /could not be loaded/);
    failed = false;
    store.getLogsById('request-id');
    assert.equal(store.state$.value.reqLogsError, null);
    assert.equal(store.state$.value.reqLogs.headers.label, '<b>literal</b>');
    assert.equal(store.state$.value.reqLogs.request_body, 'plain text');
});

function createGuard(projects) {
    const dispatched = [];
    const router = { createUrlTree: (segments) => ({ redirect: segments.join('/') }) };
    const state = new BehaviorSubject({ projects, loading: false, failed: false });
    const store = {
        select: (selector) => state.pipe(map(selector)),
        dispatch: (action) => {
            dispatched.push(action);
            state.next({ ...state.value, loading: true, failed: false });
        },
    };
    return { guard: new ProjectGuard(router, store), state, dispatched };
}

test('users with no projects receive a completed redirect result', async () => {
    const { guard } = createGuard({ data: [] });
    const result = await firstValueFrom(guard.canActivate());
    assert.equal(result.redirect, '/project');
});

test('users with projects enter the panel', async () => {
    const { guard, dispatched } = createGuard({ data: [{ id: 1 }] });
    assert.equal(await firstValueFrom(guard.canActivate()), true);
    assert.equal(dispatched.length, 0);
});

test('unloaded project state triggers fetch and waits for its result', async () => {
    const { guard, state, dispatched } = createGuard(null);
    const result = firstValueFrom(guard.canActivate());
    assert.equal(dispatched.length, 1);
    state.next({ projects: { data: [] }, loading: false, failed: false });
    assert.equal((await result).redirect, '/project');
});

test('project request failure completes navigation with a recovery route, not project creation', async () => {
    const { guard, state } = createGuard(null);
    const result = firstValueFrom(guard.canActivate());
    state.next({ projects: null, loading: false, failed: true });
    assert.equal((await result).redirect, '/project-load-error');
});

test('retry after a failed project request waits for fresh results and can enter panel', async () => {
    const { guard, state, dispatched } = createGuard(null);
    state.next({ projects: null, loading: false, failed: true });
    const result = firstValueFrom(guard.canActivate());
    assert.equal(dispatched.length, 1);
    assert.equal(state.value.failed, false);
    state.next({ projects: { data: [{ id: 1 }] }, loading: false, failed: false });
    assert.equal(await result, true);
});

test('already pending project request is not duplicated and failure redirects', async () => {
    const { guard, state, dispatched } = createGuard(null);
    state.next({ projects: null, loading: true, failed: false });
    const result = firstValueFrom(guard.canActivate());
    assert.equal(dispatched.length, 0);
    state.next({ projects: null, loading: false, failed: true });
    assert.equal((await result).redirect, '/project-load-error');
});

const rootActionCreators = new Proxy({}, { get: (_, type) => Object.assign(() => ({ type }), { type }) });
const { rootReducer, initialState } = loadClass('apps/36-blocks/src/app/core/ngrx/store/reducer/root.reducer.ts', {
    '@ngrx/store': {
        on: (action, update) => ({ type: action.type, update }),
        createReducer:
            (initial, ...handlers) =>
            (state = initial, action) => {
                const handler = handlers.find((entry) => entry.type === action.type);
                return handler ? handler.update(state, action) : state;
            },
    },
    '../../actions': { rootActions: rootActionCreators },
});

test('project reducer records failure separately from empty data and resets it on retry/success', () => {
    let state = rootReducer(initialState, { type: 'getAllProjectsError' });
    assert.equal(state.projectLoadFailed, true);
    assert.equal(state.allProjects, null);
    assert.equal(state.projectInProcess, false);
    state = rootReducer(state, { type: 'getAllProject' });
    assert.equal(state.projectLoadFailed, false);
    assert.equal(state.projectInProcess, true);
    state = rootReducer(state, { type: 'getAllProjectSuccess', response: { data: [] } });
    assert.equal(state.projectLoadFailed, false);
    assert.equal(state.projectInProcess, false);
    assert.equal(state.allProjects.data.length, 0);
});

const { RootEffects } = loadClass('apps/36-blocks/src/app/core/ngrx/effects/root/root.effect.ts', {
    '@angular/core': angular,
    '@ngrx/effects': {
        createEffect: (factory) => factory(),
        ofType: (creator) => require('rxjs').filter((action) => action.type === creator.type),
    },
    '../../actions/root.action': rootActionCreators,
    '@proxy/models/root-models': { errorResolver: () => ['Request failed'] },
});

test('project effect emits recoverable failure for transport errors, error envelopes, and malformed data', () => {
    const actions = new Subject();
    let response = throwError(() => ({ errors: ['Offline'] }));
    const effects = new RootEffects(actions, { error() {} }, { getProjects: () => response });
    const results = [];
    effects.getAllProject$.subscribe((action) => results.push(action));
    actions.next({ type: 'getAllProject' });
    response = of({ hasError: true });
    actions.next({ type: 'getAllProject' });
    response = of({ hasError: false, data: null });
    actions.next({ type: 'getAllProject' });
    response = of({ hasError: false, data: { data: [] } });
    actions.next({ type: 'getAllProject' });
    assert.deepEqual(
        results.map((action) => action.type),
        ['getAllProjectsError', 'getAllProjectsError', 'getAllProjectsError', 'getAllProjectSuccess']
    );
});

test('malformed successful log list envelopes produce recoverable errors while valid empty results succeed', () => {
    for (const malformed of [
        null,
        {},
        { hasError: false, data: null },
        { hasError: false, data: {} },
        { hasError: false, data: { data: {} } },
    ]) {
        let response = malformed;
        const store = createLogsStore({ getProxyLogs: () => of(response) });
        store.getLogs({});
        assert.equal(store.state$.value.logs, null);
        assert.equal(store.state$.value.logsInProcess, false);
        assert.match(store.state$.value.logsError, /could not be loaded/);
        response = { hasError: false, data: { data: [] } };
        store.getLogs({});
        assert.equal(store.state$.value.logsError, null);
        assert.equal(store.state$.value.logs.data.length, 0);
        assert.equal(store.state$.value.logsInProcess, false);
    }
});

test('missing or malformed successful log details produce recoverable errors and retry accepts a valid object', () => {
    for (const malformed of [
        null,
        {},
        { hasError: false, data: null },
        { hasError: false, data: [] },
        { hasError: false, data: 'invalid' },
    ]) {
        let response = malformed;
        const store = createLogsStore({ getProxyLogsById: () => of(response) });
        store.getLogsById('request-id');
        assert.equal(store.state$.value.reqLogs, null);
        assert.equal(store.state$.value.reqLogsInProcess, false);
        assert.match(store.state$.value.reqLogsError, /could not be loaded/);
        response = { hasError: false, data: { id: 1, headers: null, request_body: null, response: null } };
        store.getLogsById('request-id');
        assert.equal(store.state$.value.reqLogsError, null);
        assert.equal(store.state$.value.reqLogs.id, 1);
        assert.equal(store.state$.value.reqLogsInProcess, false);
    }
});
