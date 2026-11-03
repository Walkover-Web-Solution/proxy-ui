// Loopback-only SPA server for an isolated review; never forwards an API request.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(process.argv[2] || 'dist/review/browser');
const port = Number(process.argv[3] || 4360);
const mime = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.woff2': 'font/woff2',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
};
http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.startsWith('/review-api')) {
        res.writeHead(403);
        return res.end('No live API in local review');
    }
    let file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep) && file !== root) {
        res.writeHead(403);
        return res.end();
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        if (path.extname(pathname)) {
            res.writeHead(404);
            return res.end('Asset not found');
        }
        file = path.join(root, 'index.html');
    }
    res.writeHead(200, {
        'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
        'Content-Security-Policy':
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'",
    });
    fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => process.stdout.write(`Local review: http://127.0.0.1:${port}\n`));
