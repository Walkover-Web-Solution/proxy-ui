---
covers: ["apps/36-blocks/src/app/core/ngrx/**", "apps/36-blocks/src/app/website/home/ngrx/**", "apps/36-blocks/src/app/**/*.store.ts", "apps/36-blocks/src/app/panel/layout/side-nav.service.ts", "apps/36-blocks/src/app/panel/layout/ui-settings.service.ts", "apps/36-blocks-widget/src/app/otp/store/**", "apps/36-blocks-widget/src/app/otp/component/login/login.store.ts", "apps/36-blocks-widget/src/main.ts", "apps/36-blocks-widget/src/main.dev.ts"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# State

Both apps use three kinds of state: a global NgRx store (`@ngrx/store` + `@ngrx/effects`), per-page `@ngrx/component-store` stores (files named `<page>.store.ts`), and Angular signals for local UI state. There is no HTTP cache layer (no TanStack/Apollo); server data lives in whichever store fetched it and is refetched when a page is created again.

## Which kind of state goes where

| Kind of state | Put it in | Examples | Why (evidence) |
|---|---|---|---|
| Session-wide, read by the layout and by several pages, must die on logout | Global NgRx store | logged-in user, client settings, clients list, projects | One shared copy; `clearStateMetaReducer` wipes it on `logoutAction`. |
| Server data and CRUD results for one page | A `ComponentStore` in `<page>.store.ts`, listed in that component's `providers` | blocks list, logs, billing, users/roles | Destroyed with the page, so no stale data on the next visit and no global reset needed. |
| Local UI flags, view mode, theme, derived values | `signal()` / `computed()` in the component or a root service | side nav open, dialog open, `isEditing`, `isDark` | Commits e1a40b95 (side nav `BehaviorSubject` → signal), 8641b056 (`isEditing` → signal), 39a7ba6e (`isDark` getter → `computed`) moved this kind of state to signals. |
| User preference that must survive reloads | `UiSettingsService` (`localStorage` key `ui-settings`, 30-day TTL) | theme, side nav open | a4a88252 extracted it from the layout. |
| Store value read in a signal-based template | `toSignal(store.select(...), { initialValue })` | `RegisterPageComponent`, `ProxyAuthWidgetComponent` | Avoids `async` pipes in signal templates. |

New code follows this table. Do not add page-only data to the global store, and do not add new `BehaviorSubject` UI flags.

> [!TODO] Needs a human: the table is derived from the code and commit history. Is it the agreed team rule, and should new pages keep using ComponentStore or move to the `@ngrx/signals` signal store (not installed today)?

## Global store: dashboard (`apps/36-blocks`)

Registered in `apps/36-blocks/src/app/app.config.ts:appConfig`:

```ts
provideStore(reducers, { metaReducers: [clearStateMetaReducer] }), // reducers = { root }
provideState('auth', loginsReducer),
provideState('registration', registrationReducer),
provideEffects([RootEffects, LogInEffects, RegistrationEffects]),
// provideStoreDevtools({ maxAge: 25 }) only when !environment.production
```

| Slice | State type / file | Key fields | Written by | Read by |
|---|---|---|---|---|
| `root` | `IRootState`, `apps/36-blocks/src/app/core/ngrx/store/reducer/root.reducer.ts` | `headerTitle`, `clientSettings`, `clients` (paginated, `pageNo > 1` appends), `switchClientSuccess`, `allProjects`, `*InProcess` flags, `errors` (never written) | `RootEffects` (`apps/36-blocks/src/app/core/ngrx/effects/root/root.effect.ts`) via `RootService`; `headerTitleAction` from `AppComponent` | `LayoutComponent`, `LogComponent`, `CreateProjectComponent`, `AppComponent` |
| `auth` | `ILogInState`, `apps/36-blocks/src/app/website/home/ngrx/store/login.reducer.ts` | `logInData` (`IFirebaseUserModel`), `logInInProcess`, `logInSuccess`, `logOutInProcess`, `logOutSuccess`, `errors` | `LogInEffects` | `LayoutComponent` (`selectLogInData`), login page, `AppComponent` |
| `registration` | `IRegistrationState`, `apps/36-blocks/src/app/website/home/ngrx/reducers/registration.reducer.ts` | `registrationInProgress`, `registrationSuccess`, `registeredEmail`, `registrationErrors` | `RegistrationEffects` | `RegisterPageComponent` (via `toSignal`) |

Actions: `rootActions` in `apps/36-blocks/src/app/core/ngrx/actions/root.action.ts`; login and registration actions in `apps/36-blocks/src/app/website/home/ngrx/actions/`. Selectors: `apps/36-blocks/src/app/core/ngrx/store/selectors/root.selector.ts` and `apps/36-blocks/src/app/website/home/ngrx/selector/`. The login/logout flow that drives these slices is in [app-shell](../modules/app-shell.md#login-flows-store-auth) and [dashboard-login](../flows/dashboard-login.md).

### `clearStateMetaReducer`

`apps/36-blocks/src/app/core/ngrx/store/app.state.ts:clearStateMetaReducer` replaces the whole state with `{}` when the action is `logoutAction` (from `website/home/ngrx/actions`), then runs the reducers, so every slice (including the `auth` and `registration` feature slices) goes back to its initial state.

> [!WARNING]
> The reset covers the global store only. ComponentStores, root services (`SideNavService`, `UiSettingsService`) and the in-memory token are not touched by `logoutAction`. Logout works anyway because `logoutActionComplete$` does a full page load (`window.location.href = '/'`). Any new global slice is reset for free; any new root service holding user data is not.

## Global store: widget (`apps/36-blocks-widget`)

Registered in `apps/36-blocks-widget/src/main.ts` (and the dev harness `main.dev.ts`) with `createApplication`:

```ts
provideStore(reducers, { runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true } }), // reducers = { otp }
provideEffects([OtpEffects]),
```

One slice, `otp` (`IOtpState`, `apps/36-blocks-widget/src/app/otp/store/reducers/otp.reducer.ts`). It holds the widget config (`widgetData`, `theme`), OTP send/verify/retry status, and about 45 `*Data` / `*InProcess` / `*Success` fields for the logged-in account screens (user profile, company users, roles, permissions, subscription plans). The auth-relevant fields are documented in [widget-auth](../modules/widget-auth.md#store-state-iotpstate-auth-relevant-part); account fields belong to [widget-account](../modules/widget-account.md).

- There is no meta-reducer. Resets are explicit: `resetAll` (back to `initialState`) and `resetAnyState({ request })` (patch any fields), both in `apps/36-blocks-widget/src/app/otp/store/actions/otp.action.ts`.
- `getWidgetData` also clears `widgetData` and `theme` in the reducer.

> [!WARNING]
> The widget's store is one instance per page, shared by every `<proxy-auth>` element on it (one `createApplication`). `ProxyAuthWidgetComponent.ngOnInit` dispatches `resetAll()` first so a new element does not show the previous element's `widgetData`/`theme` (bug fixed in 2779fa83: the dashboard preview showed the previous block's config). Keep that dispatch first if you touch `ngOnInit`.

> [!WARNING]
> `strictStateImmutability` / `strictActionImmutability` freeze state and actions in dev builds. Copy before mutating anything that came from `store.select` (the widget uses `cloneDeep` from `lodash-es` for this, e.g. in `RegisterComponent`), or dev builds throw while prod silently works.

## Component stores (`@ngrx/component-store`)

Each extends `ComponentStore<State>`, is `@Injectable()` (not `providedIn: 'root'`), and is listed in the page component's `providers`, so it lives exactly as long as that component.

| Store class | File | Provided by | State (key fields) | Module doc |
|---|---|---|---|---|
| `FeatureComponentStore` | `apps/36-blocks/src/app/panel/features/feature/feature.store.ts` | `FeatureComponent`, `UserComponent`, `ManagementComponent` | `features`, `isLoading`, `hasSomeFeatures` | [panel-features](../modules/panel-features.md) |
| `CreateFeatureComponentStore` | `apps/36-blocks/src/app/panel/features/create-feature/create-feature.store.ts` | `CreateFeatureComponent` | `featureType`, `serviceMethods`, `featureDetails`, plans/taxes/billable metrics, `paymentDetailsForm`, `webhookEvents`, `uploadLogoUrl`, `allowedOrigins` | [panel-features](../modules/panel-features.md#store--service-map) |
| `OauthConfigComponentStore` | `apps/36-blocks/src/app/panel/features/oauth-config/oauth-config.store.ts` | `OauthConfigComponent` | `oauthConfigs`, `blockScopes`, `blockScopeCatalog`, last create/update/delete results | [panel-features](../modules/panel-features.md) |
| `UserComponentStore` | `apps/36-blocks/src/app/panel/users/user/user.store.ts` | `UserComponent`, `ManagementComponent` | `users`, `roles`, `permissions`, CRUD results, `featureDetails` | [panel-ops](../modules/panel-ops.md) |
| `LogsComponentStore` | `apps/36-blocks/src/app/panel/logs/log/logs.store.ts` | `LogComponent` | `logs`, `environments`, `projects`, `reqLogs`, `*InProcess` | [panel-ops](../modules/panel-ops.md) |
| `BillingComponentStore` | `apps/36-blocks/src/app/panel/billing/billing.store.ts` | `BillingComponent` | `plans`, `activePlan`, `subscriptionStatus`, `subscriptionUsage`, `paymentMethods`, `upgradingPlanCode` | [panel-ops](../modules/panel-ops.md) |
| `CreateProjectComponentStore` | `apps/36-blocks/src/app/panel/create-project/create-project.store.ts` | `CreateProjectComponent` | `projects`, `environments`, `clientData`, `createProjectSuccess`, `isLoading` | [panel-ops](../modules/panel-ops.md) |
| `LoginComponentStore` | `apps/36-blocks-widget/src/app/otp/component/login/login.store.ts` | widget `LoginComponent` | `isLoading`, `otpData`, `resetPassword`, `apiError`, `showRegistration` | [widget-auth](../modules/widget-auth.md) |

The pattern every store follows (see `FeatureComponentStore.getFeature`):

```ts
readonly getFeature = this.effect((req$: Observable<IFeatureReq>) => req$.pipe(
  switchMap((req) => {
    this.patchState({ isLoading: true });
    return this.service.getFeature(req).pipe(
      tapResponse(
        (res) => { if (res?.hasError) this.showErrorMessages(res?.errors); this.patchState({ isLoading: false, features: res?.data }); },
        (error) => { this.showErrorMessages(error?.errors); this.patchState({ isLoading: false, features: null }); }
      ),
      catchError(() => EMPTY)
    );
  })
));
// showErrorMessages: errorResolver(errors).forEach(msg => this.toast.error(msg))   // PrimeNgToastService
```

- Read with the `select`ed `$` observables (`feature$`, `isLoading$`, ...) and the `async` pipe, or subscribe with `takeUntil(this.destroy$)` from `BaseComponent`.
- Results of mutations (`createRole`, `deletePlan`, ...) are stored as fields and components react to them changing. Nothing clears them after use, so a component that subscribes again gets the last result immediately.
- Errors go to toasts inside the store; components do not handle HTTP errors.

> [!WARNING]
> `ManagementComponent` (`<proxy-management>`) provides its own `FeatureComponentStore` and `UserComponentStore`, and it is rendered inside `UserComponent` and `CreateFeatureComponent`, which have their own stores. These are separate instances: data loaded by the parent page is not visible to the embedded management view, and vice versa.

## Signals

- Signal inputs/outputs (`input<T>()`, `input.required`, `output<T>()`) are the norm in `libs/ui/**`, directives and the widget (78107ece fixed templates to call them as `x()`). A few older libs (`MentionDirective`, `SkeletonDirective`) still use `@Input`.
- Dashboard: `SideNavService` (`apps/36-blocks/src/app/panel/layout/side-nav.service.ts`) holds `isSideNavOpen` and `hideSidebar` signals, persisted through `UiSettingsService`. `LayoutComponent.isDarkMode`, dashboard charts and `WidgetPreviewComponent` (`referenceId`, `viewMode`, computed snippet) also use signals.
- Widget: `ProxyAuthWidgetComponent` uses `show`, `showRegistration`, `showForgotPassword`, OAuth flags and a `viewMode` computed (see [widget-auth](../modules/widget-auth.md#1-which-screen-shows-the-state-machine)); `WidgetThemeService` exposes `resolvedTheme` and `isDark$` signals; every widget screen has `isDark = computed(() => themeService.isDark$())` and `effect(() => this.themeService.setInputTheme(this.theme()))`.
- `OtpWidgetService.showlogin` is still a `BehaviorSubject`, bridged with `toSignal`.

## Persistence

| What | Where | Owner |
|---|---|---|
| Theme + side nav open | `localStorage['ui-settings']`, expires after 30 days | `apps/36-blocks/src/app/panel/layout/ui-settings.service.ts:UiSettingsService` |
| Widget preview "back" target (`originUrl` from navigation state) | `sessionStorage['widget_preview_origin_<referenceId>']` | `WidgetPreviewComponent` |
| Auth token | cookie `authToken` + memory | `AuthService`, see [app-shell](../modules/app-shell.md#where-the-auth-token-lives) |

Nothing in the NgRx stores is persisted; a reload starts empty and `AuthInitializerService` restores only the token.

## Unused packages

`@ngrx/entity`, `@ngrx/router-store` and `@ngrx/component` are in `package.json` but imported nowhere. Do not assume entity adapters or router state exist.
