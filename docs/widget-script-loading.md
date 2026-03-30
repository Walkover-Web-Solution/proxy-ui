# Proxy Auth Widget — Script Loading & Boot Sequence

> **Scope:** `apps/36-blocks-widget`  
> **Key files:**
> - `src/main.ts` — Angular bootstrap + custom element registration
> - `src/app/init-verification.ts` — global `window.initVerification` factory
> - `src/app/otp/service/otp-widget.service.ts` — OTP sub-widget script loader

---

## Overview

The widget ships as a single self-contained JavaScript bundle (`proxy-auth.js`). When a client page loads it, the following chain fires:

```
proxy-auth.js loaded
       │
       ▼
 main.ts executes
 ├─ Double-load guard (__proxyAuthLoaded)
 ├─ createApplication() — bootstraps Angular providers
 └─ customElements.define('proxy-auth', ProxyAuthWidgetComponent)
       │
       ▼
 init-verification.ts side-effect runs
 ├─ window.__proxyAuth.version set
 ├─ window.showUserManagement registered
 ├─ window.hideUserManagement registered
 └─ window.initVerification registered
       │
       ▼
 Client calls window.initVerification(config)
 ├─ Creates <proxy-auth> custom element
 ├─ Sets all config properties as element inputs
 └─ Mounts element into container div
       │
       ▼
 ProxyAuthWidgetComponent.ngOnInit()
 ├─ Dispatches getWidgetData (referenceId → API)
 ├─ Loads OTP sub-widget script (if OTP service configured)
 └─ Renders correct view based on type + authToken
```

---

## Phase 1 — Script Bootstrap (`main.ts`)

### Double-Load Guard

```ts
if ((window as any).__proxyAuthLoaded) {
    console.warn('[proxy-auth] Script already loaded — skipping bootstrap.');
} else {
    (window as any).__proxyAuthLoaded = true;
    // ... full bootstrap
}
```

Prevents duplicate Angular instances if the script tag is included twice (e.g. by a SPA router navigating back to a page that already loaded the script).

### Angular Application Bootstrap

`createApplication()` bootstraps a standalone Angular app with:

| Provider | Purpose |
|---|---|
| `provideHttpClient()` | API calls for widget data |
| `provideAnimations()` | Angular Material animations |
| `provideStore(reducers)` | NgRx state (OTP flow, theme, widget data) |
| `provideEffects([OtpEffects])` | Side-effect handling (API → store) |
| `NgHcaptchaModule` | hCaptcha bot protection |
| `OtpWidgetService` | OTP sub-widget script management |
| `WidgetThemeService` | Dark/light/system theme resolution |
| `ProxyBaseUrls.BaseURL` | API base URL from environment |

### Custom Element Registration

```ts
if (!customElements.get('proxy-auth')) {
    const el = createCustomElement(ProxyAuthWidgetComponent, { injector });
    customElements.define('proxy-auth', el);
}
```

`proxy-auth` is registered as a Web Component using Angular Elements. The guard prevents re-registration errors if the script somehow runs twice.

---

## Phase 2 — Global API Registration (`init-verification.ts`)

This file is imported as a **side-effect** in `main.ts`. It registers three globals on `window`:

### `window.__proxyAuth`

```js
window.__proxyAuth.version   // e.g. '0.0.3'
window.__proxyAuth.buildTime // ISO timestamp of when the bundle was built
```

Use these in the browser console to debug CDN caching issues.

### `window.showUserManagement()` / `window.hideUserManagement()`

Dispatch custom DOM events (`showUserManagement` / `hideUserManagement`) that the widget listens to. Used when `isHidden: true` — the widget is mounted off-screen and shown/hidden on demand:

```js
// Mount widget hidden
window.initVerification({ ..., isHidden: true, success: fn });

// Show it later (e.g. on a button click)
window.showUserManagement();

// Hide it again
window.hideUserManagement();
```

### `window.initVerification(config)`

The main entry point. Called by the client after the script loads.

---

## Phase 3 — `initVerification` Execution

### What it does

1. **Waits for DOM ready** via `documentReady()` — safe to call before `DOMContentLoaded`.
2. **Reads URL query params** — auto-fills registration fields:
   - `?first_name=`, `?last_name=`, `?email=`, `?signup_service_id=`
   - `?isRegisterFormOnly=true` forces registration-only mode
