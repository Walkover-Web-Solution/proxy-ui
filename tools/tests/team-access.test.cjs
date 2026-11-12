// Run: node --test tools/tests/team-access.test.cjs
// Exercises the actual Team & access TypeScript (models, service, members and API-key components) with RxJS.
// Angular DI, signals and forms are hosted locally. Browser rendering and backend authorization are separate checks.
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
        Set,
        Date,
        require: (name) => {
            if (Object.hasOwn(dependencies, name)) return dependencies[name];
            if (name === 'rxjs') return require(name);
            if (name.startsWith('@angular/') || name.startsWith('@proxy/') || name.startsWith('@ngrx/')) return {};
            throw new Error(`Unexpected runtime dependency: ${name}`);
        },
    });
    return module.exports;
}

const team = 'apps/36-blocks/src/app/panel/team';
const models = load(`${team}/team.models.ts`);

const member = (over = {}) => ({
    id: 3,
    email: 'morgan@example.test',
    fname: 'Morgan',
    lname: 'Chen',
    client_user: {
        id: 1,
        status: 'enabled',
        invite_status: 'accepted',
        updated_at: '2026-10-20T08:00:00Z',
        role: { id: 4, role_name: 'User' },
    },
    ...over,
});

test('member status separates active, pending, expired, declined and disabled', () => {
    const now = Date.parse('2026-10-20T08:10:00Z');
    const withInvite = (invite_status, status, updated_at) =>
        member({ client_user: { ...member().client_user, invite_status, status, updated_at } });
    assert.equal(models.memberStatus(member(), now).key, 'active');
    const pending = models.memberStatus(withInvite('pending', 'disabled', '2026-10-20T08:00:00Z'), now);
    assert.equal(pending.key, 'invited');
    assert.equal(pending.canResend, false);
    const expired = models.memberStatus(withInvite('pending', 'disabled', '2026-10-20T07:00:00Z'), now);
    assert.equal(expired.key, 'invite-expired');
    assert.equal(expired.canResend, true);
    const declined = models.memberStatus(withInvite('rejected', 'disabled', '2026-10-20T08:00:00Z'), now);
    assert.equal(declined.key, 'declined');
    assert.equal(declined.canResend, true);
    assert.equal(models.memberStatus(withInvite('accepted', 'disabled', '2026-10-20T08:00:00Z'), now).key, 'disabled');
    assert.equal(models.memberStatus(member({ client_user: null }), now).key, 'unknown');
});

test('display name falls back to the email; Super admin is never assignable', () => {
    assert.equal(models.memberDisplayName(member()), 'Morgan Chen');
    assert.equal(models.memberDisplayName(member({ fname: null, lname: '  ' })), 'morgan@example.test');
    const roles = [
        { id: 4, role_name: 'User', permissions: [] },
        { id: 1, role_name: 'Super admin', permissions: [] },
        { id: 2, role_name: 'Owner', permissions: [] },
    ];
    assert.deepEqual([...models.assignableRoles(roles).map((role) => role.id)], [2, 4]);
});

test('permission matrix has one row per permission and one column per role', () => {
    const roles = [
        { id: 4, role_name: 'User', permissions: [{ permission: 'View authkeys' }] },
        { id: 2, role_name: 'Owner', permissions: [{ permission: 'View authkeys' }, { permission: 'Create authkey' }] },
    ];
    const matrix = models.buildPermissionMatrix(roles);
    assert.deepEqual([...matrix.roles.map((role) => role.id)], [2, 4]);
    assert.deepEqual([...matrix.rows.map((row) => row.permission)], ['Create authkey', 'View authkeys']);
    assert.deepEqual({ ...matrix.rows[0].grants }, { 2: true, 4: false });
    assert.deepEqual({ ...matrix.rows[1].grants }, { 2: true, 4: true });
});

test('secrets are masked and never reveal more than the last four characters', () => {
    const secret = '0123456789abcdef0123456789abcdef';
    const masked = models.maskSecret(secret);
    assert.equal(masked.endsWith('cdef'), true);
    assert.equal(masked.includes('0123'), false);
    assert.equal(models.maskSecret('abc'), '••••••••••••');
    assert.equal(models.maskSecret(''), '');
});

