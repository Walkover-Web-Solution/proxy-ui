# proxy-ui (36 Blocks frontend)

An Nx monorepo (Angular 21, standalone components, NgRx, Tailwind v4) with two apps:
- `apps/36-blocks`: the customer dashboard and the marketing site.
- `apps/36-blocks-widget`: an embeddable auth widget, built into one script (proxy-auth.js) that customer sites load and call through `window.initVerification(config)`.

Both apps are client-only and call a backend "proxy" API that lives in another repo.

## Commands

| Task | Command |
|---|---|
| Install | `npm ci --legacy-peer-deps` (Node 20; peer deps conflict without the flag) |
| Env setup | `cp .env.example .env` and fill in the values. `tools/set-env.js` generates the git-ignored env-variables.ts for each app ([docs/environment.md](docs/environment.md)) |
| Run dashboard | `npm start` (port 4200) |
| Run widget alone | `npm run start:proxy-auth` (also port 4200) |
| Build widget into dashboard assets | `npm run build:proxy-auth` |
| Full build | `npm run build:test`, `npm run build:stage` or `npm run build:prod`. Plain `npm run build` mixes a prod widget with a local dashboard |
| Format | `npm run format:code`. Prettier also runs on pre-commit through husky and lint-staged |

`npm test` and `npm run lint` are not reliable at this commit: there is no test target on the dashboard, and `nx workspace-lint` is gone in Nx 21. Check a change by building the affected app: `npx nx build 36-blocks` or `npx nx build 36-blocks-widget` (run `node tools/set-env` first). The CI "Build check" workflow fails on every PR today because it never runs `set-env`, so a red check there says nothing about your change ([docs/environment.md](docs/environment.md#ci-githubworkflowsmainyml-build-check)).

## Read before you change

- Anything → [docs/architecture.md](docs/architecture.md), then [docs/conventions.md](docs/conventions.md); why things are shaped this way → [docs/decisions.md](docs/decisions.md)
- The widget's public API, events or build → [docs/modules/widget-embed.md](docs/modules/widget-embed.md) and [docs/api.md](docs/api.md#widget-public-api-host-page--widget)
- Widget login, register or OTP → [docs/modules/widget-auth.md](docs/modules/widget-auth.md), [docs/flows/widget-verification.md](docs/flows/widget-verification.md)
- Widget account screens → [docs/modules/widget-account.md](docs/modules/widget-account.md)
- Dashboard login, token or guards → [docs/modules/app-shell.md](docs/modules/app-shell.md), [docs/flows/dashboard-login.md](docs/flows/dashboard-login.md)
- Blocks (features) wizard, OAuth clients, client secrets, redirect response mode → [docs/modules/panel-features.md](docs/modules/panel-features.md), [docs/flows/feature-configuration.md](docs/flows/feature-configuration.md)
- Users, logs, billing, dashboard, layout → [docs/modules/panel-ops.md](docs/modules/panel-ops.md)
- `libs/**`, HTTP, the interceptor → [docs/modules/shared-libs.md](docs/modules/shared-libs.md)
- Routes, state, components, styling → [docs/ui/](docs/README.md#ui)
- A common change (page, backend call, block tab, widget key or screen, env value, lib, release) → [docs/recipes.md](docs/recipes.md)

## Rules

1. Never rename or remove any part of the widget's public contract:
   - `window.initVerification` and the `proxy-auth` tag
   - `window.__proxyAuth` and the `openAddUserDialog` event
   - the `userProxyContainer` id and the assets/proxy-auth/proxy-auth.js path
   - any value in `libs/constant/src/verification/verification.ts`

   Customer sites depend on all of these. Add new values instead ([docs/api.md](docs/api.md)).
2. No dynamic `import()` in `apps/36-blocks-widget`. `build-elements.js` leaves the `chunk-*` file it creates out of the single-file bundle, so the bundle breaks on host pages.
3. A new `initVerification` config key that must not be sent to the backend goes into `RESERVED_KEYS` in `apps/36-blocks-widget/src/app/init-verification.ts`. Every other key is POSTed as `otherData` ([recipe](docs/recipes.md#add-an-initverification-config-key)).
4. Put widget CSS in component styles. `apps/36-blocks-widget/src/styles.scss` is also injected into the host page's `<head>`. Build overlays with `WidgetPortalService` / `WidgetDialogService`.
5. Set and clear the dashboard token only through `AuthService.setTokenSync` / `clearTokenSync`. They keep the `authToken` cookie and the in-memory `IToken` in sync. Guards read both, HttpWrapper reads memory, and ErrorInterceptor reads only the cookie ([docs/modules/app-shell.md](docs/modules/app-shell.md)).
6. A dashboard endpoint called without a session must be on the ErrorInterceptor allow-list. Otherwise it is silently dropped (`EMPTY`) ([docs/modules/shared-libs.md](docs/modules/shared-libs.md)).
7. A 200 can still be an error. Check `res.hasError` (dashboard) or the per-endpoint success field (widget) as well as using `catchError` ([docs/conventions.md](docs/conventions.md#http-and-errors)).
8. A block has two ids: numeric `id` for feature CRUD, OAuth, scopes and client secrets, and string `reference_id` for the widget, billing and the Users/roles screens. Passing the wrong one fails silently ([docs/glossary.md](docs/glossary.md)).
9. In the widget, copy `OtpService.options` before adding per-call headers. It is one shared mutable object, and its headers leak into later calls.
10. The widget must not import `@proxy/services/proxy/*`, `@proxy/services/httpWrapper` or the login service. They need `AngularFireAuth` and `IToken`, which only the dashboard provides.
11. Add dashboard pages to `apps/36-blocks/src/app/panel/panel.routes.ts`. `apps/36-blocks/src/app/panel/layout/layout.routes.ts` is dead (nothing imports it).
12. Never send a client id. The current client is stored on the server against the token, and switching client is `POST switchclient` followed by a full page reload.
13. Everything `tools/set-env.js` writes ends up in a public browser bundle. Never add a real server-side secret there. When you add a key, also add it to `.env.example`.
14. Keep the `setTimeout(…, 100)` before block create/update in `create-feature.component.ts`. The payload is filled in by promises (file reads, chip lists) ([docs/modules/panel-features.md](docs/modules/panel-features.md)).
15. Branch flow is `<card>-clean` → `stage` → `production`; the README's `development`/`main` flow is stale. PRs into `stage` get **no CI build**, so build locally first. Land any revert on `stage` too ([docs/conventions.md](docs/conventions.md#branching-and-release)).

## Where things are

- `apps/36-blocks/src/app/website/`: public marketing pages, login and register
- `apps/36-blocks/src/app/panel/`: the logged-in `/app` dashboard pages, each with a `<page>.store.ts` ComponentStore
- `apps/36-blocks/src/app/core/`: the root NgRx store, the auth initializer, client registration
- `apps/36-blocks-widget/src/app/init-verification.ts`: the widget's global API
- `apps/36-blocks-widget/src/app/otp/`: widget screens, the `otp` store, `OtpService`
- `apps/36-blocks-widget/build-elements.js`: post-build step that produces the single proxy-auth.js
- `libs/`: shared code, imported only through the `@proxy/...` aliases in `tsconfig.base.json`
- `tools/set-env.js`, `tools/postbuild.js`: env generation and the version.json writer
- `apps/shared/scss/`: global SCSS and Tailwind entry shared by both apps

## Docs map

See [docs/README.md](docs/README.md) for every doc and when to read it. What the code can't answer is listed in [docs/open-questions.md](docs/open-questions.md); don't guess at those, ask.
When you change behaviour that a doc describes, update that doc in the same change and run `/ai-docs update`.
