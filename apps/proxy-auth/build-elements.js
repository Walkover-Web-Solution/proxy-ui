const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
    console.info(`Building elements for ${process.cwd()}...`);

    let files = [
        './dist/apps/proxy-auth/main.js',
    ];

    await fs.ensureDir('./dist/apps/proxy/assets/proxy-auth');

    await concat(files, './dist/apps/proxy/assets/proxy-auth/proxy-auth.js');

    console.info('Elements created successfully!');
})();
