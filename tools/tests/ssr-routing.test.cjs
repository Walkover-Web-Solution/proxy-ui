// Run: node --test tools/tests/ssr-routing.test.cjs
// Loads the actual server entry with real Express; only Angular's rendering
// adapter is substituted so registration, static middleware and HTTP routing run.
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { pathToFileURL } = require('node:url');
const vm = require('node:vm');
const ts = require('typescript');

async function withServer(render, run) {
    const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), '36blocks-ssr-'));
    const browserFolder = path.join(fixtureRoot, 'browser');
    mkdirSync(browserFolder);
    writeFileSync(path.join(browserFolder, 'widget.js'), 'window.widgetReady = true;');
    const sourcePath = path.resolve(__dirname, '../../apps/36-blocks/src/server.ts');
    // CommonJS VM execution needs the ESM entry URL supplied explicitly. Route
    // declarations and middleware are executed directly from the source file.
    const source = readFileSync(sourcePath, 'utf8').replaceAll(
        'import.meta.url',
        JSON.stringify(pathToFileURL(path.join(fixtureRoot, 'server', 'server.mjs')).href)
    );
    const compiled = ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    const module = { exports: {} };
    let server;
    try {
        vm.runInNewContext(compiled, {
            module,
            exports: module.exports,
            process,
            console,
            require: (name) =>
                name === '@angular/ssr/node'
                    ? {
                          AngularNodeAppEngine: class {
                              handle(req) {
                                  return Promise.resolve().then(() => render(req));
                              }
                          },
                          createNodeRequestHandler: (app) => app,
                          isMainModule: () => false,
                          writeResponseToNodeResponse: (response, res) => {
                              res.status(response.status).send(response.body);
                          },
                      }
                    : require(name),
        });
        const app = module.exports.app();
        app.set('env', 'test');
        server = app.listen(0, '127.0.0.1');
        await once(server, 'listening');
        await run(`http://127.0.0.1:${server.address().port}`);
    } finally {
        if (server) await new Promise((resolve) => server.close(resolve));
        rmSync(fixtureRoot, { recursive: true, force: true });
    }
}

test('SSR server starts under Express 5 and renders root and nested browser routes', async () => {
    await withServer(
        (req) => ({ status: 200, body: `Rendered ${req.path}` }),
        async (baseUrl) => {
            for (const route of ['/', '/about', '/app/activity', '/deep/nested/path?filter=test']) {
                const response = await fetch(`${baseUrl}${route}`);
                assert.equal(response.status, 200);
                assert.equal(await response.text(), `Rendered ${route.split('?')[0]}`);
            }
        }
    );
});

test('static assets are served before SSR with caching and HEAD support', async () => {
    let renders = 0;
    await withServer(
        () => {
            renders++;
            return { status: 200, body: 'SSR fallback' };
        },
        async (baseUrl) => {
            const response = await fetch(`${baseUrl}/widget.js`);
            assert.equal(response.status, 200);
            assert.equal(await response.text(), 'window.widgetReady = true;');
            assert.match(response.headers.get('cache-control'), /max-age=31536000/);
            const head = await fetch(`${baseUrl}/widget.js`, { method: 'HEAD' });
            assert.equal(head.status, 200);
            assert.equal(await head.text(), '');
            assert.equal(renders, 0);
        }
    );
});

test('unhandled SSR requests fall through to 404', async () => {
    await withServer(
        () => null,
        async (baseUrl) => {
            const response = await fetch(`${baseUrl}/unhandled`);
            assert.equal(response.status, 404);
        }
    );
});

test('rendering failures reach Express error handling rather than leaving requests pending', async () => {
    await withServer(
        () => {
            throw new Error('SSR test render failure');
        },
        async (baseUrl) => {
            const response = await fetch(`${baseUrl}/broken`);
            assert.equal(response.status, 500);
        }
    );
});
