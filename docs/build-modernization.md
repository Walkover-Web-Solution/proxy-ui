# Build System Modernization — Angular 21 + Nx 21

> Completed: March 2026

---

## Overview

Migrated both projects (Admin Panel `36-blocks` and Widget `36-blocks-widget`) from the legacy `@angular-devkit/build-angular:browser` builder to the modern `@angular-devkit/build-angular:application` builder powered by **esbuild**. Eliminated all deprecated APIs, modernized the widget bootstrap, and added CI guardrails.

---

## Before vs After

| Aspect | Before | After |
|---|---|---|
| **Builder** | `browser` (Webpack) | `application` (esbuild) |
| **Widget bootstrap** | NgModule (`ElementModule` + `platformBrowserDynamic`) | Standalone (`createApplication` + `provideHttpClient`, etc.) |
| **Widget entry** | `main.ts` + `main.element.ts` (legacy) | `main.ts` (prod) + `main.dev.ts` (dev-serve) |
| **Global APIs** | Defined inline in `element.module.ts` | Extracted to `init-verification.ts` (side-effect module) |
| **Custom element registration** | Inside NgModule constructor | `try-catch` guarded in `main.ts` with double-load protection |
| **Polyfills** | Separate `polyfills.ts` file | `polyfills: ["zone.js"]` in `project.json` |
| **JS concatenation** | Hardcoded filenames (`runtime.js`, `polyfills.js`, `main.js`) | Dynamic file discovery with priority sort |
| **tsconfig target** | `es2015` / `es2020` | `ES2022` (matches Angular CLI) |
| **Node version (CI)** | 16 | 20 |
| **Nx caching** | `build` not cached | `build` added to `cacheableOperations` |
| **Portal CSS** | No isolation | `isolation: isolate` on `.proxy-widget-portal` |
| **dayjs imports** | `import * as dayjs` (esbuild crash risk) | `import dayjs` (default import) |
| **Deprecated modules** | `HttpClientModule`, `BrowserAnimationsModule`, `StoreModule.forRoot()`, etc. | `provideHttpClient()`, `provideAnimations()`, `provideStore()`, etc. |
| **Widget bundle size** | ~1.40 MB | ~1.02 MB (27% reduction) |
| **Build time (widget)** | ~41s | ~15s |

---

## Current Build Flow

### Widget (`36-blocks-widget`)

```
npm run build:proxy-auth
```

1. **`set-env --auth`** — Injects `.env` variables into `env-variables.ts`
2. **`nx build 36-blocks-widget`** — esbuild compiles to `dist/apps/36-blocks-widget/browser/`
   - Entry: `src/main.ts` (standalone `createApplication`)
   - Side-effect import: `init-verification.ts` (registers `window.initVerification`, `window.__proxyAuth`)
   - Output: `polyfills.js`, `main.js`, `chunk-*.js` (no hashing)
3. **`build-elements.js`** — Post-build script:
   - Discovers all `.js` files in `browser/` directory
   - Sorts by priority: `polyfills` → `vendor` → `main` → rest
   - Concatenates into single `apps/36-blocks/src/assets/proxy-auth/proxy-auth.js`
   - Warns if bundle exceeds 3 MB

### Admin Panel (`36-blocks`)

```
npm run build:web:prod
```

1. **`set-env --proxy`** — Injects `.env` variables
2. **`nx build 36-blocks`** — esbuild compiles to `dist/apps/36-blocks/browser/`
   - Entry: `src/main.ts` (standalone `bootstrapApplication`)
   - Assets include `proxy-auth.js` from widget build
3. **`postbuild.js`** — Writes `version.json` and injects hash into `main.js`
   - Auto-detects `browser/` subdirectory (application builder output)

### Dev Serve (Widget)

```
npm run start:proxy-auth
```

- Uses `main.dev.ts` as entry point
- Standalone `bootstrapApplication(AppComponent, {...})` with all providers
- Registers `<proxy-auth>` custom element after bootstrap
- Imports `init-verification.ts` for global API registration

---

## Public API Contract (unchanged)

These contracts are preserved and must never break:

| Contract | Details |
|---|---|
| **Output file** | `apps/36-blocks/src/assets/proxy-auth/proxy-auth.js` |
| **Global function** | `window.initVerification(config)` |
| **Custom element** | `<proxy-auth>` |
| **Version metadata** | `window.__proxyAuth = { version, buildTime }` |
| **Show/hide** | `window.showUserManagement()` / `window.hideUserManagement()` |

---

## Files Changed

### New Files

| File | Purpose |
|---|---|
| `apps/36-blocks-widget/src/app/init-verification.ts` | Side-effect module — global API registration with namespace safety guards |
| `apps/36-blocks-widget/src/main.dev.ts` | Dev-serve entry point (standalone bootstrap) |
| `apps/36-blocks-widget/tsconfig.spec.json` | Jest test config for contract tests |
| `apps/36-blocks-widget/tests/contract.spec.ts` | Widget public API contract tests |

### Modified Files

