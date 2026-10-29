// Requires npm run build:web first. Unlike ssr-routing.test.cjs, this starts the
// generated application with the actual Angular engine and generated manifests.
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { existsSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { pathToFileURL } = require('node:url');

const bundle = path.resolve(__dirname, '../../dist/apps/36-blocks/server/server.mjs');

test(
    'built SSR entry starts and serves prerendered home plus client-rendered public routes',
    {
        skip: !existsSync(bundle) && 'Run npm run build:web before the built SSR smoke check',
        timeout: 20000,
    },
    async () => {
        const { app } = await import(pathToFileURL(bundle).href);
        const server = app().listen(0, '127.0.0.1');
        try {
            await once(server, 'listening');
            const baseUrl = `http://127.0.0.1:${server.address().port}`;
            const home = await fetch(baseUrl, { signal: AbortSignal.timeout(5000) });
            assert.equal(home.status, 200);
            const homeHtml = await home.text();
            assert.match(homeHtml, /<h1\b/);
            assert.match(homeHtml, /Secure Auth/);
            for (const route of ['/docs', '/about', '/security', '/app/activity']) {
                const response = await fetch(`${baseUrl}${route}`, { signal: AbortSignal.timeout(5000) });
                assert.equal(response.status, 200, `${route} should serve its Angular client shell`);
                assert.match(response.headers.get('content-type'), /text\/html/);
                const html = await response.text();
                assert.match(html, /<proxy-root\b/);
                assert.match(html, /<script\b/);
            }
        } finally {
            await new Promise((resolve) => server.close(resolve));
        }
    }
);
