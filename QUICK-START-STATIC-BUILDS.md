# Quick Start: Static Build Strategy

## 🚀 Quick Commands

### Build for Production
```bash
npm run build:proxy-auth:prod
```
Creates:
- `proxy-auth.js` → Static from `stable-builds/prod/`
- `proxy-auth-new.js` → Latest build

### Build for Test
```bash
npm run build:proxy-auth:test
```
Creates:
- `proxy-auth.js` → Static from `stable-builds/test/`
- `proxy-auth-new.js` → Latest build

### Build for Stage
```bash
npm run build:proxy-auth:stage
```
Creates:
- `proxy-auth.js` → Static from `stable-builds/test/`
- `proxy-auth-new.js` → Latest build

## 📍 Where Files Are Created

Both locations get the same files:

1. **Source assets**: `apps/36-blocks/src/assets/proxy-auth/`
2. **Dist output**: `dist/apps/36-blocks/browser/assets/proxy-auth/`

## 🧪 Testing New Builds

### Step 1: Build
```bash
npm run build:proxy-auth:test
```

### Step 2: Test with proxy-auth-new.js
```html
<script src="https://test.proxy.msg91.com/assets/proxy-auth/proxy-auth-new.js"></script>
```

### Step 3: If tests pass, promote to stable
```bash
# Copy tested build to stable
cp dist/apps/36-blocks/browser/assets/proxy-auth/proxy-auth-new.js \
   stable-builds/prod/proxy-auth.js

# Rebuild to update deployments
npm run build:proxy-auth:prod
```

## 🔄 Promoting Builds Checklist

Before updating stable builds:

- [ ] New build tested in test environment
- [ ] No console errors
- [ ] Authentication flows work
- [ ] Social logins functional
- [ ] Mobile responsiveness verified
- [ ] Dark mode working

Then:

```bash
# Update stable files
cp dist/apps/36-blocks/browser/assets/proxy-auth/proxy-auth-new.js stable-builds/prod/proxy-auth.js
cp dist/apps/36-blocks/browser/assets/proxy-auth/proxy-auth-new.js stable-builds/test/proxy-auth.js

# Commit
git add stable-builds/
git commit -m "chore: promote tested build to stable"

# Rebuild
npm run build:prod
```

## 📋 Current URLs

### Production
- **Stable**: `https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js`
- **Testing**: `https://proxy.msg91.com/assets/proxy-auth/proxy-auth-new.js`

### Test
- **Stable**: `https://test.proxy.msg91.com/assets/proxy-auth/proxy-auth.js`
- **Testing**: `https://test.proxy.msg91.com/assets/proxy-auth/proxy-auth-new.js`

## ⚠️ Important Notes

1. **Never deploy without testing** - Always test `proxy-auth-new.js` first
2. **Keep stable-builds in git** - These are your production safety net
3. **Check file sizes** - Build warns if >3 MB
4. **Document changes** - Update changelog when promoting builds

## 📖 Full Documentation

See `STATIC-BUILD-STRATEGY.md` for:
- Complete architecture details
- Revert instructions
- Troubleshooting guide
- Change history

---

**Quick Help**: If you just want to build normally, use:
```bash
npm run build:proxy-auth:prod  # Production
npm run build:proxy-auth:test  # Test
```

The static file strategy works automatically! 🎉
