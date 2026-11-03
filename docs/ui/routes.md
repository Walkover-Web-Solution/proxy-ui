---
covers: ["apps/36-blocks/src/app/**/*.routes.ts", "apps/36-blocks/src/app/website/home/authguard/**", "apps/36-blocks/src/app/panel/layout/main-left-side-nav/main-left-side-nav.component.ts"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# Routes and pages

Only the dashboard app (`apps/36-blocks`) has a router. `appConfig` registers `appRoutes` from `apps/36-blocks/src/app/app.routes.ts` with `withEnabledBlockingInitialNavigation()` (guards run before the first render) and `withInMemoryScrolling` (scroll to top, anchor scrolling on). Every page is a standalone component loaded with `loadComponent` or `loadChildren`; nothing is eager except the catch-all `NotFoundRedirectComponent`.

The widget app (`apps/36-blocks-widget`) has no router: `ProxyAuthWidgetComponent` picks the screen from its `type`/`authToken` inputs (`viewMode` computed) plus dialog signals. See [widget-auth](../modules/widget-auth.md#1-which-screen-shows-the-state-machine).

## Route files

| File | Export | Mounted at |
|---|---|---|
| `apps/36-blocks/src/app/app.routes.ts` | `appRoutes` | root (`appConfig`) |
| `apps/36-blocks/src/app/website/website.routes.ts` | `websiteRoutes` | `''` |
| `apps/36-blocks/src/app/panel/panel.routes.ts` | `panelRoutes` | `app` |
| `apps/36-blocks/src/app/panel/features/features.routes.ts` | `featuresRoutes` | `/app/features` |
| `apps/36-blocks/src/app/panel/logs/logs.routes.ts` | `logsRoutes` | `/app/logs` |
| `apps/36-blocks/src/app/panel/layout/layout.routes.ts` | `layoutRoutes` | **nowhere** (dead copy, see warning) |

> [!WARNING]
> `layoutRoutes` is an older copy of `panelRoutes` (same layout and children, minus `billing`). Nothing imports it. Add new dashboard pages to `panelRoutes`, not here. Deleting the file is safe.

## Full route table

Paths are full URLs. "Lazy" means `loadComponent`/`loadChildren` (own chunk). Guards: `CanActivateRouteGuard` = logged in (cookie `authToken`, memory token, or a Firebase user) else redirect to `''`; `LoggedInGuard` = redirect logged-in users to `/app/dashboard`. Both are in `apps/36-blocks/src/app/website/home/authguard/`; details in [app-shell](../modules/app-shell.md#routes-and-guards).

### Public website (`websiteRoutes`, layout `WebsiteLayoutComponent`)

| Route | Component | Guard | Load | Purpose |
|---|---|---|---|---|
| `/` | `apps/36-blocks/src/app/website/home/home.component.ts:HomeComponent` | `LoggedInGuard` | lazy | Landing page (SEO meta, JSON-LD, widget theme demo) |
| `/pricing` | `apps/36-blocks/src/app/website/pricing/pricing.component.ts:PricingComponent` | none | lazy | Static pricing page |
| `/security` | `apps/36-blocks/src/app/website/security/security.component.ts:SecurityComponent` | none | lazy | Static page |
| `/privacy` | `apps/36-blocks/src/app/website/privacy/privacy.component.ts:PrivacyComponent` | none | lazy | Static page |
| `/terms` | `apps/36-blocks/src/app/website/terms/terms.component.ts:TermsComponent` | none | lazy | Static page |
| `/about` | `apps/36-blocks/src/app/website/about/about.component.ts:AboutComponent` | none | lazy | Static page |
| `/contact` | `apps/36-blocks/src/app/website/contact/contact.component.ts:ContactComponent` | none | lazy | Contact form (posts to a webhook) |
| `/register` | `apps/36-blocks/src/app/website/register/register-page.component.ts:RegisterPageComponent` | none | lazy | Email + password sign-up (`registration` store slice) |
| `/login` | `apps/36-blocks/src/app/website/login/login-page.component.ts:LoginPageComponent` | none | lazy | Email/password and Google login (`auth` store slice) |

The layout itself (`apps/36-blocks/src/app/website/layout/website-layout.component.ts:WebsiteLayoutComponent`) is lazy too, and adds `website-active` to `<body>` while mounted (dark marketing background, see [design-system](design-system.md#dashboard-theme)).

### Standalone top-level pages (`appRoutes`)

| Route | Component | Guard | Load | Purpose |
|---|---|---|---|---|
| `/onboarding` | `apps/36-blocks/src/app/panel/onboarding/onboarding.component.ts:OnboardingComponent` | none | lazy | Finish sign-up; reads query `onboarding_token` |
| `/widget-preview/:referenceId` | `apps/36-blocks/src/app/panel/features/create-feature/feature-preview/widget-preview/widget-preview.component.ts:WidgetPreviewComponent` | `CanActivateRouteGuard` | lazy | Full-page live preview of a block's widget; query `tab`, `theme` |
| `/project` | `apps/36-blocks/src/app/panel/create-project/create-project.component.ts:CreateProjectComponent` | `CanActivateRouteGuard` | lazy | Create the first project / environment |
| `/client/registration` | `apps/36-blocks/src/app/core/registration/registration.component.ts:RegistrationComponent` | none | lazy | Loads the widget script in register-only mode; query `reference_id`, `first_name`, `last_name`, `signup_service_id`, `email` |
| `**` | `NotFoundRedirectComponent` (inline in `app.routes.ts`) | inline `canActivate` | eager | Never renders: redirects to `/app/dashboard` when a cookie or memory token exists, else to `''` |

### Dashboard (`panelRoutes`, layout `LayoutComponent`)

The parent route `/app` lazy-loads `apps/36-blocks/src/app/panel/layout/layout.component.ts:LayoutComponent` (side nav, header, client switcher, Light / Dark / System theme switcher) with `canActivate: [CanActivateRouteGuard]`. The guard is on the parent only; children inherit it.

| Route | Component | Guard | Load | Purpose / data |
|---|---|---|---|---|
| `/app` | redirect | (parent) | – | → `/app/dashboard` |
| `/app/dashboard` | `apps/36-blocks/src/app/panel/dashboard/dashboard.component.ts:DashboardComponent` | (parent) | lazy | Analytics charts (`AnalyticsService`, `FeaturesService`, ECharts) |
| `/app/features` | `apps/36-blocks/src/app/panel/features/feature/feature.component.ts:FeatureComponent` | (parent) | lazy (`loadChildren` → `featuresRoutes`) | Blocks list (`FeatureComponentStore`) |
| `/app/features/create` | `apps/36-blocks/src/app/panel/features/create-feature/create-feature.component.ts:CreateFeatureComponent` | (parent) | lazy | Create-block wizard (`CreateFeatureComponentStore`) |
| `/app/features/manage/:id` | same `CreateFeatureComponent` | (parent) | lazy | Edit an existing block; `params.id` switches the component to edit mode |
| `/app/users` | `apps/36-blocks/src/app/panel/users/user/user.component.ts:UserComponent` | (parent) | lazy | End users, roles, permissions (`UserComponentStore` + `FeatureComponentStore`) |
| `/app/logs` | `apps/36-blocks/src/app/panel/logs/log/log.component.ts:LogComponent` | (parent) | lazy (`loadChildren` → `logsRoutes`) | Request logs (`LogsComponentStore`); `data: { title: 'Logs' }` |
| `/app/chatbot` | `apps/36-blocks/src/app/panel/chatbot/chatbot.component.ts:ChatbotComponent` | (parent) | lazy | Empty placeholder; `LayoutComponent` shows the GTWY chatbot container when the URL contains `chatbot` |
| `/app/billing` | `apps/36-blocks/src/app/panel/billing/billing.component.ts:BillingComponent` | (parent) | lazy | Plans, usage, payment methods (`BillingComponentStore`) |

Page internals are in [panel-features](../modules/panel-features.md) and [panel-ops](../modules/panel-ops.md). Backend endpoints are in [api](../api.md).

## Navigation and layout

- **Two layouts.** Website pages render inside `WebsiteLayoutComponent` (header/footer, `routerLink` nav). Dashboard pages render inside `LayoutComponent`. `/onboarding`, `/project`, `/widget-preview/:referenceId` and `/client/registration` have no layout.
- **Side nav items** are a hardcoded array in `apps/36-blocks/src/app/panel/layout/main-left-side-nav/main-left-side-nav.component.ts:MainLeftSideNavComponent` (`dashboard`, `features` "Blocks", `users`, `logs`, `chatbot` "Ask Ai"), relative to `/app`. Billing is a separate link in `layout.component.html` (`routerLink="/app/billing"`).
- **Header title** comes from route `data.title`: `AppComponent` dispatches `rootActions.headerTitleAction` with the deepest route's title on every `NavigationEnd`. Only `logsRoutes` sets one today.
- **Logged-in redirect off website pages** happens in two places: `LoggedInGuard` on `/` only, and `AppComponent` on `authenticatedAction` for a hardcoded `websiteRoutes` list. A new website page must be added to that list (see [app-shell](../modules/app-shell.md)).
- **Deep links** use path params for ids (`manage/:id`, `widget-preview/:referenceId`) and query params for view state (`tab`, `theme` on widget preview, written back with `queryParamsHandling: 'merge'`).

> [!WARNING]
> `CanActivateRouteGuard` lets a Firebase-only session through (no proxy JWT). Pages under `/app` then make API calls without an `Authorization` token and `ErrorInterceptor` drops them. See [app-shell](../modules/app-shell.md#gotchas).

## Changing routes safely

1. New dashboard page: add a `loadComponent` child to `panelRoutes` (not `layoutRoutes`); it inherits the guard. Add a side-nav entry in `MainLeftSideNavComponent` if it needs one.
2. New sub-routes for an area: create `<area>.routes.ts` exporting a `Route[]` and mount it with `loadChildren`, like `featuresRoutes`.
3. New public page: add it under `websiteRoutes` and to the `AppComponent` website-route list.
4. Set `data: { title }` if the page needs a header title.
5. Run `npm run build:web` (or `npm start`) and open the URL directly (blocking initial navigation means a broken guard shows as a blank page, not an error).
