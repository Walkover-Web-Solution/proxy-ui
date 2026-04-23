const path = require('path');
const fs = require('fs');
const util = require('util');

// get application version from package.json
const appVersion = require('../package.json').version;

// promisify core API's
const readDir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

console.log('\nRunning post-build tasks');

// our version.json will be in the dist folder
let rootDirectiory = '';
for (var i = 0; i < process.argv.length; i++) {
    console.log(process.argv[i]);
    if (process.argv[i].startsWith('--path=')) {
        let rawPath = process.argv[i].replace('--path=', '').replace(' ', '');
        // application builder outputs into a browser/ subdirectory
        const browserSubdir = rawPath + '/browser';
        const browserAbsPath = path.join(__dirname, '../' + browserSubdir);
        if (fs.existsSync(browserAbsPath)) {
            rawPath = browserSubdir;
        }
        rootDirectiory = '../' + rawPath;
        console.log('Dist Folder Path = ' + rootDirectiory);
    }
}

const versionFilePath = path.join(__dirname, rootDirectiory, 'version.json');

let mainHash = '';
let mainBundleFile = '';

// RegExp to find main.bundle.js, even if it doesn't include a hash in it's name (dev build)
let mainBundleRegexp = /^main.?([a-z0-9]*)?.js$/;

// read the dist folder files and find the one we're looking for
readDir(path.join(__dirname, rootDirectiory))
    .then((files) => {
        mainBundleFile = files.find((f) => mainBundleRegexp.test(f));
        if (mainBundleFile) {
            let matchHash = mainBundleFile.match(mainBundleRegexp);

            // if it has a hash in it's name, mark it down
            if (matchHash.length > 1 && !!matchHash[1]) {
                mainHash = matchHash[1];
            }
        }

        console.log(`Writing version and hash to ${versionFilePath}`);

        // write current version and hash into the version.json file
        const src = `{"version": "${appVersion}", "hash": "${mainHash}"}`;
        return writeFile(versionFilePath, src);
    })
    .then(() => {
        // main bundle file not found, dev build?
        if (!mainBundleFile) {
            return;
        }

        console.log(`Replacing hash in the ${mainBundleFile}`);

        // replace hash placeholder in our main.js file so the code knows it's current hash
        const mainFilepath = path.join(__dirname, rootDirectiory, mainBundleFile);
        return readFile(mainFilepath, 'utf8').then((mainFileData) => {
            const replacedFile = mainFileData.replace('{{POST_BUILD_ENTERS_HASH_HERE}}', mainHash);
            return writeFile(mainFilepath, replacedFile);
        });
    })
    .then(() => {
        // Copy index.csr.html → app/index.html so static hosts (Amplify, S3, Nginx)
        // can route /app/* to a clean Angular shell instead of the prerendered home page.
        const csrHtmlPath = path.join(__dirname, rootDirectiory, 'index.csr.html');
        const appShellDir = path.join(__dirname, rootDirectiory, 'app');
        const appShellPath = path.join(appShellDir, 'index.html');

        if (fs.existsSync(csrHtmlPath)) {
            if (!fs.existsSync(appShellDir)) {
                fs.mkdirSync(appShellDir, { recursive: true });
            }

            let appShellHtml = fs.readFileSync(csrHtmlPath, 'utf8');

            // Force base href to "/" so JS chunks load from the root, not from /app/
            if (!appShellHtml.includes('<base href="/">')) {
                appShellHtml = appShellHtml.replace(/<base\s+href="[^"]*"\s*\/?>/i, '<base href="/" />');
            }

            fs.writeFileSync(appShellPath, appShellHtml);
            console.log(`Copied index.csr.html → app/index.html (base href enforced)`);
        } else {
            console.log('index.csr.html not found, skipping app/index.html copy');
        }
    })
    .catch((err) => {
        console.log('Error with post build:', err);
    });
