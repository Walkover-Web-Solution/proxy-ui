const fs = require('fs-extra');
const concat = require('concat');
const path = require('path');

(async function build() {
    console.info(`Building elements for ${process.cwd()}...`);

    const distDir = './dist/apps/proxy-auth';
    const allFiles = await fs.readdir(distDir);

    // Find each chunk by prefix — order matters: runtime → polyfills → main
    const findChunk = (prefix) => {
        const match = allFiles.find((f) => f.startsWith(prefix) && f.endsWith('.js'));
        if (!match) throw new Error(`Could not find ${prefix}*.js in ${distDir}`);
        return path.join(distDir, match);
    };

    const files = [
        findChunk('runtime'),
        findChunk('polyfills'),
        findChunk('main'),
    ];

    console.info('Concatenating:', files);

    await fs.ensureDir('./dist/apps/proxy/assets/proxy-auth');

    await concat(files, './dist/apps/proxy/assets/proxy-auth/proxy-auth.js');

    console.info('Elements created successfully!');
})();