3. **Validates config** — throws if `referenceId` (or `authToken`+`showCompanyDetails`) is missing, or if `success` is not a function.
4. **Removes any existing widget** — if a `<proxy-auth>` element is already present, it is removed along with any skeleton loaders before re-mounting.
5. **Creates `<proxy-auth>` element** and assigns all config properties as DOM inputs.
6. **Resolves the container** — finds `document.getElementById(referenceId)` or falls back to `#userProxyContainer` (for `authToken`-only flows).
7. **Mounts immediately** if the container exists, otherwise starts a **SPA-safe retry**:

### SPA-Safe Container Retry

When the container `<div>` is not yet in the DOM (common with React/Next.js/Angular SPAs that render lazily):

```
MutationObserver (watches entire document for id attribute or childList changes)
  +
setInterval every 150 ms (safety net for innerHTML swaps MutationObserver may miss)
  +
30 s timeout (logs clear error and stops if container never appears)
```

Both are cancelled the moment the container is found. After 30 s, the error is:

```
[proxy-auth] Container element with id="YOUR_ID" was not found in the document after 30 s.
Ensure the element exists in the DOM before calling window.initVerification().
```

### Reserved vs. Extra Config Keys

```ts
const RESERVED_KEYS = ['referenceId', 'target', 'style', 'success', 'failure'];
```

Any config property **not** in `RESERVED_KEYS` is forwarded as `otherData` to the widget API payload. This is how clients pass custom metadata (e.g. `{ userId: 123, plan: 'pro' }`).

---

## Phase 4 — Widget Component Initialisation (`widget.component.ts`)

`ProxyAuthWidgetComponent.ngOnInit()` runs once the element is mounted:

### View Mode Resolution

`viewMode` is a computed signal driven by `authToken` + `type`:

| `authToken` | `type` | Rendered view |
|---|---|---|
| absent | any | `authorization` (OTP / login / register) |
| present | `'user-management'` | User Management panel |
| present | `'organization-details'` | Organization Details panel |
| present | `'user-profile'` | User Profile panel |
| any | `'subscription'` | Subscription plans |

### API Data Fetch

If `authToken` is absent, the component dispatches `getWidgetData`:

```ts
this.store.dispatch(getWidgetData({ referenceId, payload: otherData }));
```

The API response contains widget service configurations. The component then:
- Configures the OTP sub-widget (`OtpWidgetService.setWidgetConfig`)
- Lazily loads the OTP script (`otp-provider.js` from MSG91 CDN)
- Reads login widget data for the password auth flow

### OTP Sub-Widget Script (`OtpWidgetService`)

A second script is loaded **on demand** from:

```
https://control.msg91.com/app/assets/otp-provider/otp-provider.js?v=<timestamp>
```

The timestamp cache-busts the CDN. After load, `window.initSendOTP(configuration)` is called with:

```ts
{
  widgetId: string,   // from API response
  tokenAuth: string,  // from API response
  state: string,      // from API response
  success: (data) => void,
  failure: (error) => void,
}
```

### Theme Initialisation

`WidgetThemeService.setInputTheme(theme)` resolves the theme at startup:
- `'light'` / `'dark'` — forced override
- `'system'` — follows `prefers-color-scheme` media query
- Theme can also be set remotely via the widget API response (`ui_preferences.theme`)

### Shadow DOM Isolation

The component uses `ViewEncapsulation.ShadowDom`. All styles are scoped inside the shadow root — the host page's CSS cannot bleed in, and the widget's CSS cannot affect the host page. External fonts (Inter, Material Icons) are injected directly into the shadow root node at runtime.

---

## Required Config Reference

### Minimum required (Authorization flow)

```js
window.initVerification({
  referenceId: 'YOUR_REFERENCE_ID', // required — must match container <div id>
  success: function (data) { },     // required — throws if missing
});
```

### Full config shape

