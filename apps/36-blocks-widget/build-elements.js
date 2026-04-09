const fs = require('fs-extra');
const path = require('path');

(async function build() {
    const distDir = './dist/apps/36-blocks-widget/browser';
    const outDir = './apps/36-blocks/src/assets/proxy-auth';
    
    // Detect environment from command line args or default to 'production'
    const environment = process.argv[2] || 'production';
    const validEnvironments = ['production', 'test', 'stage'];
    const selectedEnv = validEnvironments.includes(environment) ? environment : 'production';
    
    console.info(`Building for environment: ${selectedEnv}`);

    if (!(await fs.pathExists(distDir))) {
        throw new Error(`Widget dist not found: ${distDir}`);
    }

    // Dynamic discovery with priority-based ordering — future-proof against Angular output changes
    const allFiles = await fs.readdir(distDir);
    const priority = ['polyfills', 'vendor', 'main'];
    const jsFiles = allFiles
        .filter((f) => f.endsWith('.js'))
        .sort((a, b) => {
            const getPriority = (f) => {
                const index = priority.findIndex((p) => f.includes(p));
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

    // Inline styles.css if it exists
    const stylesPath = path.join(distDir, 'styles.css');
    if (await fs.pathExists(stylesPath)) {
        console.info('Inlining styles.css...');
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
    
    // ========================================
    // STEP 1: Write NEW build as proxy-auth-new.js
    // ========================================
    const newBuildPath = path.join(outDir, 'proxy-auth-new.js');
    await fs.writeFile(newBuildPath, contents.join('\n'));
    
    const newBuildStats = await fs.stat(newBuildPath);
    const newBuildSizeMB = (newBuildStats.size / 1048576).toFixed(2);
    console.info(`✓ proxy-auth-new.js created: ${newBuildSizeMB} MB`);
    if (newBuildStats.size > 3 * 1048576) {
        console.warn('WARNING: proxy-auth-new.js exceeds 3 MB — check for bundle bloat!');
    }

    // ========================================
    // STEP 2: Copy STABLE static file as proxy-auth.js
    // ========================================
    const stableEnv = selectedEnv === 'production' ? 'prod' : 'test';
    const stableFilePath = path.join('./stable-builds', stableEnv, 'proxy-auth.js');
    
    if (await fs.pathExists(stableFilePath)) {
        const staticOutPath = path.join(outDir, 'proxy-auth.js');
        await fs.copyFile(stableFilePath, staticOutPath);
        
        const staticStats = await fs.stat(staticOutPath);
        const staticSizeMB = (staticStats.size / 1048576).toFixed(2);
        console.info(`✓ proxy-auth.js (STATIC) copied from stable-builds/${stableEnv}: ${staticSizeMB} MB`);
    } else {
        console.warn(`WARNING: Static file not found at ${stableFilePath} — skipping static copy`);
    }

    // ========================================
    // STEP 3: Copy both files to dist output directory
    // ========================================
    const distOutDir = './dist/apps/36-blocks/browser/assets/proxy-auth';
    await fs.ensureDir(distOutDir);
    
    // Copy new build
    await fs.copyFile(newBuildPath, path.join(distOutDir, 'proxy-auth-new.js'));
    console.info(`✓ Copied proxy-auth-new.js to: ${distOutDir}/`);
    
    // Copy static file
    if (await fs.pathExists(stableFilePath)) {
        await fs.copyFile(stableFilePath, path.join(distOutDir, 'proxy-auth.js'));
        console.info(`✓ Copied proxy-auth.js (STATIC) to: ${distOutDir}/`);
    }

    console.info('\n🎉 Elements created successfully!');
    console.info(`   • proxy-auth.js     → STATIC (from stable-builds/${stableEnv})`);
    console.info(`   • proxy-auth-new.js → LATEST BUILD (${newBuildSizeMB} MB)`);
})();