test('name rules match the server rules', () => {
    assert.equal(models.API_KEY_NAME_PATTERN.test('backend_sync'), true);
    assert.equal(models.API_KEY_NAME_PATTERN.test('_leading'), false);
    assert.equal(models.API_KEY_NAME_PATTERN.test('has space'), false);
    assert.equal(models.WORKSPACE_NAME_PATTERN.test('Acme Corp 2'), true);
    assert.equal(models.WORKSPACE_NAME_PATTERN.test(' Acme'), false);
});

test('error messages read every envelope the API and interceptor produce', () => {
    assert.equal(models.errorMessages({ errors: { name: ['Taken.'], role_id: ['Invalid.'] } }, 'x'), 'Taken. Invalid.');
    assert.equal(models.errorMessages({ errors: ['One'] }, 'x'), 'One');
    assert.equal(models.errorMessages({ data: { message: 'Already pending.' } }, 'x'), 'Already pending.');
    assert.equal(models.errorMessages('Plain', 'x'), 'Plain');
    assert.equal(models.errorMessages(null, 'fallback'), 'fallback');
    assert.equal(models.errorMessages({ errors: [] }, 'fallback'), 'fallback');
    assert.equal(models.isForbidden({ errorCode: 403 }), true);
    assert.equal(models.isForbidden({ status: 403 }), true);
    assert.equal(models.isForbidden({ errorCode: 422 }), false);
});

// ---- service -------------------------------------------------------------------------------------------------
const createUrl = (base, p) => `${base}/${p}`;
const urls = load(`${team}/team.urls.ts`, { '@proxy/service': { createUrl } }).TeamUrls;

function createService(http) {
    const { TeamService } = load(`${team}/team.service.ts`, {
        '@angular/core': { Inject: () => () => {}, Injectable: () => (t) => t, inject: () => http },
        '@proxy/models/root-models': { ProxyBaseUrls: { BaseURL: 'BASE' } },
        './team.models': models,
        './team.urls': { TeamUrls: urls },
    });
    return new TeamService('https://api.test');
}

test('service sends the documented routes, bodies and paging', () => {
    const calls = [];
    const record =
        (method) =>
        (url, ...rest) => {
            calls.push({ method, url, rest });
            return of({ hasError: false, data: {} });
        };
    const service = createService({
        get: record('get'),
        post: record('post'),
        put: record('put'),
        delete: record('delete'),
    });
    service.getMembers({ name: '  jane ', pageNo: 2 }).subscribe();
    service.getMembers({ pageNo: 1 }).subscribe();
    service.inviteMember({ email: 'a@b.test', role_id: 4 }).subscribe();
    service.updateMemberRole({ user_id: 9, role_id: 3 }).subscribe();
    service.getApiKeys(3).subscribe();
    service.createApiKey({ name: 'abc', role_id: 3 }).subscribe();
    service.updateApiKey(21, { status: 'inactive' }).subscribe();
    service.deleteApiKey(21).subscribe();
    const [members, noName, invite, role, keys, create, update, del] = calls;
    assert.equal(members.url, 'https://api.test/users');
    assert.deepEqual({ ...members.rest[0] }, { pageNo: 2, itemsPerPage: 25, name: 'jane' });
    assert.equal(Object.hasOwn(noName.rest[0], 'name'), false);
    assert.equal(invite.method, 'post');
    assert.equal(invite.url, 'https://api.test/invite');
    assert.deepEqual({ ...invite.rest[0] }, { email: 'a@b.test', role_id: 4 });
    assert.equal(role.method, 'put');
    assert.equal(role.url, 'https://api.test/updateUserRole');
    assert.equal(keys.url, 'https://api.test/authentications');
    assert.equal(keys.rest[0].pageNo, 3);
    assert.equal(create.method, 'post');
    assert.equal(update.url, 'https://api.test/authentications/21');
    assert.deepEqual({ ...update.rest[0] }, { status: 'inactive' });
    assert.equal(del.method, 'delete');
    assert.equal(del.url, 'https://api.test/authentications/21');
});

test('roles are fetched once per visit, failures are not cached, refresh forces a new request', () => {
    let count = 0;
    let fail = true;
    const service = createService({
        get: () => {
            count++;
            return fail ? throwError(() => ({ errorCode: 500 })) : of({ hasError: false, data: { data: [] } });
        },
    });
    service.getRoles().subscribe({ error: () => {} });
    assert.equal(count, 1);
    fail = false;
    service.getRoles().subscribe();
    assert.equal(count, 2, 'a failed request must not be cached');
    service.getRoles().subscribe();
    service.getRoles().subscribe();
    assert.equal(count, 2, 'a successful request is shared');
    service.getRoles(true).subscribe();
    assert.equal(count, 3);
});

