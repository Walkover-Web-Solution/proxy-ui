---
covers: ["apps/36-blocks-widget/build-elements.js", "apps/36-blocks-widget/src/app/init-verification.ts", "apps/36-blocks/src/app/app.config.ts", "libs/services/**", "tools/set-env.js", "nx.json", "apps/36-blocks/src/app/panel/features/**"]
verified_at: 395659d5
verified_on: 2026-10-29
---
# Decisions

Why the repo is shaped the way it is, as far as the code, its comments and the git history show. Each entry names its evidence. Where the history records *what* changed but not *why*, the entry says so, and the question is in [open-questions.md](open-questions.md). Module-level detail stays in each module doc's "Why it is built this way" section; this page collects the decisions that cut across modules or constrain future changes.

## Product shape

| Decision | Evidence | Consequence for changes |
|---|---|---|
| **Two apps in one Nx workspace, sharing `libs/` through `@proxy/...` aliases.** The dashboard configures blocks; the widget renders them on customer sites. | `nx.json` (`npmScope: "proxy"`), `tsconfig.base.json` paths, `apps/36-blocks`, `apps/36-blocks-widget` | Shared code goes in `libs/` and is imported only by alias. Some libs (auth wrapper, proxy services) can only run in the dashboard; see [modules/shared-libs.md](modules/shared-libs.md). |
| **Client-only SPAs; the backend is another repo.** | No server code is built; `64b28e3c` "chore: remove SSR/prerender, switch to pure CSR" removed `@angular/ssr`, `express` and the `server`/`prerender`/`ssr` build options. The commit body gives no reason. | The SSR source files left behind (`main.server.ts`, `server.ts`, `app.config.server.ts`, …) are not built. Don't revive them without a decision. |
| **Configuration is fixed at build time.** `tools/set-env.js` writes env-variables.ts; per-environment hosts are hard-coded in `environments/*.ts` and picked by `fileReplacements`. | `tools/set-env.js`, `apps/*/project.json` | No runtime config: changing a value means a rebuild. Every value is public. See [environment.md](environment.md). |
| **`.env` overrides variables already in the shell or CI.** | `5038dea0` "force dotenv to load from repo root path in CI to prevent stale AWS env vars from overriding .env values"; `Object.assign` in `set-env.js` | A CI variable will not win over a value in `.env`. |
| **Never send a client id; the server tracks the current client against the token.** Switching is `POST switchclient` plus a full reload. | `switchClient` in `apps/36-blocks/src/app/core/ngrx/`, [glossary.md](glossary.md) | Pages hold no client-scoped cache that would survive a switch. |

## Widget

| Decision | Evidence | Consequence for changes |
|---|---|---|
| **One script file (proxy-auth.js) instead of Angular's chunk set.** Customers paste a single `<script>` tag. | `apps/36-blocks-widget/build-elements.js` concatenates polyfills, vendor, scripts and main, skips `chunk-*` and inlines the CSS (CSS inlining in `e798c6be`, hash-tolerant file discovery in `0067f73a`). The dynamic-`import()` breakage is recorded in the removed docs/widget-build-fixes.md (git history before `67759854`). | No dynamic `import()` in the widget (AGENTS.md rule 2). The output path is part of the public contract. |
| **A load-once guard in the bundle wrapper.** | `6590bf81`, `f32ca395`: `window.__proxyAuthLoaded` | Hosts and SPA routes may include the script twice; the second copy returns at once. |
| **Shadow DOM for the element and for every overlay.** | `ViewEncapsulation.ShadowDom` on `ProxyAuthWidgetComponent`; `aef51c04` moved overlays to per-overlay shadow hosts after host CSS leaked in | Widget CSS goes in component styles; overlays go through `WidgetPortalService` / `WidgetDialogService` (rule 4). |
| **The public JS API is append-only.** | Customer sites call `window.initVerification` and the other names listed in [api.md](api.md); nothing in this repo can update them | Rule 1 in AGENTS.md. Add keys and values; never rename. |
| **Unknown `initVerification` keys are forwarded to the backend as `otherData`.** | `RESERVED_KEYS` in `apps/36-blocks-widget/src/app/init-verification.ts` | New UI-only keys must be added to `RESERVED_KEYS` (rule 3). |

