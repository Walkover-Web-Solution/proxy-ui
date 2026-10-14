---
covers:
  - "apps/36-blocks/src/app/panel/panel.routes.ts"
  - "apps/36-blocks/src/app/panel/layout/main-left-side-nav/**"
  - "apps/36-blocks/src/app/panel/features/create-feature/create-feature.component.*"
  - "apps/36-blocks-widget/src/app/init-verification.ts"
  - "apps/36-blocks-widget/src/app/otp/service/otp.service.ts"
  - "apps/36-blocks-widget/src/app/otp/service/urls/otp-urls.ts"
  - "libs/constant/src/verification/verification.ts"
  - "libs/urls/**"
  - "libs/services/proxy/**"
  - "libs/models/**"
  - "tools/set-env.js"
  - ".env.example"
  - "tsconfig.base.json"
  - ".github/workflows/main.yml"
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# Recipes

Step-by-step for the changes this repo sees most often. Each recipe was learned from real commits and checked against the current code. The module docs hold the details; these pages give the order and the step that is easy to miss.

Two apps share one Nx workspace: the dashboard `apps/36-blocks` and the embeddable widget `apps/36-blocks-widget` (built into a single proxy-auth.js script). Shared code is in `libs/`, imported through `@proxy/*` aliases.

## Add a dashboard page
Example commit: `11cea466` "subscription on panal" (the Billing page).