// ---- components ----------------------------------------------------------------------------------------------
const signal = (initial) => {
    let value = initial;
    const get = () => value;
    get.set = (next) => {
        value = next;
    };
    return get;
};
const computed = (fn) => () => fn();
class FormControl {
    constructor(value) {
        this.value = value;
        this.touched = false;
        this.invalid = false;
    }
}
class FormGroup {
    constructor(controls) {
        this.controls = controls;
    }
    get invalid() {
        return Object.values(this.controls).some((c) => c.invalid);
    }
    reset(values) {
        for (const [k, v] of Object.entries(values)) this.controls[k].value = v;
    }
    getRawValue() {
        return Object.fromEntries(Object.entries(this.controls).map(([k, c]) => [k, c.value]));
    }
    markAllAsTouched() {}
}
const forms = {
    FormControl,
    FormGroup,
    Validators: { required: 1, email: 1, minLength: () => 1, maxLength: () => 1, pattern: () => 1 },
};
const core = {
    Component: () => (t) => t,
    ChangeDetectionStrategy: {},
    ViewChild: () => () => {},
    signal,
    computed,
    inject: () => undefined,
    DestroyRef: class {},
};

function buildMembers(service, myEmail) {
    const toasts = [];
    const dialog = { open: () => ({ afterClosed: () => new Subject(), close() {}, disableClose: false }) };
    const toast = { success: (m) => toasts.push(['success', m]), error: (m) => toasts.push(['error', m]) };
    const store = { pipe: () => of({ email: myEmail ?? 'me@example.test' }) };
    const { MembersComponent } = load(`${team}/members/members.component.ts`, {
        '@angular/core': {
            ...core,
            inject: (t) =>
                ({ TeamService: service, MatDialog: dialog, PrimeNgToastService: toast, Store: store })[t.name],
        },
        '@angular/core/rxjs-interop': { takeUntilDestroyed: () => (source) => source },
        '@angular/forms': forms,
        '@angular/material/dialog': { MatDialog: class MatDialog {} },
        '@ngrx/store': { Store: class Store {}, select: () => (s) => s },
        '@proxy/ui/prime-ng-toast': { PrimeNgToastService: class PrimeNgToastService {} },
        '../../../website/home/ngrx/selector/login.selector': { selectLogInData: {} },
        '../team.models': models,
        '../team.service': { TeamService: class TeamService {} },
    });
    return { component: new MembersComponent(), toasts };
}

const page = (data) => ({
    hasError: false,
    data: { data, totalEntityCount: data.length, totalPageCount: data.length ? 1 : 0 },
});

test('members distinguish denied, failed and empty and recover on retry', () => {
    let response = throwError(() => ({ errorCode: 403 }));
    const { component } = buildMembers({
        getMembers: () => response,
        getRoles: () => of(page([])),
    });
    component.ngOnInit();
    assert.match(component.error(), /permission to view the team/);
    response = of({ hasError: true });
    component.load(1);
    assert.match(component.error(), /could not be loaded/);
    response = of(page([]));
    component.load(1);
    assert.equal(component.error(), null);
    assert.equal(component.members().length, 0);
    assert.equal(component.loading(), false);
});

test('members: search applies from page one, newer requests cancel older ones, own role is not changeable', () => {
    const requests = [];
    const first = new Subject();
    let n = 0;
    const { component } = buildMembers(
        {
            getMembers: (p) => {
                requests.push(p);
                return ++n === 1 ? first : of(page([member()]));
            },
            getRoles: () => of(page([])),
        },
        'Morgan@Example.test'
    );
    component.ngOnInit();
    component.searchText = '  jane ';
    component.applySearch();
    assert.equal(first.observers.length, 0, 'older request is cancelled');
    assert.deepEqual({ ...requests[1] }, { name: 'jane', pageNo: 1 });
    assert.equal(component.hasFilter(), true);
    component.load(2);
    assert.equal(requests[2].name, 'jane', 'paging keeps the applied search, not unsaved edits');
    assert.equal(component.isMe(member({ email: 'morgan@example.test' })), true);
    assert.equal(component.isMe(member({ email: 'other@example.test' })), false);
    component.clearSearch();
    assert.equal(requests[3].name, '');
});