## HTTP and auth

| Decision | Evidence | Consequence for changes |
|---|---|---|
| **Two HTTP wrappers.** `http-wrapper` (dashboard JWT) and `http-wrapper-no-auth` (widget, per-request headers). | The widget has no Firebase and no `IToken` provider; `libs/services/http-wrapper*` | The widget must not import the auth wrapper or proxy services (rule 10). |
| **Raw `Authorization: <jwt>` header, no `Bearer`.** | `libs/services/http-wrapper` | Whether the backend would reject `Bearer` is open. Don't "fix" it. |
| **Token in a cookie and in memory.** The cookie survives reloads; memory is what HttpWrapper reads. | `AuthInitializerService` and the splash screen added together in `c07d8b5a`; `AuthService.setTokenSync` / `clearTokenSync` | Set and clear only through those two methods (rule 5). |
| **ErrorInterceptor drops calls without a session cookie unless allow-listed.** | `libs/services/interceptor/error-interceptor`; retry on status 0 added in `0f36df9f` (PR #640) for flaky first requests during login | New pre-login endpoints must be allow-listed (rule 6). |
| **Errors can arrive in a 200.** | `BaseResponse.hasError` in `libs/models/root-models/src/index.ts` | Check `hasError` (or the widget endpoint's success field) and `catchError` (rule 7). |

## Dashboard structure

| Decision | Evidence | Consequence for changes |
|---|---|---|
| **Standalone components only; no NgModules.** | `c57216c8` removed every shim NgModule from libs; some files keep legacy `*.module.ts` names | Don't add an `@NgModule`. |
| **Global NgRx only for auth, registration, clients and projects; a ComponentStore per page.** | `app.config.ts` registers only `auth` and `registration`; `<page>.store.ts` files are provided per component | Page state resets on navigation. See [ui/state.md](ui/state.md). |
| **Block forms are rendered from backend field configs.** | `IFieldConfig`; commits `ba9c7c13`, `7a701020` | New login providers or billing fields can ship without a UI release. The UI sends the backend's own config object back with `value` filled in. |
| **Create and manage are one component** (`CreateFeatureComponent`). | `features.routes.ts` routes both `create` and `manage/:id` to it | A field change touches create, update and the edit-mode `patchValue` ([modules/panel-features.md](modules/panel-features.md#changing-it-safely)). |
| **New block sub-areas get their own component and store** (OAuth config `d6999655`, client secrets `08be8990`). | `oauth-config/`, `client-secrets/` folders | Follow this pattern instead of growing `create-feature.store.ts`. |
| **Writes wait 100 ms before create/update.** | `setTimeout(…, 100)` in `create-feature.component.ts`; promise-filled payload (`8194f26a`) | Keep the delay (rule 14). |
| **Redirect response mode is sent only when it changed; up to two active block client secrets.** | Comments in `updateFeature` and `ClientSecretsComponent` (`1c8aaa9e`, `08be8990`): avoids re-triggering backend checks on unrelated saves; two secrets allow rotation without downtime | `code` is selectable only with an active secret; the backend enforces the same rule. |

## Tooling and process

| Decision | Evidence | Consequence for changes |
|---|---|---|
| **Local Nx task runner, no Nx Cloud.** | `3f6179a5` switched the runner from `@nrwl/nx-cloud` to `nx/tasks-runners/default`; the removed docs/angular-v14-to-v17-migration-report.md says the org's Nx Cloud plan was disabled and builds failed | Don't add `nx-cloud` back. |
| **Angular upgrades one major version at a time, each on its own branch.** | Removed docs/angular-upgrade-plan.md ("one major version at a time"); branches `angular-v18-migration`, `angular-v21-migration` | Bump `@angular/fire` and `firebase` with Angular ([conventions.md](conventions.md#upgrading-angular--nx)). |
| **Branch flow `<card>-clean` → `stage` → `production`.** | Merged PRs #620–#667 (e.g. #666, #667 from `P0095-clean`) | PRs into `stage` get no CI build (`.github/workflows/main.yml`), so build locally ([conventions.md](conventions.md#branching-and-release)). |
