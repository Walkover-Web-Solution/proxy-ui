# Static Build Strategy for proxy-auth.js

## 📋 Overview

This document explains the static file strategy implemented for the 36Blocks authentication widget (`proxy-auth.js`). This strategy ensures **backward compatibility** for existing clients while allowing safe testing of new builds.

## 🎯 Problem Statement

Production clients depend on stable URLs:
- **Production**: `https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js`
- **Test**: `https://test.proxy.msg91.com/assets/proxy-auth/proxy-auth.js`

Direct deployment of new builds could break existing client integrations. We needed a way to:
1. Keep stable, tested versions available at these URLs
2. Test new builds safely before rolling them out
3. Provide an easy rollback mechanism

## 🏗️ Solution Architecture

### File Structure

```
proxy-ui/
├── stable-builds/
│   ├── prod/
│   │   └── proxy-auth.js          # Stable production build
│   └── test/
│       └── proxy-auth.js          # Stable test build
│
├── apps/36-blocks-widget/
│   └── build-elements.js          # Modified build script
│
└── dist/apps/36-blocks/browser/assets/proxy-auth/
    ├── proxy-auth.js              # STATIC (copied from stable-builds)
    └── proxy-auth-new.js          # LATEST BUILD (for testing)
```

### Build Process

When you run the build, the script now:

1. **Builds the widget** from source code
2. **Creates TWO files**:
   - `proxy-auth-new.js` → Latest build from source (for testing)
   - `proxy-auth.js` → Static copy from `stable-builds/{env}/` (for production clients)

### Environment Mapping

| Build Config | Stable Source | Output |
|-------------|---------------|--------|
| `production` | `stable-builds/prod/proxy-auth.js` | Production deployment |
| `test` | `stable-builds/test/proxy-auth.js` | Test deployment |
| `stage` | `stable-builds/test/proxy-auth.js` | Staging deployment |

## 🚀 Usage

### Building for Production

```bash
# Build widget
nx build 36-blocks-widget --configuration=production

# Run build-elements script (automatically uses 'production' env)
node apps/36-blocks-widget/build-elements.js production
```

### Building for Test/Stage

```bash
# Build widget
nx build 36-blocks-widget --configuration=test

# Run build-elements script with test environment
node apps/36-blocks-widget/build-elements.js test
```

### Testing New Builds

To test a new build before promoting it to stable:

1. Build the widget
2. Use `proxy-auth-new.js` in your test environment:
   ```html
   <script src="https://test.proxy.msg91.com/assets/proxy-auth/proxy-auth-new.js"></script>
   ```
3. Verify functionality
4. If successful, promote the build (see below)

### Promoting a New Build to Stable

When a new build is thoroughly tested and ready for production:

```bash
# 1. Copy the tested build to stable-builds
cp dist/apps/36-blocks/browser/assets/proxy-auth/proxy-auth-new.js \
   stable-builds/prod/proxy-auth.js

# 2. For test environment
cp dist/apps/36-blocks/browser/assets/proxy-auth/proxy-auth-new.js \
   stable-builds/test/proxy-auth.js

# 3. Rebuild to update the deployed proxy-auth.js
node apps/36-blocks-widget/build-elements.js production
```

**Alternative**: Update stable files manually after verifying in production.

## 🔄 How to Revert to Direct Build (Old Behavior)

If you need to remove the static file strategy and go back to direct builds:

### Step 1: Restore Original build-elements.js

Replace the current `build-elements.js` with this simplified version:

```javascript
const fs = require('fs-extra');
const path = require('path');

(async function build() {
    const distDir = './dist/apps/36-blocks-widget/browser';
    const outDir = './apps/36-blocks/src/assets/proxy-auth';

    if (!(await fs.pathExists(distDir))) {
        throw new Error(`Widget dist not found: ${distDir}`);
    }

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

    const contents = [];
    for (const file of jsFiles) {
        contents.push(await fs.readFile(path.join(distDir, file), 'utf8'));
    }

    const stylesPath = path.join(distDir, 'styles.css');
    if (await fs.pathExists(stylesPath)) {
        console.info('Inlining styles.css...');
        const cssContent = await fs.readFile(stylesPath, 'utf8');
        const escapedCSS = cssContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
        
        const styleInjector = `
