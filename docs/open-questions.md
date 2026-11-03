---
verified_at: 395659d5
verified_on: 2026-10-29
---
# Open questions

What the code, its comments and the git history can't answer. Each question also sits as a `[!TODO]` in the doc where it matters, with the surrounding detail. When you answer one, write the answer into that doc, delete its TODO there, and remove the line here.

## Build, CI and deploy

- **Deploy target and branch mapping.** `AWS_BRANCH` detection in `tools/set-env.js` points to AWS Amplify, but no deploy config is in this repo. Which Amplify app or branch runs `build:test`, `build:stage` and `build:prod`? ([architecture.md](architecture.md#build), [environment.md](environment.md))
- **CI "Build check" is red.** It fails on every PR because `./env-variables` does not exist on the runner (see [environment.md](environment.md#ci-githubworkflowsmainyml-build-check)). Should the workflow run `node tools/set-env` with placeholder values, or should the job be removed? Should it also run on PRs into `stage`?
- **The "new version" check is broken; fix or drop it?** Verified with a local production build: `postbuild.js`'s lower-case regex misses `main-<UPPERCASE>.js`, version.json gets an empty hash, and the placeholder lives in a lazy chunk rather than main, so `VersionCheckService` never reports a new version. ([environment.md](environment.md#post-build-toolspostbuildjs))
- **Dashboard `stage` environment.** Is `production: false` / `env: 'dev'` in `apps/36-blocks/src/environments/environment.stage.ts` intended? It ships NgRx devtools to stage. ([environment.md](environment.md))
- **Branch to cut from.** Should new `<card>-clean` branches start from `stage` or `production`, and are `main` and `development` retired? ([conventions.md](conventions.md#branching-and-release))
- **SSR leftovers.** Why was SSR dropped in `64b28e3c` (the commit says only "unused"), and can `main.server.ts`, `server.ts`, `app.config.server.ts`, `app.routes.server.ts` and `app.config.browser.ts` be deleted? ([modules/app-shell.md](modules/app-shell.md))
- **`apps/36-blocks-widget/webpack.config.js`.** No build target references it. Safe to delete? ([modules/widget-embed.md](modules/widget-embed.md))

## Auth and security

- **`Bearer` prefix.** Does the proxy backend reject `Authorization: Bearer <jwt>`? The dashboard sends the raw token. ([modules/shared-libs.md](modules/shared-libs.md))
- **Email login.** Is the missing redirect after a successful email login known? Can backend `/login` return 401 for bad credentials (ErrorInterceptor would treat it as an expired session)? ([flows/dashboard-login.md](flows/dashboard-login.md))
- **Client-side AES with static keys.** Why are passwords and `proxy_state` encrypted in the browser with keys shipped in proxy-auth.js (`AUTH_UI_*`), and does the backend treat this as obfuscation only? ([modules/widget-auth.md](modules/widget-auth.md))
- **Redirect response mode `code`.** The dashboard only stores `redirect_response_mode`; nothing in this repo produces or consumes the code. Does `code` mode change what the widget receives (`redirect_url` from login, `data.redirect_to` from the callback URL or the OAuth decision), and is `POST /c/exchange` on the same base URL as the rest of the proxy API? The answer belongs in [api.md](api.md) and [flows/widget-verification.md](flows/widget-verification.md). ([modules/panel-features.md](modules/panel-features.md#client-secrets-and-redirect-response-mode-setting-tab))
- **Who may manage block client secrets.** The dashboard shows create/revoke to anyone who can open the block's Setting tab. Does the backend restrict these endpoints by role? ([modules/panel-features.md](modules/panel-features.md))

## Widget

- **Errors that never reach the host.** Should `otpWidgetError` (MSG91 OTP widget failure) and non-403 `hitCallbackUrl` errors call the host's `failure` callback? Today nothing subscribes to `otpWidgetError`. ([modules/widget-auth.md](modules/widget-auth.md), [flows/widget-verification.md](flows/widget-verification.md))
- **Host-page CSS.** Does the injected `#proxy-auth-widget-styles` include Tailwind preflight, which would reset the host's base styles? Is the `<head>` injection still needed now that overlays adopt the styles in their own shadow roots? ([modules/widget-embed.md](modules/widget-embed.md))
- **Role and permission endpoints.** Which backend permissions guard the role/permission endpoints and `c/addUser`? Any host that passes `isRolePermission: true` shows those tabs. ([modules/widget-account.md](modules/widget-account.md))
- **`subscription` widget type.** Deprecated for good (delete the commented-out component) or coming back? ([modules/widget-account.md](modules/widget-account.md))

## Dashboard

- **Feature type ids.** Are `feature_id` 1 (authorization) and 2 (subscription) stable backend ids, and are more types planned? The UI hard-codes them with no enum. ([modules/panel-features.md](modules/panel-features.md))
- **Dead Lago helpers.** Can `createLagoFeature`, the store's `getPlansForm` and `getBillableMetricForm` be removed? ([modules/panel-features.md](modules/panel-features.md))
- **Logs page.** Its nav item says "Temporary hide this page" but is shown. Are proxy logs still a supported product? ([modules/panel-ops.md](modules/panel-ops.md))
- **Payment provider.** Which provider sits behind `checkout_url` and `payment_methods` (the shape matches Stripe), and where does checkout redirect back to? ([modules/panel-ops.md](modules/panel-ops.md))

## UI

- **Where state goes.** Is the table in [ui/state.md](ui/state.md) the agreed rule, and should new pages stay on ComponentStore or move to `@ngrx/signals` (not installed)?
- **`@apply` with opacity in `.dark &`.** Does it really fail on Tailwind 4.2, or is the native `rgb()` workaround a leftover? ([ui/design-system.md](ui/design-system.md))
