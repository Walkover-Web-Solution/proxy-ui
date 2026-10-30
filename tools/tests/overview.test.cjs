const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const { Subject, of, throwError } = require('rxjs');
const source = readFileSync('apps/36-blocks/src/app/panel/dashboard/dashboard.component.ts', 'utf8');
function component(service) {
    const signal = (value) =>
        Object.assign(() => value, {
            set: (next) => {
                value = next;
            },
        });
    const module = { exports: {} };
    vm.runInNewContext(
        ts.transpileModule(source, {
            compilerOptions: {
                target: ts.ScriptTarget.ES2022,
                module: ts.ModuleKind.CommonJS,
                experimentalDecorators: true,
            },
        }).outputText,
        {
            exports: module.exports,
            module,
            require: (name) => {
                if (name === 'rxjs') return require('rxjs');
                if (name === '@angular/core')
                    return {
                        Component: () => (type) => type,
                        ChangeDetectionStrategy: {},
                        inject: () => service,
                        signal,
                        computed: (fn) => fn,
                        effect: () => {},
                    };
                if (name === '@angular/forms') return { FormControl: class {} };
                if (name === '@proxy/ui/base-component')
                    return {
                        BaseComponent: class {
                            destroy$ = new Subject();
                        },
                    };
                if (name === './dashboard.models')
                    return { DateRange: { week: 'week' }, OVERVIEW_CARDS: [], RANGE_OPTIONS: [] };
                return {};
            },
        }
    );
    return new module.exports.DashboardComponent();
}
test('zero scoped usage stays zero; missing scoped usage does not become a client total', () => {
    const c = component({});
    c.featureConfigurationId.set(11);
    assert.equal(
        c.getCardValue(
            { users: { feature_configuration_total: 0, client_total: 128 } },
            'users.feature_configuration_total',
            'users.client_total'
        ),
        0
    );
    assert.equal(
        c.getCardValue({ users: { client_total: 128 } }, 'users.feature_configuration_total', 'users.client_total'),
        null
    );
    c.featureConfigurationId.set('');
    assert.equal(
        c.getCardValue({ users: { client_total: 128 } }, 'users.feature_configuration_total', 'users.client_total'),
        128
    );
    for (const value of [undefined, null, NaN, Infinity, '12'])
        assert.equal(c.getCardValue({ count: value }, 'count'), null);
});
test('failed or malformed overview responses stay unavailable and retry can recover', () => {
    let response = throwError(() => ({ errorCode: 403 }));
    const c = component({ getOverview: () => response });
    c.fetchOverview({ range: 'week' });
    assert.match(c.overviewError(), /access/);
    assert.equal(c.overviewData(), null);
    assert.equal(c.isLoadingOverview(), false);
    response = of({ hasError: false, data: null });
    c.fetchOverview({ range: 'week' });
    assert.match(c.overviewError(), /unavailable/);
    response = of({ hasError: false, data: { data: { logins: { total: 0 } } } });
    c.fetchOverview({ range: 'week' });
    assert.equal(c.overviewError(), null);
    assert.equal(c.getCardValue(c.overviewData(), 'logins.total'), 0);
});
test('a changed scope cancels the old request before it can overwrite new data', () => {
    const old = new Subject();
    let response = old;
    const c = component({ getOverview: () => response });
    c.fetchOverview({ range: 'week' });
    response = of({ data: { data: { logins: { total: 7 } } } });
    c.fetchOverview({ range: 'day' });
    old.next({ data: { data: { logins: { total: 900 } } } });
    assert.equal(c.overviewData().logins.total, 7);
    assert.equal(old.observed, false);
});
