/**
 * build-elements.js
 *
 * Post-build script for the 36Blocks widget.
 * Concatenates all Angular Element output chunks (polyfills → vendor → main),
 * inlines the compiled CSS, wraps everything in a singleton guard to prevent
 * duplicate execution when the script is loaded more than once, and writes
 * the final self-contained bundle to the host app's public assets directory.
 *
 * Output: dist/apps/36-blocks/browser/assets/proxy-auth/proxy-auth.js
 *
 * Usage (package.json / nx.json):
 *   node apps/36-blocks-widget/build-elements.js
 */
const fs = require('fs-extra');
const path = require('path');

(async function build() {
    const distDir = './dist/apps/36-blocks-widget/browser';
    const distOutDir = './dist/apps/36-blocks/browser/assets/proxy-auth';

    if (!(await fs.pathExists(distDir))) {
        throw new Error(`Widget dist not found: ${distDir}`);
    }

    // Dynamic discovery with priority-based ordering — future-proof against Angular output changes
    // Handles both plain (outputHashing: none) and hashed (outputHashing: all) filenames
    const allFiles = await fs.readdir(distDir);
    const priority = ['polyfills', 'vendor', 'scripts', 'main'];
    const jsFiles = allFiles
        .filter((f) => f.endsWith('.js') && !f.startsWith('chunk-'))
        .sort((a, b) => {
            const getPriority = (f) => {
                const index = priority.findIndex((p) => f.startsWith(p) || f.includes(`/${p}`));
                return index === -1 ? priority.length : index;
            };
            return getPriority(a) - getPriority(b);
        });

    if (jsFiles.length === 0) {
        throw new Error(`No JS files found in ${distDir}`);
    }

    console.info('Concatenating:', jsFiles);

    // Read and concat all JS files in order
    const contents = [];
    for (const file of jsFiles) {
        contents.push(await fs.readFile(path.join(distDir, file), 'utf8'));
    }

    // Inline styles CSS — supports both styles.css (no hash) and styles-XXXXXXXX.css (outputHashing: all)
    const stylesCssFile = allFiles.find((f) => f.startsWith('styles') && f.endsWith('.css'));
    const stylesPath = stylesCssFile ? path.join(distDir, stylesCssFile) : null;
    if (stylesPath && (await fs.pathExists(stylesPath))) {
        console.info(`Inlining ${stylesCssFile}...`);
        const cssContent = await fs.readFile(stylesPath, 'utf8');
        // Escape backticks and backslashes for JS template literal
        const escapedCSS = cssContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

        // Create a self-executing function that injects styles into document.head
        const styleInjector = `
(function() {
    if (typeof window === 'undefined' || !window.document) return;
    if (document.getElementById('proxy-auth-widget-styles')) return;
    
    var style = document.createElement('style');
    style.id = 'proxy-auth-widget-styles';
    style.textContent = \`${escapedCSS}\`;
    
    // Store CSS content globally so widget-portal service can access it
    if (!window.__proxyAuth) window.__proxyAuth = {};
    window.__proxyAuth.inlinedStyles = \`${escapedCSS}\`;
    
    // Inject into document.head
    (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
})();
`;
        contents.push(styleInjector);
    } else {
        console.warn('styles.css not found - skipping CSS inlining');
    }

    await fs.ensureDir(distOutDir);

    // Wrap the entire bundle in a singleton guard so loading the script a second
    // time (e.g. duplicate <script> tags on the client page) is a complete no-op.
    const bundleBody = contents.join('\n');

    const buildDate = new Date().toISOString();
    const banner = `/**
 * 36Blocks Authentication Widget — proxy-auth.js
 *
 * Copyright (c) ${new Date().getFullYear()} Walkover. All rights reserved.
 *
 * This script is auto-generated. Do not edit directly.
 * Built: ${buildDate}
 *
 * Usage — Authorization (type: 'authorization'):
 *
 *   <!-- 1. Mount point: id must exactly match referenceId -->
 *   <div id="YOUR_REFERENCE_ID"></div>
 *
 *   <!-- 2. Define config -->
 *   <script type="text/javascript">
 *     var configuration = {
 *       referenceId: 'YOUR_REFERENCE_ID',  // must match the div id above
 *       type: 'authorization',             // default — can be omitted
 *       theme: 'system',                   // 'system' | 'light' | 'dark'  (default: 'system')
 *       success: function(data)  { console.log('success', data); },
 *       failure: function(error) { console.log('failure', error); },
 *     };
 *   <\/script>
 *
 *   <!-- 3. Load script and call initVerification -->
 *   <script type="text/javascript" onload="initVerification(configuration)" src="SCRIPT_URL"><\/script>
 *
 * ---
 *
 * Usage — Authenticated views (type: 'user-profile' | 'user-management' | 'organization-details'):
 *
 *   <!-- 1. Mount point: use the fixed id "userProxyContainer" for authenticated views -->
 *   <div id="userProxyContainer"></div>
 *
 *   <!-- 2. Define config -->
 *   <script type="text/javascript">
 *     var configuration = {
 *       type: 'user-profile',              // 'user-profile' | 'user-management' | 'organization-details'
 *       authToken: 'ENCRYPTED_TOKEN',      // required — obtained from the authorization success callback
 *       theme: 'system',                   // 'system' | 'light' | 'dark'  (default: 'system')
 *       success: function(data)  { console.log('success', data); },
 *       failure: function(error) { console.log('failure', error); },
 *     };
 *   <\/script>
 *
 *   <!-- 3. Load script and call initVerification -->
 *   <script type="text/javascript" onload="initVerification(configuration)" src="SCRIPT_URL"><\/script>
 *
 * Duplicate-load safe: loading this script more than once on the same page
 * is a no-op — only the first execution registers the custom element.
 */`;

    // JS is single-threaded in the browser — two <script> tags execute serially,
    // never in parallel, so a simple flag check is sufficient and race-free.
    const guardedBundle = `${banner}
(function() {
    if (window.__proxyAuthLoaded) { return; }
    window.__proxyAuthLoaded = true;
${bundleBody}
})();
`;

    // Write the fresh build to dist (production / CI path)
    const outPath = path.join(distOutDir, 'proxy-auth.js');
    await fs.writeFile(outPath, guardedBundle);

    // Also copy to the app's source assets so the Angular dev server can serve it
    // at /assets/proxy-auth/proxy-auth.js without a production build.
    const srcAssetsDir = './apps/36-blocks/src/assets/proxy-auth';
    const srcAssetsPath = path.join(srcAssetsDir, 'proxy-auth.js');
    await fs.ensureDir(srcAssetsDir);
    await fs.copyFile(outPath, srcAssetsPath);

    const stats = await fs.stat(outPath);
    const sizeMB = (stats.size / 1048576).toFixed(2);
    console.info(`✓ proxy-auth.js created: ${sizeMB} MB`);
    if (stats.size > 3 * 1048576) {
        console.warn('WARNING: proxy-auth.js exceeds 3 MB — check for bundle bloat!');
    }
    console.info(`✓ Written to: ${distOutDir}/`);
    console.info(`✓ Dev copy:   ${srcAssetsDir}/`);

    console.info('\n🎉 Elements created successfully!');
    console.info(`   • ${distOutDir}/proxy-auth.js → LATEST BUILD (${sizeMB} MB)`);
    console.info(`   • ${srcAssetsDir}/proxy-auth.js → DEV SERVER COPY`);
})();
