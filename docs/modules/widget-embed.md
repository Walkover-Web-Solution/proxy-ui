---
covers: ["apps/36-blocks-widget/src/main.ts", "apps/36-blocks-widget/src/main.dev.ts", "apps/36-blocks-widget/src/app/app.component.*", "apps/36-blocks-widget/src/app/init-verification.ts", "apps/36-blocks-widget/build-elements.js", "apps/36-blocks-widget/webpack.config.js", "apps/36-blocks-widget/project.json", "apps/36-blocks-widget/src/styles.scss", "apps/36-blocks-widget/src/assets/scss/**", "apps/36-blocks-widget/src/app/otp/service/widget-portal.service.ts", "apps/36-blocks-widget/src/app/otp/service/proxy-auth-dom-builder.service.ts", "apps/36-blocks-widget/src/app/otp/service/widget-dialog.service.ts", "apps/36-blocks-widget/src/app/otp/service/widget-theme.service.ts", "apps/36-blocks-widget/src/app/otp/service/user-management-bridge.service.ts", "apps/36-blocks-widget/src/app/otp/service/subscription-renderer.service.ts", "apps/36-blocks-widget/src/app/otp/service/toast.*", "apps/36-blocks-widget/src/app/otp/ui/**", "apps/36-blocks-widget/tests/**", "libs/constant/src/widget-events.ts"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# Widget embed (36-blocks-widget shell)

`apps/36-blocks-widget` is an Angular app that ships as one script, proxy-auth.js. A host page loads it and calls `window.initVerification(config)`. That call creates a `<proxy-auth>` custom element and appends it to a container div. This doc covers the shell around the screens: bootstrap, the global API, the build, DOM mounting, CSS isolation, theming, window events and shared UI pieces. The login/OTP screens are in [widget-auth](./widget-auth.md). The logged-in screens are in [widget-account](./widget-account.md). The end-to-end flow is in [widget-verification](../flows/widget-verification.md).

| File | Role |
|---|---|
| `apps/36-blocks-widget/src/main.ts` | Production entry. `createApplication` (no root component) with the store, effects, hCaptcha and API base URL providers. It defines the `proxy-auth` custom element and eagerly creates `UserManagementBridgeService`. |
| `apps/36-blocks-widget/src/main.dev.ts` | Dev entry, swapped in by the `development` build config. It runs `bootstrapApplication(AppComponent)` and loads `apps/36-blocks-widget/src/index.html` with `<proxy-root>`. |
| `apps/36-blocks-widget/src/app/app.component.ts` | Dev-only harness. It calls `window.initVerification` with hard-coded `REFERENCE_ID` / `TYPE` / `THEME` when `environment.production` is false. It also sets `blocks-widget` and `<theme>-theme` classes on `<body>`. |
| `apps/36-blocks-widget/src/app/init-verification.ts` | Imported for its side effects. It defines `window.initVerification`, sets `window.__proxyAuth` metadata and buffers early `openAddUserDialog` events. |
| `apps/36-blocks-widget/project.json` | Nx targets. `build` uses the esbuild `application` builder, outputs to `dist/apps/36-blocks-widget`, uses `outputHashing: all` and has a 3 MB initial budget. Configs: `production` (default), `test`, `stage`, `development`. | <!-- verify:ignore -->
| `apps/36-blocks-widget/build-elements.js` | Post-build step. It concatenates the JS chunks, inlines the CSS, wraps everything in a load-once guard and writes `proxy-auth.js`. | <!-- verify:ignore -->
| `apps/36-blocks-widget/webpack.config.js` | Not referenced by any target. The `application` builder is esbuild and ignores it. Dead file. |
| `apps/36-blocks-widget/src/app/otp/service/widget-portal.service.ts` | `WidgetPortalService.attach(el)` moves an already-rendered element into a new shadow host on `document.body`. Used for overlays and toasts. |
| `apps/36-blocks-widget/src/app/otp/service/widget-dialog.service.ts` | `WidgetDialogService.open(Component, {theme, setup})` creates a component inside a new shadow host on `document.body`. Used for window-event dialogs. |
| `apps/36-blocks-widget/src/app/otp/service/widget-theme.service.ts` | Signals for the theme: host input, server override, OS preference → `resolvedTheme`, `isDark$`. |
| `apps/36-blocks-widget/src/app/otp/service/user-management-bridge.service.ts` | Listens for the `openAddUserDialog` window event. It forwards it to the mounted user-management screen, or opens `AddUserDialogComponent` on its own. |
| `apps/36-blocks-widget/src/app/otp/service/proxy-auth-dom-builder.service.ts` | Renderer2 helpers for the authorization button list (skeleton loader, logo, "Or continue with" divider, password toggle, inline errors). |
| `apps/36-blocks-widget/src/app/otp/service/subscription-renderer.service.ts` | Builds the HTML strings and the `<style id="subscription-styles">` for the deprecated `subscription` type. |
| `apps/36-blocks-widget/src/app/otp/service/toast.service.ts`, `toast.component.ts` | `ToastService` (signal, auto-dismiss after 3 s by default) and `<proxy-toast>`. |
| `apps/36-blocks-widget/src/app/otp/ui/` | Standalone `<proxy-spinner>`, `<proxy-progress-bar>` and `<proxy-confirm-dialog>`, exported from `apps/36-blocks-widget/src/app/otp/ui/index.ts`. |
| `apps/36-blocks-widget/tests/contract.spec.ts` | Public API contract tests. They are not wired to a runner (see Gotchas). |
| `libs/constant/src/widget-events.ts` | `WidgetEvent` enum, the single source of truth for window event names. |

## How it works

### Bootstrap (production)
1. The script runs. `build-elements.js` wraps the whole bundle in `if (window.__proxyAuthLoaded) return; window.__proxyAuthLoaded = true;`, so a second `<script>` tag does nothing.
2. `init-verification.ts` runs as a side-effect import of `main.ts`. It does three things:
   - sets `window.__proxyAuth.version` (`'0.0.3'`, hard-coded) and `buildTime`
   - creates `window.__proxyAuth.pendingDialogEvents` and adds a window listener that pushes every `openAddUserDialog` event into it
   - defines `window.initVerification`, unless it already exists
3. `createApplication` boots Angular with no root component. Then:
   - if `customElements.get('proxy-auth')` is empty, it defines `proxy-auth` as `createCustomElement(ProxyAuthWidgetComponent)`, inside a try/catch
   - it calls `injector.get(UserManagementBridgeService)`, which drains the buffered events and registers the live listener
4. The inlined-CSS IIFE runs last, because `build-elements.js` appends it after the JS. It creates `<style id="proxy-auth-widget-styles">` in `document.head` and stores the same CSS string in `window.__proxyAuth.inlinedStyles`.

### `window.initVerification(config)`
Source: `apps/36-blocks-widget/src/app/init-verification.ts`.

1. If `config.type` is missing, it is set to `'authorization'`. `validateWidgetConfig` then only logs `console.error` for a bad `type`, or for a missing `authToken` when the type is `user-profile`, `user-management` or `organization-details`. It never throws.
2. All remaining work runs in `initFn`. `initFn` is deferred: `setTimeout(initFn, 1)` if the DOM is ready, otherwise on `DOMContentLoaded`.
3. `initFn` requires `referenceId || authToken || showCompanyDetails`. If none is set, it throws `Reference Id is missing!`. It also throws `success callback function missing !` when `config.success` is not a function.
4. It removes the first `proxy-auth` in the document, plus any `#skeleton-loader` siblings. Then it creates a new `<proxy-auth>` and sets each config key as a property on it (list below).
5. It builds `otherData`: query params `first_name`, `last_name`, `email` and `signup_service_id` come first, then `config` without `RESERVED_KEYS` (`referenceId`, `target`, `style`, `success`, `failure`, `authType`). `redirect_path` is moved to `otherData.addInfo.redirect_path`. The auth screens send `otherData` as extra API payload.
6. It picks the container id. For `type === 'authorization'` it is `config.referenceId`; for every other type it is `PROXY_DOM_ID` (`'userProxyContainer'`).
7. If the container exists, it calls `container.append(el)` and sets `window.libLoaded = true`. If not, a `MutationObserver` on `document.documentElement` and a 150 ms `setInterval` both keep looking for it. After 30 s it gives up with `console.error`.

### Shadow DOM vs light DOM
| What | Where it renders | CSS source |
|---|---|---|
| `<proxy-auth>` (`ProxyAuthWidgetComponent`, `ViewEncapsulation.ShadowDom`) | Its own shadow root, appended in the host's container div (light DOM) | Component `styleUrls` = `apps/36-blocks-widget/src/styles.scss` + `widget.component.scss` (Tailwind, `_shadow-reset.scss`, `:host { all: initial; isolation: isolate }`) |
| `UserProfileComponent`, `UserManagementComponent`, `OrganizationDetailsComponent` | Nested shadow roots (also `ViewEncapsulation.ShadowDom`) | Their own component styles |
| Overlays/toasts moved by `WidgetPortalService.attach` | A new `<div data-widget-overlay>` on `document.body` → open shadow root → `div.proxy-widget-portal` | `window.__proxyAuth.inlinedStyles` as a shared `CSSStyleSheet` in `adoptedStyleSheets`. In dev, where there is no inlined CSS, it copies the source shadow root's `adoptedStyleSheets` or `<style>` tags. |
| Dialogs from `WidgetDialogService.open` | A new `<div data-widget-dialog>` on `document.body` → shadow root → theme wrapper (`.dark` when dark) → inner host | The same inlined CSS, through `adoptedStyleSheets` |
| `subscription` type plan cards | The host's own `#referenceId` element (light DOM), via `innerHTML` strings | `<style id="subscription-styles">` in `document.head` |
| `#skeleton-loader` and `@keyframes` | The widget's internal button container. The keyframes go in the `proxy-auth` shadow root, or `document.head` if there is none. | Inline styles |

Isolation works in two layers. The shadow boundary blocks host stylesheet rules. Inherited properties still cross it, so each shadow host gets an inline `all:initial` plus fixed `font-family`, `font-size`, `line-height` and `text-transform`. Overlays are moved to `document.body` so that a host ancestor with `transform` or `overflow` cannot clip `position:fixed` dialogs. Z-index values sit near the 32-bit maximum (`2147483600`–`2147483620`).

### Theming
- `WidgetThemeService` is provided in the root providers of `main.ts`, so all widgets on a page share one instance.
- `resolvedTheme = _themeOverride ?? _inputTheme`. The input comes from `config.theme` through `ProxyAuthWidgetComponent.ngOnChanges/ngOnInit` → `setInputTheme`. The override is the server's `ui_preferences.theme`, and it is applied only when the host passed no `theme` (see [widget-auth](./widget-auth.md)).
- `isDark$`: `'dark'` → true, `'light'` → false, anything else → `prefers-color-scheme`, which is watched live.
- `WidgetDialogService._resolveDark` uses a different rule. With no explicit theme, it also detects host class-based dark mode (`.dark`, `data-theme="dark"`, `data-mode="dark"` on `<html>` or `<body>`) before the OS preference.
- Tailwind dark mode is `@custom-variant dark (&:where(.dark, .dark *))` in `widget.component.scss`. The class has to be inside the shadow root, which is why `WidgetDialogService` adds a `.dark` wrapper div.

### Window events and callbacks
| Direction | Name | Payload | Source |
|---|---|---|---|
| host → widget | `openAddUserDialog` (`WidgetEvent.OpenInviteMemberDialog`) | `detail: { authToken: string, theme?: 'dark'\|'light'\|'system' }` | `UserManagementBridgeService` |
| widget → host | `organizationDetailsUpdateResponse` | `detail: { data, error: boolean }`, `bubbles` + `composed` | `apps/36-blocks-widget/src/app/otp/organization-details/organization-details.component.ts` |
| widget → host | `config.success(data)` / `config.failure(error)` | Response objects from the auth/profile flows | `ProxyAuthWidgetComponent.returnSuccessObj` / `returnFailureObj` and the account screens |

`UserManagementBridgeService` handles `openAddUserDialog` in one of two ways:
- If `openAddUser$.observed` is true, the user-management screen is mounted and subscribed, so the event goes to it and the screen can refresh its table.
- Otherwise it opens `AddUserDialogComponent` through `WidgetDialogService`.

Only one standalone dialog can be open at a time (`_activeRef` guard). From the events buffered before bootstrap, only the last one is replayed, and it always opens standalone.

## Contracts

Config accepted by `initVerification`. `WidgetConfig` in `libs/constant/src/verification/verification.ts` is a partial type; the authoritative key list is the assignments in `init-verification.ts`:

```ts
{
  referenceId?: string;          // required for type 'authorization'; also the container div id
  type?: 'authorization' | 'user-profile' | 'user-management' | 'organization-details' | 'oauth2' | 'subscription'(deprecated);
  authToken?: string;            // required (logged, not thrown) for user-profile / user-management / organization-details
  authType?: 'authorization' | 'auth2';   // default 'authorization'
  theme?: 'system' | 'light' | 'dark';
  success: (data) => void;       // REQUIRED, else throws (async)
  failure?: (error) => void;
  target?: '_self' | '_blank';   // default '_self'
  showCompanyDetails?, userToken?, isRolePermission?, isPreview?, isLogin?, openEditProfile?,
  loginRedirectUrl?, version?, input_fields?, show_social_login_icons?,
  exclude_role_ids?, include_role_ids?, isRegisterFormOnly?,  // also ?isRegisterFormOnly=true in URL
  redirect_path?: string;        // moved to otherData.addInfo.redirect_path
  [extra: string]: any;          // anything not in RESERVED_KEYS ends up in otherData
}
```

Host page markup. The script banner in `build-elements.js` and `libs/models/features-model/src/index.ts` (the admin panel's code snippet) both describe it:

```html
<div id="REFERENCE_ID"></div>            <!-- or id="userProxyContainer" for non-authorization types -->
<script>var configuration = { referenceId: 'REFERENCE_ID', success: fn, failure: fn };</script>
<script src=".../assets/proxy-auth/proxy-auth.js" onload="initVerification(configuration)"></script>
```

Globals on `window`:

```ts
window.initVerification          // function (defined once; never overwritten)
window.__proxyAuthLoaded = true  // bundle executed (guard)
window.__proxyAuth = { version: '0.0.3', buildTime, pendingDialogEvents: Event[], inlinedStyles: string }
window.libLoaded = true          // set after first successful mount
```

Build outputs. Run `npm run build:proxy-auth`, or `:test`, `:stage` or `:prod` for the other environments. Each runs `tools/set-env --auth`, then `nx build 36-blocks-widget`, then `node apps/36-blocks-widget/build-elements.js`:
- `dist/apps/36-blocks-widget/browser/`: Angular output (`main-<hash>.js`, `styles-<hash>.css`, `chunk-*.js`). `polyfills: []`, so no polyfills file is produced. <!-- verify:ignore -->
- `dist/apps/36-blocks/browser/assets/proxy-auth/proxy-auth.js`: the shipped bundle, served from the admin app's `/assets/proxy-auth/proxy-auth.js`. <!-- verify:ignore -->
- `apps/36-blocks/src/assets/proxy-auth/proxy-auth.js`: a dev-server copy. It is gitignored. CI's bundle-size step in `.github/workflows/main.yml` reads this path and fails if it is over 3 MB. <!-- verify:ignore -->

Ordering in `build-elements.js`:
- It takes the non-`chunk-` `.js` files sorted `polyfills → vendor → scripts → main`, then the first `styles*.css`. <!-- verify:ignore -->
- `chunk-*.js` files are not concatenated. <!-- verify:ignore -->

## Gotchas

> [!WARNING]
> `initVerification` throws asynchronously, inside `setTimeout` or `DOMContentLoaded`. A host's `try/catch` never sees `Reference Id is missing!` or `success callback function missing !`. They surface as uncaught errors. The type and authToken checks only `console.error`.

> [!WARNING]
> Calling `initVerification` again replaces the widget. It removes only the first `proxy-auth` in the document (`document.querySelector`) and mounts a new one, so with several widgets on one page the wrong one may be removed. The admin preview (`widget-preview.component.ts`) removes every `proxy-auth` itself before it calls `initVerification`. Loading the script twice is a no-op, and `initVerification` is never redefined.

> [!WARNING]
> The window event name is `'openAddUserDialog'`. The old name `openInviteMemberDialogAt36Blocks` was renamed in f9047d41; hosts still using it get nothing. Always use `WidgetEvent.OpenInviteMemberDialog` from `libs/constant/src/widget-events.ts`. <!-- verify:ignore -->

> [!WARNING]
> The contract tests in `apps/36-blocks-widget/tests/contract.spec.ts` do not run. `project.json` has no `test` target, the root `jest.config.ts` does not list this project, and `npm run test:contract` (`nx test 36-blocks-widget`) has nothing to call. They are also stale: they expect `initVerification({})` to throw synchronously, but the code throws later inside `initFn`.

> [!WARNING]
> Global CSS reaches the host page. The whole compiled `styles.scss` is injected into the host's `document.head` as `#proxy-auth-widget-styles`. It contains Tailwind, the `apps/shared/scss/global.scss` classes (`.text-primary`, `pre`, …), `widget-ui` and the intl-tel-input overrides. The `subscription` type also adds a `*{…color…!important}` rule to `document.head`, and that rule's `isDark` is fixed at first injection because the style id is checked before rebuilding. Keep new widget CSS in component styles, which are shadow-scoped, not in `styles.scss`.

> [!TODO] Needs a human: does the injected `#proxy-auth-widget-styles` include Tailwind preflight, which would reset the host page's base styles? Check a built proxy-auth.js bundle. Is the document.head injection still needed, now that overlays adopt `inlinedStyles` in their own shadow roots?

> [!WARNING]
> Overlay CSS depends on `window.__proxyAuth.inlinedStyles`, which only `build-elements.js` sets. On the dev server (`main.dev.ts`) the portal copies the source shadow root's sheets instead, and `WidgetDialogService` logs `Widget styles not found` and renders unstyled. Check dialog styling on a built bundle.

> [!WARNING]
> `UserManagementBridgeService` has to be created eagerly in `main.ts`. If that line is removed, the window listener is only registered once the user-management screen mounts, and earlier `openAddUserDialog` events are dropped. The comment in `main.ts` explains this.

- The comment in `main.ts` says `init-verification` registers `showUserManagement`/`hideUserManagement`. Those were removed in 8ac34a31, so the comment is stale.
- `__proxyWidgetInitialized` and the `blocks-widget` / `*-theme` body classes come only from the dev `AppComponent`. Production never sets them.
- `window.__proxyAuth.version` is a hard-coded literal. Nothing bumps it at build time.
- `PublicScriptType.OAuth` (`'oauth2'`) passes validation and mounts into `userProxyContainer`. OAuth for the login widget actually uses `authType: 'auth2'` with `type: 'authorization'` (c38eea4a). See [widget-auth](./widget-auth.md).

## Why it is built this way

- **One script, not Angular's chunk set.** Hosts embed a single `<script src>`, so `build-elements.js` concatenates the files and inlines the CSS (e798c6be). File names are discovered by prefix, so `outputHashing: all` works (0067f73a).
- **Load-once guard in the bundle, not in `main.ts`.** It was moved into the wrapper in 6590bf81/f32ca395. Hosts sometimes include the tag twice, and SPA routes re-inject it. Browser scripts run one after another, so a flag is race-free.
- **Fresh build only.** A "stable-builds" strategy (c4be92d6: a committed `proxy-auth.js` plus a separate `proxy-auth-new.js`) was tried and removed a day later in 03e7ebd3. Today every build overwrites `proxy-auth.js`. The generated file is gitignored (d26fb0d2).<!-- verify:ignore -->
- **Nested shadow roots for overlays.** An earlier approach injected global styles and got hit by host CSS such as `* { text-transform: uppercase !important }`. aef51c04 moved to per-overlay shadow hosts with a shared `CSSStyleSheet`, so the CSS is parsed once.
- **`WidgetDialogService` instead of static `open()` on dialog components.** 8ac34a31 centralised this. The same commit removed the `showUserManagement` / `hideUserManagement` globals and the `isHidden` config. <!-- verify:ignore -->
- **MutationObserver + interval for the container.** React, Next.js and Angular hosts often render the container after `onload`. The interval covers `innerHTML` swaps that the observer misses.
- **Default `type` = authorization** (f9047d41). Older embeds pass only `referenceId`.

> [!TODO] Needs a human: is `apps/36-blocks-widget/webpack.config.js` safe to delete? Nothing has referenced it since the move to the esbuild `application` builder.

## Changing it safely

- **New `initVerification` key**:
  1. Add the `@Input` on `ProxyAuthWidgetComponent`.
  2. Set it on `widgetElement` in `init-verification.ts`.
  3. If it must not reach API payloads, add it to `RESERVED_KEYS`.
  4. Add it to `WidgetConfig` in `libs/constant/src/verification/verification.ts`.
  5. Update the embed snippet in `libs/models/features-model/src/index.ts` and the admin preview `widget-preview.component.ts`.
- **New host → widget window event**:
  1. Add the enum value to `libs/constant/src/widget-events.ts`.
  2. Add a bridge service like `UserManagementBridgeService` that calls `WidgetDialogService.open`.
  3. If the event can fire before bootstrap, add a pre-bootstrap buffer listener in `init-verification.ts`.
  4. Instantiate the service eagerly in `main.ts`.
- **New overlay inside a shadow-DOM component**: render it in the template, then call `WidgetPortalService.attach(el)` after the next tick. Call `detach()` in both close and `ngOnDestroy`. Esc already detaches.
- **Build changes**: keep `build-elements.js` in step with Angular's output names. It throws if `dist/apps/36-blocks-widget/browser` has no JS. Check with `npm run build:proxy-auth`, then load `dist/apps/36-blocks/browser/assets/proxy-auth/proxy-auth.js` on a plain HTML page, both in a styled host and inside a `transform`ed container. <!-- verify:ignore -->
- **Public API**: anything on `window` and the `proxy-auth` tag name is a contract with external sites. Do not rename either.
