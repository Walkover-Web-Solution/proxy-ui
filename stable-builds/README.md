# Stable Builds Directory

## 📦 Purpose

This directory contains **production-stable versions** of the 36Blocks authentication widget (`proxy-auth.js`) that are used as static files for client deployments.

## 🗂️ Directory Structure

```
stable-builds/
├── prod/
│   └── proxy-auth.js    # Production-stable build
├── test/
│   └── proxy-auth.js    # Test-stable build
└── README.md            # This file
```

## 🎯 Why These Files Exist

Client applications depend on these URLs being stable and reliable:
- **Production**: `https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js`
- **Test**: `https://test.proxy.msg91.com/assets/proxy-auth/proxy-auth.js`

Instead of deploying every new build directly to these URLs (which could break client integrations), we:

1. Test new builds as `proxy-auth-new.js`
2. Only promote tested builds to these stable files
3. Deploy these stable files to the production URLs

## 🔒 Critical Files - Do Not Delete

**⚠️ WARNING**: These files are **production-critical**. Deleting them will break client integrations.

- ✅ **Keep in version control**
- ✅ **Update only after thorough testing**
- ❌ **Never delete without replacement**
- ❌ **Never modify directly in production**

## 📝 How to Update Stable Builds

### After Testing a New Build

When you've verified a new build works correctly:

```bash
# For production
cp dist/apps/36-blocks/browser/assets/proxy-auth/proxy-auth-new.js \
   stable-builds/prod/proxy-auth.js

# For test
cp dist/apps/36-blocks/browser/assets/proxy-auth/proxy-auth-new.js \
   stable-builds/test/proxy-auth.js

# Commit the changes
git add stable-builds/
git commit -m "chore: update stable proxy-auth builds"
```

## 📊 Current File Information

### Production Build
- **File**: `stable-builds/prod/proxy-auth.js`
- **Size**: ~1.5 MB
- **Usage**: Production deployments

### Test Build
- **File**: `stable-builds/test/proxy-auth.js`
- **Size**: ~1.7 MB
- **Usage**: Test/Stage deployments

## 🔄 Rollback Strategy

If a deployed build has issues:

1. Revert to previous commit in git
2. Rebuild to deploy the previous stable version
3. Investigate issues before promoting new builds

## 📖 More Information

See `STATIC-BUILD-STRATEGY.md` in the project root for complete documentation on:
- Build process details
- Testing procedures
- Promotion workflows
- Revert instructions

---

**Last Updated**: April 9, 2026  
**Maintained By**: 36Blocks Development Team
