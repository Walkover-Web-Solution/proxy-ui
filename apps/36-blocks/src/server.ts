import {
    AngularNodeAppEngine,
    createNodeRequestHandler,
    isMainModule,
    writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export function app(): express.Express {
    const server = express();
    const serverDistFolder = dirname(fileURLToPath(import.meta.url));
    const browserDistFolder = resolve(serverDistFolder, '../browser');
    const angularApp = new AngularNodeAppEngine();

    server.get(
        '**',
        express.static(browserDistFolder, {
            maxAge: '1y',
            index: 'index.html',
        })
    );

    server.get('**', (req, res, next) => {
        angularApp
            .handle(req, { server: res })
            .then((response) => {
                if (response) {
                    writeResponseToNodeResponse(response, res);
                } else {
                    next();
                }
            })
            .catch(next);
    });

    return server;
}

function run(): void {
    const port = process.env['PORT'] || 4000;
    const server = app();
    server.listen(port, () => {
        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

if (isMainModule(import.meta.url)) {
    run();
}

export default createNodeRequestHandler(app());
