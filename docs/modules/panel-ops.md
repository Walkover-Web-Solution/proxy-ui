---
covers: ["apps/36-blocks/src/app/panel/panel.routes.ts", "apps/36-blocks/src/app/panel/layout/**", "apps/36-blocks/src/app/panel/dashboard/**", "apps/36-blocks/src/app/panel/users/**", "apps/36-blocks/src/app/panel/logs/**", "apps/36-blocks/src/app/panel/billing/**", "apps/36-blocks/src/app/panel/onboarding/**", "apps/36-blocks/src/app/panel/create-project/**", "apps/36-blocks/src/app/panel/chatbot/**"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# Panel pages (everything except features)

The logged-in dashboard under `/app`: the shell (`LayoutComponent` with side nav, client switcher, theme toggle and the "Ask AI" chatbot), and the Dashboard, Users, Logs and Billing pages. It also covers two pages that sit outside `/app`: `/onboarding` (finish sign-up) and `/project` (legacy proxy-gateway project wizard). The Blocks pages (`/app/features`) are in [panel-features](./panel-features.md). Auth, the root NgRx store and app routes are in [app-shell](./app-shell.md).

| File | Role |
|---|---|
| `apps/36-blocks/src/app/panel/panel.routes.ts` | `panelRoutes`, mounted at `/app` by `app.routes.ts`. One `LayoutComponent` parent guarded by `CanActivateRouteGuard`; children `dashboard` (default), `logs`, `features`, `users`, `chatbot`, `billing`. |
| `apps/36-blocks/src/app/panel/layout/layout.routes.ts` | `layoutRoutes`. A stale copy of `panelRoutes` without `billing`. Nothing imports it. |
| `apps/36-blocks/src/app/panel/layout/layout.component.ts` | `LayoutComponent`: loads clients and client settings into the root store, client switcher, dark mode, hides the sidebar on `/features/create` for first-time users, injects the chatbot script. |
| `apps/36-blocks/src/app/panel/layout/main-left-side-nav/main-left-side-nav.component.ts` | `MainLeftSideNavComponent`: the `navItems` list (Dashboard, Blocks, User, Logs, Ask Ai). Billing is a separate link in the layout template. |
| `apps/36-blocks/src/app/panel/layout/sidebar-user-menu/sidebar-user-menu.component.ts` | `SidebarUserMenuComponent`: user avatar menu; emits `darkModeToggled` and `loggedOut`. |
| `apps/36-blocks/src/app/panel/layout/ui-settings.service.ts` | `UiSettingsService`: theme and side-nav state in `localStorage['ui-settings']` with a 30-day TTL. |
| `apps/36-blocks/src/app/panel/layout/side-nav.service.ts` | `SideNavService`: `isSideNavOpen` and `hideSidebar` signals; `toggle`/`open`/`close` persist through `UiSettingsService`. |
| `apps/36-blocks/src/app/panel/dashboard/dashboard.component.ts` | `DashboardComponent`: range and block filter, overview cards. No store; signals and `AnalyticsService` directly. |
| `apps/36-blocks/src/app/panel/dashboard/dashboard.models.ts` | Param interfaces, `OVERVIEW_CARDS`, `RANGE_OPTIONS`, `TIMESERIES_METRICS`, `GROUP_BY_OPTIONS`, `intervalForRange`. |
| `apps/36-blocks/src/app/panel/dashboard/timeseries-chart/timeseries-chart.component.ts` | `TimeseriesChartComponent`: one ECharts line chart per metric. |
| `apps/36-blocks/src/app/panel/dashboard/breakdown-chart/breakdown-chart.component.ts` | `BreakdownChartComponent`: ECharts pie chart grouped by type/service/country. |
| `apps/36-blocks/src/app/panel/users/user/user.component.ts` | `UserComponent`: tabs "User" (end-user table of all blocks) and "Management" (`proxy-management`). |
| `apps/36-blocks/src/app/panel/users/user/user.store.ts` | `UserComponentStore`: users, roles, permissions, feature details, `updateFeature`. |
| `apps/36-blocks/src/app/panel/users/management/management.component.ts` | `ManagementComponent`: per-block roles, permissions, user-management snippet, test users, default-role settings. Also embedded in the feature edit page with `[referenceId]`. |
| `apps/36-blocks/src/app/panel/logs/log/log.component.ts` | `LogComponent`: proxy request logs table with filters, sort, pagination and a detail side dialog. |
| `apps/36-blocks/src/app/panel/logs/log/logs.store.ts` | `LogsComponentStore`: logs, log detail, environments, projects. |
| `apps/36-blocks/src/app/panel/logs/log-details-side-dialog/log-details-side-dialog.component.ts` | `LogsDetailsSideDialogComponent`: shows headers / request body / response of one log. |
| `apps/36-blocks/src/app/panel/billing/billing.component.ts` | `BillingComponent`: current plan, usage rings, payment methods, plans dialog. |
| `apps/36-blocks/src/app/panel/billing/billing.store.ts` | `BillingComponentStore`: all billing calls, customer bootstrap, checkout redirects. |
| `apps/36-blocks/src/app/panel/billing/billing.service.ts`, `apps/36-blocks/src/app/panel/billing/billing.urls.ts`, `apps/36-blocks/src/app/panel/billing/billing.models.ts` | `BillingService`, `BillingUrls`, response interfaces. The only page whose service and URLs live in the app instead of `libs/`. |
| `apps/36-blocks/src/app/panel/onboarding/onboarding.component.ts` | `OnboardingComponent`: one form (name, mobile with dial code, organization name) that completes sign-up. |
| `apps/36-blocks/src/app/panel/create-project/create-project.component.ts`, `apps/36-blocks/src/app/panel/create-project/create-project.store.ts` | `CreateProjectComponent` + `CreateProjectComponentStore`: 3-step proxy project wizard at `/project`. Nothing in the app links to it. |
| `apps/36-blocks/src/app/panel/chatbot/chatbot.component.ts` | `ChatbotComponent`: empty placeholder. The real chat UI is the script injected by `LayoutComponent` into `#ChatbotContainer`. |

## Clients and projects

- A **client** is the customer organization (company) that owns blocks, users and the subscription. A login can belong to several clients. The **current client** lives on the server, bound to the session token: no request in this area sends a client id. `HttpWrapperService` only adds `Authorization: <token>` (see [shared-libs](./shared-libs.md)).
- On init `LayoutComponent` dispatches `rootActions.getAllClients({ params: { itemsPerPage: 100, pageNo: 1 } })` and `rootActions.getClientSettings()`. The header shows `clientSettings.client.name`. The dropdown appears only when there is more than one client.
- Switching: `switchClient(client.id)` → `rootActions.switchClient({ request: { client_id } })` → `POST switchclient` → `switchClientSuccess` → `LayoutComponent` sets `location.href = '/app'`. The full reload is how every page and ComponentStore picks up the new client (commit `e59efd19` "reload on company change").
- A **project** is a legacy proxy-gateway entity (`IProjects` from `libs/models/logs-models`, with `environments_with_slug`). Projects and **environments** are only used by the Logs filters and the `/project` wizard. They are not blocks. The root store's `allProjects` is filled only by `CreateProjectComponent` (`rootActions.getAllProject()`).

> [!WARNING]
> Do not add a client id to requests or cache client data across a switch. The backend scopes by token, and the page relies on the hard reload after `switchClientSuccess`. If you replace the reload with in-app navigation, every ComponentStore and the root store keep the old client's data.

## Layout, side nav and UI settings

1. `UiSettingsService` reads `localStorage['ui-settings']` = `{ theme: 'light-theme' | 'dark-theme', sideNavOpen: boolean, _savedAt: number }`. Data older than 30 days (`TTL_MS`) or corrupt JSON falls back to `{ theme: 'light-theme', sideNavOpen: true }`. On the server it never touches storage.
2. `setTheme` saves and swaps the `light-theme` / `dark-theme` class on `document.body`. Charts and other theme-aware code watch that class (the dashboard charts use a `MutationObserver` on `body`).
3. `SideNavService.isSideNavOpen` starts from the stored value; `toggle`/`open`/`close` write back. `LayoutComponent` closes it on widths ≤ 992 px. `UserComponent.onTabChange` closes it on the Management tab. `CreateFeatureComponent` and `WidgetPreviewComponent` also use both services.
4. `hideSidebar` is set on every `NavigationEnd`: on `/features/create` it calls `FeaturesService.getFeature({ itemsPerPage: 1, pageNo: 1 })` and hides the sidebar when the client has no features yet (first-block flow), otherwise it is `false`.
5. Chatbot ("Ask Ai"): when both login data and client settings exist, `RootService.generateToken({ source: 'chatbot' })` returns `data.jwt`. The layout appends `<script id="chatbot-main-script" src=environment.interfaceScriptUrl embedToken=… parentId="ChatbotContainer" fullScreen hideIcon hideCloseButton>`. On load, after 2 s, it calls `window.SendDataToChatbot({ variables: { variables: JSON.stringify({ session: <auth token> }) }, threadId: email + client.id, bridgeName: 'root', ... })` and `window.openChatbot()`. `#ChatbotContainer` is always in the DOM and shown only when the URL contains `chatbot`. Theme changes are pushed with `window.Chatbot.sendData({ theme })`. The script URL comes from the environment ([environment.md](../environment.md)).

> [!WARNING]
> `<proxy-main-left-side-nav [isSideNavOpen]="!sideNavService.isSideNavOpen()">` passes the inverted value. Inside `MainLeftSideNavComponent`, `isSideNavOpen()` is `true` when the sidebar is **collapsed** (it shows tooltips and hides labels). Keep the inversion in mind or rename both sides together.

> [!WARNING]
> The chatbot receives the user's auth token as the `session` variable. Treat `interfaceScriptUrl` as trusted code with full account access.

## Dashboard (analytics)

- Data source: `AnalyticsService` (`libs/services/proxy/analytics`) → `GET analytics/overview`, `GET analytics/timeseries`, `GET analytics/breakdown` on `environment.baseUrl` (`AnalyticsUrls`). Responses are read at `res.data.data`.
- Filters: `range` (`day` | `week` | `month`, default `week`) and an optional block picked from an autocomplete. The block list is `FeaturesService.getFeature({})` and the value sent is the block's **numeric** `id` as `feature_configuration_id` (see the id spaces in [panel-features](./panel-features.md)).
- `DashboardComponent.params` is a `computed`; an `effect` calls `fetchOverview` when it changes. Cards come from `OVERVIEW_CARDS` and read dotted paths via `getCardValue`. "Total Users" reads `users.feature_configuration_total` and falls back to `users.client_total` when the first is falsy (commit `61c746a9`).
- `TimeseriesChartComponent` fires one `GET analytics/timeseries` per entry in `TIMESERIES_METRICS` (`signups`, `logins`, `active_users`) with `forkJoin`, and renders one line chart each. `interval` is always `intervalForRange(range)`: `day`→`hour`, `week`→`day`, `month`→`week`. `onIntervalChange` exists but the template has no control for it.
- `BreakdownChartComponent` calls `GET analytics/breakdown` with `group_by` from `GROUP_BY_OPTIONS` (`type`, `service_id`, `country`; `source` is commented out) and renders a pie chart.
- ECharts (`import * as echarts from 'echarts'`) is initialized after a `setTimeout(…, 0)` so the `@for` chart divs exist. Colors are read from CSS variables `--color-common-border|text|bg` on each render.

```ts
// overview data (res.data.data), keys the cards read
{ users: { feature_configuration_total?, client_total? }, signups: { total }, logins: { total }, active_users: { unique } }
// timeseries res.data.data
[{ period: string, value: number }]
// breakdown res.data.data
[{ key: string, count: number }]
```

## Users

- **User tab** (`UserComponent`): end users who signed up through the client's blocks. `GET clientUsers` with `pageNo`, `itemsPerPage`, `search`, `startDate`/`endDate` (`DD-MM-YYYY`, from the date-range picker), `company_name` and `feature_id`. The block filter lists only `feature_id === 1` (authorization) blocks, and its value is the block's **`reference_id`**, despite the param name `feature_id`.
- **Management tab** (`ManagementComponent`, selector `proxy-management`): pick an authorization block, then manage it in sections Roles, Permissions, Snippet, Testing Users, Settings.
  - Roles: `GET|POST :referenceId/cRoles`, `PUT|DELETE :referenceId/cRoles/:id` (`UsersUrl`). The slide toggle sends `PUT` with `{ is_hidden }`. Permissions: same under `:referenceId/cPermission`. Every list reloads after a create/update/delete by watching the store's `createRole$`, `updateRole$`, etc.
  - Snippet: `ProxyUserManagementScript(environment.proxyServer, referenceId)` plus `<div id="userProxyContainer">` (`PROXY_DOM_ID`).
  - Settings and Testing Users write into the block's `extra_configurations` with `FeaturesService.updateFeature(<numeric id>, body)` (`PUT features/:id`). The numeric id comes from `bindSelectedFeatureByReferenceId`, which looks up the reference id in the loaded feature list and then loads `GET features/:id` into `featureDetails`.

```ts
// PUT features/:id body from saveDefaultRoles()
{ extra_configurations: {
    c_roles: { default_creator_role, default_member_role, hide_default_creator_role, hide_default_member_role },
    default_role: { name: 'Owner', value: 1 } } }
// PUT features/:id body from persistTestIdentities()  (max 50 entries)
{ extra_configurations: { test_identities: [{ email?, mobile? }] } }
```

> [!WARNING]
> In `ManagementComponent.roleForm`, the control `feature_id` holds the block's **`reference_id`** string and `id` holds its numeric id. Roles/permissions URLs need the reference id; `updateFeature` and `getFeatureDetails` need the numeric id. When embedded, `[referenceId]` is set before the feature list arrives, so `bindSelectedFeatureByReferenceId` runs again once `features$` emits.

> [!WARNING]
> Always send the **whole** `test_identities` array. The code comment says the backend merges list values by index, so sending only the new entry overwrites index 0.

## Logs

- Proxy-gateway request logs. `LogsService` (`libs/services/proxy/logs`) uses the `ProxyBaseUrls.ProxyLogsUrl` token, which `app.config.ts` sets to the same `environment.baseUrl`. Calls: `GET proxyLogs`, `GET proxyLogs/:id`, `GET environments`, `GET projects`.
- `LogComponent.params` is a plain object that every filter mutates and then calls `getLogs()`:

| UI | Param(s) |
|---|---|
| Date range picker | `startDate`, `endDate` (`DD-MM-YYYY`); default `DEFAULT_SELECTED_DATE_RANGE` |
| Search box (Enter) | `search`; resets `pageNo` to 1 |
| Column sort | `sortBy`, `order` (`asc`/`desc`); removed when sort is cleared |
| Environment / project autocomplete | `environment_id`, `project_id` (null keys removed with `CustomValidators.removeNullKeys`) |
| Filter menu | `range` (`status_code`), `from`, `to` (integers, `from` ≤ `to`), `request_type` (comma list; omitted when all five methods are selected) |
| Paginator | `pageNo` (1-based), `itemsPerPage` |

- The environment and project dropdowns page through their lists with infinite scroll (`fetchNextPage`, 25 per page). The store appends `data` when the response `pageNo > 1`.
- Clicking a row → `getLogsById(id)`. The store parses `request_body`, `headers` and `response` with a recursive `JSON.parse`, since they can arrive double-encoded. The side dialog hides a section only if `clientSettings.client.settings.logs.store_headers|store_requestBody|store_response` is falsy. With no log settings it shows all three (commit `0b1ecb08`).

> [!TODO] Needs a human: the Logs nav item has the comment "Temporary hide this page" but is shown. Are proxy logs still a supported product for 36Blocks clients?

## Billing

- Backend endpoints under `v1/billing/*` on `environment.baseUrl` (`BillingUrls`); full list in [api.md](../api.md). Plans are identified by `lago_plan_code`, and usage responses carry a `source` field, so the backend uses **Lago** for plans and subscriptions. Payment methods have Stripe-style fields (`card.brand`, `display_brand`, `last4`, `billing_details`) and adding one redirects to a hosted `checkout_url`. The frontend never calls Lago or a payment provider directly.

> [!TODO] Needs a human: confirm the payment provider behind `checkout_url` and `payment_methods` (the field shape matches Stripe), and where checkout redirects back to.

Flow in `BillingComponentStore`:

1. `ngOnInit` → `loadSubscriptionStatus()` and `loadPaymentMethods()`.
2. `loadSubscriptionStatus`: `GET v1/billing/subscription/status`. If `has_subscription` is false and no bootstrap was tried yet, it calls `POST v1/billing/customer` once (`customerBootstrapAttempted`), then re-reads the status. This creates the billing customer lazily on first visit.
3. With an active plan code: `GET v1/billing/plans/:planCode` → `activePlan`, and `GET v1/billing/subscription/usage` → `subscriptionUsage` (metric rings).
4. "Change plan" opens a dialog and loads `GET v1/billing/plans`. **Plan order in that array is the tier order**: `getPlanRank` uses the index to label upgrade vs downgrade.
5. CTA → confirm dialog → `upgradeSubscription(plan.lago_plan_code)` → `POST v1/billing/subscription/upgrade { plan_code }`. If the response has `requires_payment_method`, the browser goes to `checkout_url` (or `raw.customer.checkout_url`). Otherwise status, active plan and usage are reloaded.
6. Payment methods: `GET v1/billing/customer/payment-methods` (sorted default first), `POST v1/billing/customer/checkout-url` → redirect, `POST v1/billing/customer/default-payment-method { payment_method_id }` → reload.

```ts
IBillingSubscriptionStatus { has_subscription, status, active_plan_code, pending_plan_code, started_at, ending_at }
IBillingPlan { id, name, lago_plan_code, is_internal, frontend_data?: { price?, tagline?, features?, display_name?, badge?, cta?, ... }, limits? }
IBillingSubscriptionUsage { fetched_successfully, source, message, plan: { code, name }, period: { from, to },
  metrics: [{ code, name, unit, current_usage, limit, limit_display, is_unlimited, percent_used }] }
IBillingCheckoutResponse { requires_payment_method?, checkout_url, raw?: { customer?: { checkout_url? } } }
```

- Plan cards are driven by backend `frontend_data`. A feature string matching `/not available|not included/i` renders as excluded; `/extra usage|^\+\$/i` renders bold.
- `BillingService` returns `BaseResponse`; a 200 with `hasError: true` is toasted through `errorResolver` and treated as empty.

## Onboarding (`/onboarding`)

Not under `/app` and not guarded. Users with `is_onboarding_pending` land here after email login with a pending token.

1. `ngOnInit` reads the pending JWT from query param `onboarding_token`.
2. The form: `name` (≥ 2 chars), `mobile` (10–15 digits) with a country dial-code picker (`COUNTRIES_DATA`, default `IN`), `organizationName` (≥ 2).
3. `UsersService.submitOnboarding` → `POST onboarding` through the no-auth HTTP wrapper with `{ user: { name, mobile }, client: { name: organizationName, mobile }, onboarding_token }`. `mobile` is the dial code without `+`, followed by the number.
4. On success the returned `data.token` (or `token`) is saved with `AuthService.setTokenSync` and the user goes to `/app/features/create`.

> [!WARNING]
> `LoginPageComponent` navigates to `/onboarding?token=…`, but this component reads `onboarding_token` (commit `23e43b09` renamed it here; `cc2504a4` had renamed it the other way). The email-login onboarding path therefore submits without a token. Fix both sides together; see [app-shell](./app-shell.md).

## Legacy project wizard (`/project`)

`CreateProjectComponent` is a 3-step proxy-gateway wizard: (1) name, rate limit `"<minutes>:<hits>"` per selected environment → `POST projects`; (2) optional source URLs → `POST sourceDomains`; (3) forward URLs per environment → `PUT projects/:id` with `{ environments: { <envName>: { host_url, source_domain? } } }`, then navigates to `/app`. Gateway URLs shown to the user are `${environment.baseUrl}/proxy/<url_unique_id>/<project_slug>`. It is guarded but no link points to it.

> [!WARNING]
> `CreateProjectComponent` calls `getClientData(res.client_id)`, which passes a number where `CreateProjectService.getClientData` expects query params for `GET clients`. Check it before reviving this page.

## Why it is built this way

- Pages use a per-component `ComponentStore` (`providers: [...]`) instead of the root store, so state resets on navigation. Only clients, client settings and projects are global ([app-shell](./app-shell.md)). The dashboard is newer (commit `78facc08` "Dashboard Integration & install Apache ECharts") and uses signals with no store.
- UI settings moved from scattered `localStorage` keys to `UiSettingsService` with a 30-day TTL in commit `a4a88252`. The commit records no reason for the TTL.
- Billing was added in one commit (`11cea466` "subscription on panal") with its service, URLs and models inside the page folder, unlike other pages, which use `libs/services/proxy/` and `libs/urls/`.
- A project guard (deleted file `panel/guard/project.guard.ts`) used to redirect clients with zero projects to `/project`. It was removed from `/app` in `cc2504a4` and deleted in `35cfae28`, which is why the wizard is now unreachable from the UI. <!-- verify:ignore -->

## Changing it safely

- **New panel page:** add the child route in `panel.routes.ts` (not `layout.routes.ts`, which is dead), add a `navItems` entry in `MainLeftSideNavComponent`, and give the page its own `ComponentStore` in `providers`.
- **New billing endpoint:** add it to `BillingUrls`, `BillingService` and `billing.models.ts`, and handle `res.hasError` in the store like the existing effects do.
- **Dashboard metric:** add it to `TIMESERIES_METRICS` / `OVERVIEW_CARDS` / `GROUP_BY_OPTIONS` in `dashboard.models.ts`. The charts iterate those constants, and the backend must accept the new `metric` or `group_by` value.
- **Anything sent to roles/permissions vs. feature update:** check which id (reference vs numeric) the endpoint expects. See the id spaces in [panel-features](./panel-features.md).
- Check by running the app (`/app/dashboard`, `/app/users`, `/app/billing`) with a client that has more than one company to exercise the switcher.