1. Create a standalone component folder under `apps/36-blocks/src/app/panel/<page>/`. The current pattern is a component plus a `ComponentStore` provided on the component: see `apps/36-blocks/src/app/panel/billing/billing.store.ts:BillingComponentStore`, registered with `providers: [BillingComponentStore]` in `apps/36-blocks/src/app/panel/billing/billing.component.ts`.
2. Add the backend calls. Either use a shared lib (see [Add a dashboard backend call](#add-a-dashboard-backend-call)) or, for a page-only API, keep a local URL file and service next to the page like `apps/36-blocks/src/app/panel/billing/billing.urls.ts:BillingUrls` and `apps/36-blocks/src/app/panel/billing/billing.service.ts:BillingService`.
3. Register the route as a child in `apps/36-blocks/src/app/panel/panel.routes.ts:panelRoutes` with `loadComponent`. The page is then served at `/app/<path>` behind `CanActivateRouteGuard`.
4. Add the side-nav entry to `navItems` in `apps/36-blocks/src/app/panel/layout/main-left-side-nav/main-left-side-nav.component.ts:MainLeftSideNavComponent` (`{ route, icon, label }`, route relative to `/app`). Billing is the exception: it has its own link block in `apps/36-blocks/src/app/panel/layout/layout.component.html`.
5. Check it: `npm start`, log in, open `/app/<path>`, toggle the sidebar collapsed and expanded, and toggle dark mode.

> [!WARNING]
> `apps/36-blocks/src/app/panel/layout/layout.routes.ts:layoutRoutes` looks like the route table but nothing imports it. Adding a route there does nothing. Use `panel.routes.ts`.

Details: [panel-ops](./modules/panel-ops.md), [app-shell](./modules/app-shell.md).

## Add a dashboard backend call
Example commit: `d6999655` "OAuth crud". Also `59613860` "roles and permission on managment", `d93d1b6b` "webhook in the manage setting".

1. Add a URL builder to the right `libs/urls/*/src/index.ts`, e.g. `FeaturesUrls.oauthConfigs` in `libs/urls/features-url/src/index.ts`. Use `createUrl(baseUrl, \`features/${id}/...\`)` with template-literal params.
2. Add a method to the matching service under `libs/services/proxy/`, e.g. `libs/services/proxy/features/src/lib/services-proxy-features.module.ts:FeaturesService`. It returns `this.http.<verb><BaseResponse<T, void>>(url, body)` and never subscribes or catches.
3. Add request and response types to `libs/models/*/src/index.ts` (OAuth used `IOAuthConfig`, `IOAuthConfigCreatePayload` in `libs/models/features-model/src/index.ts`).
4. Call it from a `ComponentStore` effect or an NgRx effect, and handle `hasError` / `catchError` there (`apps/36-blocks/src/app/panel/features/oauth-config/oauth-config.store.ts:OauthConfigComponentStore`).
5. If the endpoint is called before login, add its path to the allow-list in `libs/services/interceptor/error-interceptor/src/lib/services-interceptor-error-interceptor.module.ts:ErrorInterceptor`.
6. Update [api.md](./api.md).

> [!WARNING]
> `ErrorInterceptor` returns `EMPTY` for any request that is not on its URL allow-list when there is no `authToken` cookie. A pre-login call that is missing from the list completes silently with no value and no error.

Details: [shared-libs: How a proxy service builds a URL](./modules/shared-libs.md#how-a-proxy-service-builds-a-url).

## Add a tab to the block edit screen
Example commit: `d6999655` "OAuth crud" (OAuth Config tab). Also `d93d1b6b` "webhook in the manage setting".

1. Build the tab content as its own standalone component with its own store (e.g. `apps/36-blocks/src/app/panel/features/oauth-config/oauth-config.component.ts:OauthConfigComponent`), or as a section of `apps/36-blocks/src/app/panel/features/create-feature/create-feature.store.ts` for small settings.
2. Import it in `apps/36-blocks/src/app/panel/features/create-feature/create-feature.component.ts:CreateFeatureComponent` and add a `<mat-tab>` in `create-feature.component.html`.
3. If the tab needs the full width (no widget preview on the right), add its index constant next to `editModeManageMembersTabIndex` / `editModeOauthConfigTabIndex` and include it in `isEditModeFullWidthTab`.

> [!WARNING]
> Tab indexes are hard-coded numbers (`editModeManageMembersTabIndex = 5`, `editModeOauthConfigTabIndex = 6`). Inserting a tab before them shifts every index after it; the preview then hides on the wrong tab. Append new tabs at the end, or update every constant.

Details: [panel-features](./modules/panel-features.md).

## Add an `initVerification` config key
Example commit: `983e1739` "feat: add redirect_path config for admin panel preview authentication". Also `962c042e` (`openEditProfile`), `c38eea4a` (`authType`).

1. Add the key to `WidgetConfig` in `libs/constant/src/verification/verification.ts` with a comment saying what it does.
2. Add an `@Input` on `ProxyAuthWidgetComponent` in `apps/36-blocks-widget/src/app/otp/widget/widget.component.ts`.
3. Set it on `widgetElement` in `apps/36-blocks-widget/src/app/init-verification.ts`.
4. Decide whether it goes to the backend. Every config key not in `RESERVED_KEYS` is copied into `otherData` and sent in API payloads. Client-only keys must be added to `RESERVED_KEYS` (`c38eea4a` added `authType`).
5. If the admin preview needs it, set it in `apps/36-blocks/src/app/panel/features/create-feature/feature-preview/widget-preview/widget-preview.component.ts` (that is where `redirect_path` is set). Update the dev harness `apps/36-blocks-widget/src/app/app.component.ts` if you want to try it locally.
6. Check: `npm run start:proxy-auth`, then build the bundle and load it on a plain HTML page.

> [!WARNING]
> Keys in `WidgetConfig` are public API: customers write them in embed snippets. Add keys; never rename or remove one.

Details: [widget-embed: Changing it safely](./modules/widget-embed.md#changing-it-safely).

## Add a widget screen (`type`)
Example commit: `bd36f275` "orginazation details embed" (made in the old proxy-auth app, since renamed to `apps/36-blocks-widget` in `4ce766de`). `d6999655` added the `oauth2` enum value.

1. Add a value to `PublicScriptType` in `libs/constant/src/verification/verification.ts`. Add only; never rename an existing value.
2. Add a branch to the `viewMode` computed and an `@case` in `apps/36-blocks-widget/src/app/otp/widget/widget.component.html`.
3. If the screen needs a logged-in user, add the type to `authTokenRequiredTypes` in `validateWidgetConfig` in `apps/36-blocks-widget/src/app/init-verification.ts`. Non-authorization types mount into `PROXY_DOM_ID`, not into the `referenceId` element.
4. Add the widget's API calls to `apps/36-blocks-widget/src/app/otp/service/urls/otp-urls.ts:otpVerificationUrls` and `apps/36-blocks-widget/src/app/otp/service/otp.service.ts:OtpService` (see `c38eea4a` for `oauthAuthorize`).
5. Add a preview tab to `tabs` and to the `PreviewTab` union in `widget-preview.component.ts`, and an embed snippet in `libs/models/features-model/src/index.ts` if the type needs its own (`ProxyUserManagementScript` is one).

> [!WARNING]
> Do not lazy-load anything in the widget with dynamic `import()`. Angular emits it as a separate chunk file, and `apps/36-blocks-widget/build-elements.js` does not concatenate chunks into the proxy-auth.js bundle, so the host page fails with "Cannot use import statement outside a module". `e798c6be` replaced the dynamic import of the add-user dialog with a static import for this reason.

Details: [widget-embed](./modules/widget-embed.md), [widget-auth](./modules/widget-auth.md), [widget-account](./modules/widget-account.md).

## Add a build-time secret or env value
Example commits: `701990f5` "Added interface env variables", `d858d6b6` "client url" (secrets); `b96c3516` "refactor: add googleClientId property to all environment configurations" (per-environment value).

- **Secret or key that must not be committed:**
  1. Add the variable to `.env.example`.
  2. Read it with `get('<NAME>')` inside `writeProxyEnv` (dashboard) or `writeProxyAuthEnv` (widget) in `tools/set-env.js`. That writes the gitignored env-variables.ts file in `apps/36-blocks/src/environments/` or `apps/36-blocks-widget/src/environments/`, which every environment file spreads in.
  3. Add it to the build environment in CI/hosting.
- **Non-secret value that differs per environment:** add it to all four files in `apps/36-blocks/src/environments/` (or the widget's). Missing it in one file breaks only that configuration's build.

> [!WARNING]
> In CI (`CI=true`, `NODE_ENV=production` or `AWS_BRANCH` set), `tools/set-env.js` exits with "missing required env vars" if any `get()` key is unset. Locally it only warns, so a new key passes locally and fails the deploy. `5038dea0` also forces dotenv to load the repo-root .env file and override existing env vars, because stale Amplify vars were winning.

Variable list: [environment.md](./environment.md).

## Add a shared lib
Example commit: `78facc08` "P0082 | Dashboard Integration & install Apache ECharts" (added `libs/services/proxy/analytics` and `libs/urls/analytics-urls`). Also `e54ee406` (`libs/ui/service-list`).

1. Create `libs/<group>/<name>/src/index.ts` and export from it.
2. Add the `@proxy/<group>/<name>` alias to `paths` in `tsconfig.base.json`. Without it imports do not resolve.
3. Add a `project.json` (copy `libs/urls/features-url/project.json`) only if Nx should lint it. The analytics libs have none and still build.

Details: [shared-libs](./modules/shared-libs.md#path-aliases).

## Ship a change (branch flow)
Learned from the merged PR list (`gh pr list --state merged`), not from `README.md`.

1. Branch `<card-id>-clean` (e.g. `P0091-clean`) from `stage`. That is the current practice, but it isn't confirmed; see the TODO in [conventions](conventions.md#branching-and-release).
2. Open a PR into `stage`. Several PRs from the same `-clean` branch are normal.
3. Release: a PR from `stage` into `production` (#656 "Stage"). Hotfixes sometimes go straight to `production` from their own branch (#649, #637), or via a `<card-id>-prod` branch (#661).

> [!WARNING]
> `README.md` describes `development` → `main` → `production`. That flow is stale: `origin/main` was last updated 2026-04-21 and `origin/development` 2026-04-27. `.github/workflows/main.yml` runs the build check only on PRs into `development`, `main` and `production`, so PRs into `stage` get no CI build. Run `npx nx affected --target=build --configuration=local` yourself.

> [!WARNING]
> A revert merged only into `production` is undone by the next `stage` → `production` merge. #642 reverted the `ErrorInterceptor` retry on `production` (2026-06-23); #639 brought it back from `stage` the next day, and the retry is live on every branch at HEAD. Revert on `stage` too.