| File | Change |
|---|---|
| `apps/36-blocks-widget/project.json` | `application` builder, `index: false`, polyfills array, `allowedCommonJsDependencies` |
| `apps/36-blocks-widget/src/main.ts` | Standalone `createApplication` + double-load guard + try-catch |
| `apps/36-blocks-widget/build-elements.js` | Dynamic file discovery with priority sort, reads from `browser/` |
| `apps/36-blocks-widget/tsconfig.app.json` | Removed `polyfills.ts`, added `main.dev.ts` |
| `apps/36-blocks-widget/tsconfig.json` | Added `tsconfig.spec.json` reference |
| `apps/36-blocks-widget/src/styles.scss` | Removed ~160 lines of commented-out Material CSS |
| `apps/36-blocks-widget/src/tailwind-blocks.html` | Replaced `aria-current="page"` → `data-current="page"` (42 occurrences) |
| `apps/36-blocks/project.json` | `application` builder, polyfills array, `allowedCommonJsDependencies` |
| `apps/36-blocks/tsconfig.json` | `target: ES2022`, `useDefineForClassFields: false` |
| `apps/36-blocks/tsconfig.app.json` | Removed `polyfills.ts` |
| `tsconfig.base.json` | `target: ES2022`, `esModuleInterop`, `allowSyntheticDefaultImports`, removed `emitDecoratorMetadata` |
| `tools/postbuild.js` | Auto-detects `browser/` subdirectory |
| `.github/workflows/main.yml` | Node 20, bundle size guard step |
| `nx.json` | `build` added to `cacheableOperations` |
| `package.json` | Added `test:contract` script |
| `apps/36-blocks-widget/src/app/otp/service/widget-portal.service.ts` | `isolation: isolate` + `.proxy-widget-portal` class |
| `libs/utils/src/index.ts` | `import dayjs` (default import) |
| `libs/ui/player/src/lib/player/player.component.ts` | `import dayjs` (default import) |
| `libs/ui/date-range-picker/src/lib/date-range-picker/date-range-picker.component.ts` | `import dayjs` + plugins (default imports) |
| `libs/services/proxy/auth/src/lib/services-proxy-auth.module.ts` | `import dayjs` (default import) |
| `libs/pipes/time-token-pipe/src/lib/pipes-time-token-pipe.module.ts` | `import dayjs` + `objectSupport` (default imports) |
| `libs/pipes/chart-date-add/src/lib/chart-date-add.pipe.ts` | `import dayjs` (default import) |
| `libs/pipes/chart-date-add/src/lib/pipes-chart-date-add.module.ts` | `import dayjs` (default import) |
| `apps/36-blocks/src/app/users/user/user.component.ts` | `import dayjs` (default import) |
| `apps/36-blocks/src/app/logs/log/log.component.ts` | `import dayjs` (default import) |

### Deleted Files

| File | Reason |
|---|---|
| `apps/36-blocks-widget/src/app/element.module.ts` | Logic split into `init-verification.ts` + `main.ts` |
| `apps/36-blocks-widget/src/app/app.module.ts` | Replaced by standalone bootstrap in `main.dev.ts` |
| `apps/36-blocks-widget/src/main.element.ts` | Legacy entry point, no longer referenced |
| `apps/36-blocks-widget/tsconfig.element.json` | Config for deleted `main.element.ts` |
| `apps/36-blocks-widget/src/polyfills.ts` | Handled by `polyfills: ["zone.js"]` in `project.json` |
| `apps/36-blocks/src/polyfills.ts` | Handled by `polyfills: ["zone.js"]` in `project.json` |

---

## Safety Guards Added

1. **Double-load guard** — `window.__proxyAuthLoaded` flag prevents duplicate bootstrap
2. **Custom element try-catch** — `customElements.define('proxy-auth', ...)` wrapped in try-catch
3. **Global namespace safety** — `if (!window.initVerification)` checks before assignment
4. **Bundle size guard** — `build-elements.js` warns if > 3 MB; CI step fails if exceeded
5. **Version metadata** — `window.__proxyAuth = { version, buildTime }` for debugging

---

## CI Pipeline Changes

```yaml
# .github/workflows/main.yml
- Node 16 → Node 20
- Added bundle size guard step (fails if proxy-auth.js > 3 MB)
- Nx build caching enabled
```

---

## Known Remaining Warnings

| Warning | Source | Impact |
|---|---|---|
| `Unexpected "=" aria-current=page` | Tailwind v4 `group` variant generates unquoted CSS attribute selectors | Cosmetic — CSS works correctly, esbuild parser is strict. Will be fixed upstream by Tailwind. |

---

## Testing

### Contract Tests

```bash
npm run test:contract
```

Verifies:
- `window.initVerification` is a function
- `<proxy-auth>` custom element is registered
- `window.__proxyAuth` version metadata exists
- Error thrown when `referenceId` missing
- Error thrown when `success` callback missing
- `<proxy-auth>` element renders inside provided container (stable polling)

### Manual Verification

```bash
# Widget build
npm run build:proxy-auth

# Admin build
npm run build:web

# Full production build
npm run build:prod

# Dev serve (widget)
npm run start:proxy-auth
```

---

## Pending Manual Steps

1. **`git filter-repo`** — Purge `env-variables.ts` secrets from git history (requires force-push, coordinate with team)
2. **Rotate secrets** — Firebase API keys, AES keys, hCaptcha site key that were previously committed