```ts
type Config = {
  // Identity
  referenceId?:          string;             // widget ID from dashboard; container div id
  authToken?:            string;             // encrypted token for authenticated views

  // View mode
  type?:                 'authorization'     // default — OTP / login / register
                       | 'user-profile'
                       | 'user-management'
                       | 'organization-details'
                       | 'subscription';

  // Theme
  theme?:                'system'            // default — follows OS preference
                       | 'light'
                       | 'dark';

  // Behaviour
  target?:               '_self'             // default
                       | '_blank';
  isHidden?:             boolean;            // mount hidden; toggle with show/hideUserManagement()
  isPreview?:            boolean;            // preview mode — no mutations
  isLogin?:              boolean;            // show login alongside subscription plans
  loginRedirectUrl?:     string;             // redirect after successful login
  showCompanyDetails?:   boolean;            // include company section in org-details view

  // Authorization-specific
  version?:              'v1' | 'v2';        // UI version (default 'v1')
  input_fields?:         'top' | 'bottom';   // input field position (default 'top')
  show_social_login_icons?: boolean;         // icon-only social buttons (default false)
  isRegisterFormOnly?:   boolean;            // skip login, show only registration
  isRolePermission?:     boolean;            // enable role-permission UI in user-management

  // Role filtering (user-management)
  exclude_role_ids?:     number[];
  include_role_ids?:     number[];

  // Callbacks
  success:               (data: unknown) => void;   // REQUIRED
  failure?:              (error: unknown) => void;

  // Any extra key-value pairs are forwarded to the widget API as otherData
  [key: string]:         any;
};
```

---

## Error States & Debugging

| Symptom | Cause | Fix |
|---|---|---|
| `Script already loaded — skipping bootstrap` | Script tag included twice | Remove duplicate `<script>` tag |
| `success callback function missing!` | `success` not provided or not a function | Add `success: function(data){}` to config |
| `Reference Id is missing!` | `referenceId` absent and no `authToken`/`showCompanyDetails` | Provide `referenceId` |
| Container not found after 30 s | `referenceId` doesn't match any DOM element `id` | Ensure `<div id="YOUR_REFERENCE_ID">` exists |
| Widget renders but no OTP button | OTP service not configured in dashboard | Configure OTP widget in the 36 Blocks dashboard |
| Dark mode not applying | `theme` set to `'system'` but OS reports light | Pass `theme: 'dark'` explicitly or check `prefers-color-scheme` |
| Widget duplicated on SPA navigation | `initVerification` called without cleaning previous instance | The function auto-removes the old element; ensure you're not appending extra `<proxy-auth>` tags manually |

---

## SPA Framework Integration Notes

### React / Next.js

```jsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'SCRIPT_URL';
  script.onload = () => window.initVerification(config);
  document.body.appendChild(script);
  return () => script.remove(); // cleanup on unmount
}, []);
```

Container `<div id="YOUR_ID">` must be rendered **before** `initVerification` is called, or the SPA-retry will pick it up once React hydrates it.

### Angular

```ts
ngAfterViewInit() {
  const script = document.createElement('script');
  script.src = 'SCRIPT_URL';
  script.onload = () => (window as any).initVerification(this.config);
  document.body.appendChild(script);
}
```

### Plain HTML (recommended for static pages)

```html
<div id="myWidget"></div>
<script>
  var configuration = {
    referenceId: 'myWidget',
    success: function(data) { console.log(data); }
  };
</script>
<script>
  var s = document.createElement('script');
  s.src = 'SCRIPT_URL';
  s.onload = function() { initVerification(configuration); };
  document.body.appendChild(s);
</script>
```

---

## Internal File Map

| File | Role |
|---|---|
| `src/main.ts` | Angular bootstrap, double-load guard, custom element registration |
| `src/app/init-verification.ts` | `window.initVerification`, `showUserManagement`, `hideUserManagement` globals |
| `src/app/otp/widget/widget.component.ts` | Root Angular Element — view mode, API dispatch, theme, OTP orchestration |
| `src/app/otp/widget/utility/model.ts` | `WidgetVersion` and `InputFields` enums |
| `src/app/otp/service/otp-widget.service.ts` | OTP sub-widget script loader + `window.initSendOTP` caller |
| `src/app/otp/service/widget-theme.service.ts` | Theme resolution (system / light / dark + remote override) |
| `libs/constant/src/verification/verification.ts` | `PublicScriptType`, `WidgetTheme`, `WidgetConfig` types (source of truth) |
