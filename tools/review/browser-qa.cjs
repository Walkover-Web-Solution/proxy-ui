// Local-only browser QA. Uses a caller-selected Playwright installation; no dependency changes.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const output = path.resolve(process.argv[2] || '/tmp/36blocks-browser-review');
fs.mkdirSync(output, { recursive: true });
const report = {
    data: 'synthetic',
    liveAuthentication: 'not exercised',
    consoleErrors: [],
    routes: [],
    interactions: [],
    failures: [],
};
(async () => {
    const browser = await chromium.launch({
        executablePath: process.env.CHROMIUM_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true,
    });
    const views = [
        { name: 'desktop', width: 1440, height: 1000 },
        { name: 'mobile', width: 390, height: 844 },
    ];
    const matched = [
        ['home', '/'],
        ['overview', '/app/dashboard'],
        ['people', '/app/users'],
        ['activity', '/app/activity'],
        ['requests', '/app/logs'],
    ];
    for (const version of ['before', 'after']) {
        const base = `http://127.0.0.1:${version === 'before' ? 4361 : 4360}`;
        for (const view of views) {
            const context = await browser.newContext({
                viewport: { width: view.width, height: view.height },
                reducedMotion: 'reduce',
            });
            await context.route('**/*', (route) =>
                new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()
            );
            const page = await context.newPage();
            for (const [name, route] of matched) {
                const errors = [];
                const onError = (error) => errors.push(error.message);
                page.on('pageerror', onError);
                await page.goto(base + route);
                await page.waitForTimeout(600);
                await page.evaluate(() => document.fonts.ready);
                const state = await page.evaluate(() => ({
                    title: document.title,
                    width: innerWidth,
                    documentWidth: document.documentElement.scrollWidth,
                    headings: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
                    text: document.body.innerText.slice(0, 200),
                }));
                await page.screenshot({
                    path: path.join(output, `${name}-${view.name}-${version}.png`),
                    fullPage: true,
                });
                report.routes.push({ version, viewport: view.name, route, ...state, errors });
                page.off('pageerror', onError);
            }
            await context.close();
        }
    }
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await context.route('**/*', (route) =>
        new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()
    );
    const page = await context.newPage();
    page.setDefaultTimeout(6000);
    page.on('console', (message) => {
        if (message.type() === 'error')
            report.consoleErrors.push({ url: page.url(), message: message.text().slice(0, 1200) });
    });
    const check = async (name, work) => {
        try {
            await work();
            report.interactions.push({ name, passed: true });
        } catch (error) {
            report.failures.push({ name, error: error.message });
        }
    };
    const base = 'http://127.0.0.1:4360';
    await check('website product illustration tabs', async () => {
        await page.goto(base);
        await page.getByRole('button', { name: 'People', exact: true }).click();
        await page.getByRole('heading', { name: 'Put a person in context.' }).waitFor();
        await page.getByRole('button', { name: 'Activity', exact: true }).click();
        await page.getByRole('heading', { name: 'Understand the action.' }).waitFor();
    });
    await check('people search to target-filtered activity without session submission', async () => {
        await page.goto(base + '/app/users');
        await page.getByRole('textbox', { name: 'Search name or email', exact: true }).fill('Alex');
        await page.getByRole('link', { name: 'View activity for Alex Lee' }).waitFor();
        await page.waitForFunction(() => document.querySelectorAll('tr[mat-row]').length === 1);
        assert.equal(await page.locator('tr[mat-row]').count(), 1);
        await page.getByRole('link', { name: 'View activity for Alex Lee' }).click();
        await page.waitForURL('**/app/activity?target_user_id=25');
        assert.equal(await page.locator('input[name="target"]').inputValue(), '25');
        await page.locator('summary').filter({ hasText: 'Login as' }).click();
        assert.equal(await page.locator('input[name="loginTarget"]').inputValue(), '25');
        assert.equal(await page.locator('input[name="confirmed"]').isChecked(), false);
        assert.equal(await page.getByRole('button', { name: 'Create impersonated session' }).isDisabled(), true);
        await page.screenshot({
            path: path.join(output, 'activity-target-and-confirmation-desktop.png'),
            fullPage: true,
        });
    });
    await check('scoped zero remains zero in overview', async () => {
        await page.goto(base + '/app/dashboard');
        await page.getByRole('combobox', { name: 'Filter usage by authentication block' }).click();
        await page.getByRole('option', { name: 'People portal', exact: true }).click();
        await page.waitForTimeout(300);
        assert.equal((await page.locator('.metric-card').first().innerText()).includes('\n0\n'), true);
        assert.match(await page.locator('p[role="status"]').innerText(), /People portal/);
    });
    await check('request detail opens and closes with literal sanitized response', async () => {
        await page.goto(base + '/app/logs');
        await page.waitForTimeout(350);
        const row = page.locator('tr[mat-row]').first();
        await row.click();
        await page.getByRole('dialog').waitFor();
        await page
            .getByRole('dialog')
            .getByText(/session_expired/)
            .waitFor();
        assert.match(await page.getByRole('dialog').innerText(), /session_expired|Session expired/);
        await page.getByRole('button', { name: /Close/i }).last().click();
        await page.getByRole('dialog').waitFor({ state: 'hidden' });
    });
    for (const state of ['denied', 'error', 'empty'])
        await check(`people ${state} state`, async () => {
            await page.goto(base + '/app/users?reviewState=' + state);
            await page.waitForTimeout(350);
            const text = await page.locator('body').innerText();
            if (state === 'empty') assert.match(text, /No people match/);
            else {
                assert.match(text, state === 'denied' ? /permission to view users/ : /could not be loaded/);
                assert.equal(text.includes('No people match'), false);
            }
            await page.screenshot({ path: path.join(output, `people-${state}-desktop.png`), fullPage: true });
        });
    await check('error retry recovers without a page reload', async () => {
        await page.goto(base + '/app/users?reviewState=error');
        await page.getByRole('alert').waitFor();
        await page.evaluate(() => history.replaceState({}, '', '/app/users'));
        await page.getByRole('button', { name: 'Retry', exact: true }).click();
        await page.waitForFunction(() => document.querySelectorAll('tr[mat-row]').length === 5);
        assert.equal(await page.getByRole('alert').count(), 0);
    });
    await check('company and block filter menu applies both values', async () => {
        await page.goto(base + '/app/users');
        await page.getByRole('button', { name: 'Filter', exact: true }).click();
        await page.getByRole('textbox', { name: 'Company Name', exact: true }).fill('Acme');
        await page.getByRole('combobox', { name: 'Block', exact: true }).click();
        await page.getByRole('option', { name: 'People portal', exact: true }).click();
        await page.getByRole('button', { name: 'Apply', exact: true }).click();
        await page.waitForFunction(() => document.querySelectorAll('tr[mat-row]').length === 3);
    });
    await check('Login as requires reason and confirmation and handles a denied operation', async () => {
        await page.goto(base + '/app/activity?target_user_id=25');
        await page.locator('summary').filter({ hasText: 'Login as' }).click();
        await page.getByRole('textbox', { name: 'Reason', exact: true }).fill('Synthetic local support investigation');
        assert.equal(await page.getByRole('button', { name: 'Create impersonated session' }).isDisabled(), true);
        await page.locator('input[name="confirmed"]').check();
        await page.getByRole('button', { name: 'Create impersonated session' }).click();
        await page.getByRole('alert').filter({ hasText: 'requires an Owner' }).waitFor();
        assert.equal(await page.locator('input[name="confirmed"]').isChecked(), false);
        await page.screenshot({ path: path.join(output, 'login-as-denied-desktop.png'), fullPage: true });
    });
    await check('expanded analytics dialog opens and closes', async () => {
        await page.goto(base + '/app/dashboard');
        await page.getByRole('button', { name: 'Expand Signups', exact: true }).click();
        await page.getByRole('dialog').waitFor();
        await page.getByRole('button', { name: 'Close expanded chart', exact: true }).click();
        await page.getByRole('dialog').waitFor({ state: 'hidden' });
    });
    await check('login field validation and password visibility', async () => {
        await page.goto(base + '/login');
        await page.locator('#login-email').fill('invalid-email');
        await page.getByRole('button', { name: 'Log in to your account', exact: true }).click();
        await page.waitForFunction(
            () => document.getElementById('login-email')?.getAttribute('aria-invalid') === 'true'
        );
        assert.equal(await page.locator('#login-email').getAttribute('aria-invalid'), 'true');
        await page.locator('#login-password').fill('synthetic-review-only');
        await page.getByRole('button', { name: 'Show password', exact: true }).click();
        await page.waitForFunction(() => document.getElementById('login-password')?.getAttribute('type') === 'text');
        assert.equal(await page.locator('#login-password').getAttribute('type'), 'text');
        await page.getByRole('button', { name: 'Hide password', exact: true }).click();
        await page.waitForFunction(
            () => document.getElementById('login-password')?.getAttribute('type') === 'password'
        );
        assert.equal(await page.locator('#login-password').getAttribute('type'), 'password');
    });
    const audit = [
        '/about',
        '/security',
        '/pricing',
        '/privacy',
        '/terms',
        '/contact',
        '/login',
        '/register',
        '/docs',
        '/app/features/create',
        '/app/features/manage/11',
        '/app/billing',
        '/app/chatbot',
    ];
    for (const route of audit) {
        const errors = [];
        const handle = (error) => errors.push(error.message);
        page.on('pageerror', handle);
        await page.goto(base + route);
        await page.waitForTimeout(450);
        report.routes.push({
            version: 'after',
            viewport: 'desktop',
            route,
            errors,
            ...(await page.evaluate(() => ({
                documentWidth: document.documentElement.scrollWidth,
                width: innerWidth,
                headings: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
                text: document.body.innerText.slice(0, 500),
            }))),
        });
        page.off('pageerror', handle);
    }
    await check('mobile website and workspace navigation', async () => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(base);
        await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
        await page.locator('#mobile-navigation').getByRole('link', { name: 'Our approach', exact: true }).click();
        await page.waitForURL('**/about');
        await page.goto(base + '/app/dashboard');
        await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
        await page.getByRole('link', { name: 'People', exact: true }).click();
        await page.waitForURL('**/app/users');
        assert.equal(await page.locator('.sidebar-scrim').count(), 0);
    });
    await check('mobile profile details reveal secondary fields', async () => {
        await page.goto(base + '/app/users');
        const details = page.locator('.mobile-profile-details').first();
        await details.locator('summary').click();
        assert.match(await details.innerText(), /User ID/);
        assert.match(await details.innerText(), /25/);
        await page.screenshot({ path: path.join(output, 'people-mobile-profile-details.png'), fullPage: true });
    });
    await check('mobile activity prioritizes records and reveals advanced filters', async () => {
        await page.goto(base + '/app/activity');
        const filters = page.locator('.activity-filter-panel');
        assert.equal(await filters.getAttribute('open'), null);
        await filters.locator('summary').click();
        assert.equal(await page.locator('input[name="target"]').isVisible(), true);
    });
    await browser.close();
    report.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(output, 'browser-report.json'), JSON.stringify(report, null, 2));
    console.log(
        JSON.stringify(
            {
                screenshots: fs.readdirSync(output).filter((f) => f.endsWith('.png')).length,
                interactions: report.interactions.length,
                failures: report.failures,
                consoleErrors: report.consoleErrors,
                routeErrors: report.routes.filter((r) => r.errors.length),
                documentOverflow: report.routes
                    .filter((r) => r.documentWidth > r.width + 1)
                    .map((r) => ({
                        version: r.version,
                        viewport: r.viewport,
                        route: r.route,
                        overflow: r.documentWidth - r.width,
                    })),
            },
            null,
            2
        )
    );
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