(function() {
    if (typeof window === 'undefined' || !window.document) return;
    if (document.getElementById('proxy-auth-widget-styles')) return;
    
    var style = document.createElement('style');
    style.id = 'proxy-auth-widget-styles';
    style.textContent = \`${escapedCSS}\`;
    
    if (!window.__proxyAuth) window.__proxyAuth = {};
    window.__proxyAuth.inlinedStyles = \`${escapedCSS}\`;
    
    (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
})();
`;
        contents.push(styleInjector);
    } else {
        console.warn('styles.css not found - skipping CSS inlining');
    }

    await fs.ensureDir(outDir);
    const outPath = path.join(outDir, 'proxy-auth.js');
    await fs.writeFile(outPath, contents.join('\n'));

    const distOutDir = './dist/apps/36-blocks/browser/assets/proxy-auth';
    await fs.ensureDir(distOutDir);
    await fs.copyFile(outPath, path.join(distOutDir, 'proxy-auth.js'));

    const stats = await fs.stat(outPath);
    const sizeMB = (stats.size / 1048576).toFixed(2);
    console.info(`proxy-auth.js created: ${sizeMB} MB`);
    console.info(`Copied to: ${distOutDir}/proxy-auth.js`);
    if (stats.size > 3 * 1048576) {
        console.warn('WARNING: proxy-auth.js exceeds 3 MB — check for bundle bloat!');
    }

    console.info('Elements created successfully!');
})();
```

### Step 2: Remove Static Files (Optional)

```bash
# Remove stable-builds directory if no longer needed
rm -rf stable-builds/
```

### Step 3: Clean Build

```bash
# Clean and rebuild
rm -rf dist/
nx build 36-blocks-widget --configuration=production
node apps/36-blocks-widget/build-elements.js
```

## 📊 File Sizes Reference

Current stable builds:
- **Production** (`stable-builds/prod/proxy-auth.js`): ~1.5 MB
- **Test** (`stable-builds/test/proxy-auth.js`): ~1.7 MB

## ⚠️ Important Notes

1. **Never delete `stable-builds/` directory** — it contains production-critical files
2. **Always test `proxy-auth-new.js`** before promoting to stable
3. **Keep `stable-builds/` in version control** — these are your rollback point
4. **Monitor bundle sizes** — the script warns if builds exceed 3 MB
5. **Environment detection** — script uses command line argument or defaults to 'production'

## 🔍 Verification

After building, verify the output:

```bash
# Check both files exist
ls -lh dist/apps/36-blocks/browser/assets/proxy-auth/

# Should show:
# - proxy-auth.js     (static, from stable-builds)
# - proxy-auth-new.js (latest build)
```

## 📝 Change Log

- **2026-04-09**: Initial implementation of static build strategy
  - Modified `build-elements.js` to support dual-file output
  - Created `stable-builds/` directory structure
  - Added environment-aware build process

## 🤝 Contributing

When making changes to the build process:

1. Test with both production and test configurations
2. Verify file sizes remain reasonable (<3 MB)
3. Update this documentation if behavior changes
4. Keep stable-builds in sync with tested releases

## � Troubleshooting

### Issue: proxy-auth-new.js has wrong credentials

If `proxy-auth-new.js` is built with TEST credentials on production:

#### **Step 1: Enable Debug Logging**

The `tools/set-env.js` script automatically logs debug info when running in CI (AWS Amplify). Look for these lines in AWS build logs:

```
[set-env DEBUG] Environment detection:
  CI: true
  NODE_ENV: production
  AWS_BRANCH: production
  isCI: true
[set-env DEBUG] AUTH_UI_ENCODE_KEY = 6bd88de3...
[set-env DEBUG] AUTH_UI_IV_KEY = 9df117bc...
```

The first 8 characters help you verify which credentials are being read **without exposing secrets**.

#### **Step 2: Compare Values**

Check if the preview matches your **production** or **test** credentials:
- Production `AUTH_UI_ENCODE_KEY` starts with: `6bd88de3` → ✅ Correct
- Test `AUTH_UI_ENCODE_KEY` starts with: `XXXXXXXX` → ❌ Wrong environment

#### **Step 3: Common Fixes**

**If AWS shows wrong values:**
1. Check AWS Amplify environment variables are set correctly
2. Verify the branch-specific env vars use correct suffix (`_PROD` vs `_TEST`)
3. Ensure `.env` file is created before `npm run build:prod` runs

**If set-env reads wrong values:**
1. Check `.env` file creation in AWS YML
2. Verify `dotenv` is loading the file correctly
3. Check for environment variable conflicts in AWS settings

#### **Step 4: Manual Verification**

Add this to AWS YML **after** creating `.env`:

```yaml
- cat .env  # Shows what's in .env file (secrets will be visible in logs!)
```

⚠️ **Warning**: This exposes secrets in build logs. Remove after debugging.

## �📞 Support

If you encounter issues:

1. Check the build script output for warnings
2. Verify `stable-builds/{env}/proxy-auth.js` exists
3. Ensure build script receives correct environment argument
4. Review the **debug logs** from `set-env` for credential verification
5. Compare first 8 chars of credentials in logs vs expected values

---

**Last Updated**: April 9, 2026  
**Maintained By**: 36Blocks Development Team