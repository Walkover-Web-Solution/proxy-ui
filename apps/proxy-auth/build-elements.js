const fs = require('fs-extra');
const concat = require('concat');
const path = require('path');

(async function build() {
    console.info(`Building elements for ${process.cwd()}...`);

    const distDir = './dist/apps/proxy-auth';
    const allFiles = await fs.readdir(distDir);
    const mainFile = allFiles.find((f) => f.startsWith('main') && f.endsWith('.js'));

    if (!mainFile) {
        throw new Error(`Could not find main.js or main.<hash>.js in ${distDir}`);
    }

    const files = [path.join(distDir, mainFile)];

    await fs.ensureDir('./dist/apps/proxy/assets/proxy-auth');

    await concat(files, './dist/apps/proxy/assets/proxy-auth/proxy-auth.js');

    console.info('Elements created successfully!');
})();
