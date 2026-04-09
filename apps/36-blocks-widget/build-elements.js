const fs = require('fs-extra');
const path = require('path');

(async function build() {
    const distDir = './dist/apps/36-blocks-widget/browser';
    const outDir = './apps/36-blocks/src/assets/proxy-auth';

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

    await fs.ensureDir(outDir);

    // Write the fresh build as proxy-auth.js
    const outPath = path.join(outDir, 'proxy-auth.js');
    await fs.writeFile(outPath, contents.join('\n'));

    const stats = await fs.stat(outPath);
    const sizeMB = (stats.size / 1048576).toFixed(2);
    console.info(`✓ proxy-auth.js created: ${sizeMB} MB`);
    if (stats.size > 3 * 1048576) {
        console.warn('WARNING: proxy-auth.js exceeds 3 MB — check for bundle bloat!');
    }

    // Copy to dist output directory
    const distOutDir = './dist/apps/36-blocks/browser/assets/proxy-auth';
    await fs.ensureDir(distOutDir);
    await fs.copyFile(outPath, path.join(distOutDir, 'proxy-auth.js'));
    console.info(`✓ Copied proxy-auth.js to: ${distOutDir}/`);

    console.info('\n🎉 Elements created successfully!');
    console.info(`   • proxy-auth.js → LATEST BUILD (${sizeMB} MB)`);
})();