test('members: resending an invitation reuses the existing role and reports failures', () => {
    const sent = [];
    let result = of({ hasError: false, data: { message: 'ok' } });
    const { component, toasts } = buildMembers({
        getMembers: () => of(page([])),
        getRoles: () => of(page([])),
        inviteMember: (body) => {
            sent.push(body);
            return result;
        },
    });
    const declined = member({ client_user: { ...member().client_user, invite_status: 'rejected' } });
    component.resend(declined);
    assert.deepEqual({ ...sent[0] }, { email: 'morgan@example.test', role_id: 4 });
    assert.equal(toasts[0][0], 'success');
    result = throwError(() => ({ errors: { email: ['Invitation already pending for this user.'] } }));
    component.resend(declined);
    assert.equal(toasts[1][0], 'error');
    assert.match(toasts[1][1], /already pending/);
    assert.equal(component.resendingId(), null);
    component.resend(member({ client_user: { ...member().client_user, role: null } }));
    assert.equal(sent.length, 2, 'no request without a known role');
});

function buildKeys(service, { confirm = 'yes' } = {}) {
    const toasts = [];
    const dialogRef = {
        componentRef: { setInput() {} },
        afterClosed: () => of(confirm),
        close() {},
        disableClose: false,
    };
    const dialog = { open: () => dialogRef };
    const toast = { success: (m) => toasts.push(['success', m]), error: (m) => toasts.push(['error', m]) };
    const { ApiKeysComponent } = load(`${team}/api-keys/api-keys.component.ts`, {
        '@angular/core': {
            ...core,
            inject: (t) => ({ TeamService: service, MatDialog: dialog, PrimeNgToastService: toast })[t.name],
        },
        '@angular/core/rxjs-interop': { takeUntilDestroyed: () => (source) => source },
        '@angular/forms': forms,
        '@angular/material/dialog': { MatDialog: class MatDialog {} },
        '@proxy/ui/confirm-dialog': { ConfirmDialogComponent: class {} },
        '@proxy/ui/copy-button': {},
        '@proxy/ui/prime-ng-toast': { PrimeNgToastService: class PrimeNgToastService {} },
        '../team.models': models,
        '../team.service': { TeamService: class TeamService {} },
    });
    return { component: new ApiKeysComponent(), toasts };
}

const key = (over = {}) => ({
    id: 21,
    name: 'backend_sync',
    authkey: '0123456789abcdef0123456789abcdef',
    role_id: 3,
    status: 'active',
    ...over,
});

test('API keys are masked until revealed, and reveal is per key', () => {
    const { component } = buildKeys({ getApiKeys: () => of(page([key()])), getRoles: () => of(page([])) });
    assert.equal(component.isRevealed(key()), false);
    component.toggleReveal(key());
    assert.equal(component.isRevealed(key()), true);
    assert.equal(component.isRevealed(key({ id: 22 })), false);
    component.toggleReveal(key());
    assert.equal(component.isRevealed(key()), false);
});

test('API keys: edit sends only changed fields; deactivate and delete need confirmation', () => {
    const updates = [];
    const deletes = [];
    const service = {
        getApiKeys: () => of(page([key()])),
        getRoles: () => of(page([{ id: 3, role_name: 'Admin', permissions: [] }])),
        updateApiKey: (id, body) => {
            updates.push([id, body]);
            return of({ hasError: false, data: key() });
        },
        deleteApiKey: (id) => {
            deletes.push(id);
            return of({ hasError: false });
        },
    };
    const { component, toasts } = buildKeys(service);
    component.ngOnInit();
    component.setActive(key(), false);
    assert.deepEqual(JSON.parse(JSON.stringify(updates)), [[21, { status: 'inactive' }]]);
    component.setActive(key({ status: 'inactive' }), true);
    assert.equal(updates[1][1].status, 'active', 'activating needs no confirmation and sends only status');
    component.remove(key());
    assert.deepEqual(deletes, [21]);
    assert.equal(
        toasts.some(([kind]) => kind === 'success'),
        true
    );

    const declined = buildKeys(service, { confirm: 'no' });
    declined.component.setActive(key(), false);
    declined.component.remove(key());
    assert.equal(updates.length, 2);
    assert.equal(deletes.length, 1);
});

test('API keys: denied list is distinct from a failed one', () => {
    let response = throwError(() => ({ errorCode: 403 }));
    const { component } = buildKeys({ getApiKeys: () => response, getRoles: () => of(page([])) });
    component.ngOnInit();
    assert.match(component.error(), /view_authkeys/);
    response = throwError(() => ({ errorCode: 500 }));
    component.load(1);
    assert.match(component.error(), /Check your connection/);
});
