---
covers: ["libs/**", "tsconfig.base.json"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# Shared libs (`libs/`)

Code shared by the two apps, imported only through `@proxy/...` path aliases from `tsconfig.base.json`. It holds the two HTTP wrappers, the dashboard error interceptor, one service per backend area ("proxy services"), URL builders, response models, constants (including the widget config type), validators, regexes, utils, and small UI components, pipes and directives. The dashboard (`apps/36-blocks`) uses almost all of it. The widget (`apps/36-blocks-widget`) uses only a small, auth-free subset (see [Which app uses what](#which-app-uses-what)).

## Path aliases

Every lib has one alias, pointing at its src/index.ts. Import through the alias, never with a relative path into `libs/`. Some aliases use PascalCase or camelCase segments that differ from the folder name. Copy them exactly.

| Alias | Folder | What it exports |
|---|---|---|
| `@proxy/services/httpWrapper` | `libs/services/http-wrapper/` | `HttpWrapperService` (adds auth), `DEFAULT_OPTIONS` |
| `@proxy/services/http-wrapper-no-auth` | `libs/services/http-wrapper-no-auth/` | `HttpWrapperService` with the same name and no auth (widget) |
| `@proxy/services/interceptor/errorInterceptor` | `libs/services/interceptor/error-interceptor/` | `ErrorInterceptor` |
| `@proxy/services/login` | `libs/services/login/` | `LoginService` (`googleLogin`, `logout`) |
| `@proxy/services/proxy/auth` | `libs/services/proxy/auth/` | `AuthService`: token in memory plus the `authToken` cookie, Firebase Google popup |
| `@proxy/services/proxy/root` | `libs/services/proxy/root/` | `RootService`: client settings, switch client, clients, generateToken, projects |
| `@proxy/services/proxy/features` | `libs/services/proxy/features/` | `FeaturesService`: features, subscription plans/taxes/metrics, OAuth configs, block scopes |
| `@proxy/services/proxy/users` | `libs/services/proxy/users/` | `UsersService`: client users, roles, permissions, plus register/login/onboarding without auth |
| `@proxy/services/proxy/logs` | `libs/services/proxy/logs/` | `LogsService`: proxy logs, projects, environments |
| `@proxy/services/proxy/create-project` | `libs/services/proxy/create-project/` | `CreateProjectService` |
| `@proxy/services/proxy/analytics` | `libs/services/proxy/analytics/` | `AnalyticsService` (no `project.json`, so it is not an Nx project) |
| `@proxy/service` | `libs/service/` | `createUrl`, `CustomEncoder`, `VersionCheckService` |
| `@proxy/urls/root-urls` | `libs/urls/root-urls/` | `RootUrls` |
| `@proxy/urls/features-url` | `libs/urls/features-url/` | `FeaturesUrls` |
| `@proxy/urls/users-urls` | `libs/urls/users-urls/` | `UsersUrl` |
| `@proxy/urls/logs-urls` | `libs/urls/logs-urls/` | `LogsUrls` |
| `@proxy/urls/create-project-urls` | `libs/urls/create-project-urls/` | `CreatProjectUrl` (the spelling is in the code) |
| `@proxy/urls/analytics-urls` | `libs/urls/analytics-urls/` | `AnalyticsUrls` (no `project.json`) |
| `@proxy/models/root-models` | `libs/models/root-models/` | `BaseResponse`, `IPaginatedResponse`, `IReqParams`, `ProxyBaseUrls` tokens, `IToken`, `errorResolver`, `IClient` |
| `@proxy/models/features-model` | `libs/models/features-model/` | `IFeature`, `IOAuthConfig`, `IBlockScope`, `FeatureServiceIds`, the `ProxyAuthScript` snippet builders |
| `@proxy/models/logs-models` | `libs/models/logs-models/` | `ILogsRes`, `IProjects`, `IEnvironments` |
| `@proxy/models/users-model` | `libs/models/users-model/` | `IUser`, `IClientData` |
| `@proxy/models/project-model` | `libs/models/project-model/` | typed `FormControl` shapes for project creation, `ICreateSource` |
| `@proxy/constant` | `libs/constant/` | the constants barrel, including `verification.ts` and `widget-events.ts` |
| `@proxy/constant/file-size` | `libs/constant/src/file-size/` | file-size constants (no importer at HEAD) |
| `@proxy/regex` | `libs/regex/` | about 70 regex constants (`EMAIL_REGEX`, `PASSWORD_REGEX`, `NAME_REGEX`, ...) |
| `@proxy/custom-validator` | `libs/custom-validator/` | `CustomValidators` (static validator functions) |
| `@proxy/utils` | `libs/utils/` | `IntlPhoneLib`, `removeEmptyKeys`, `downloadCSVFile`, crypto helpers, `generateJwtToken`, ... |
| `@proxy/ui/*` (14 aliases) | `libs/ui/*/` | components, see [UI libs](#ui-libs) |
| `@proxy/date-range-picker` | `libs/ui/date-range-picker/` | date range picker. The folder is under ui/, but the alias has no ui/ segment |
| `@proxy/pipes/*` | `libs/pipes/*/` | `ChartDateAdd`, `DecimalFormatter`, `FieldValuePipe`, `SafeURLPipe`, `TimeTokenPipe`, `replace`, `typeof` |
| `@proxy/directives/*` | `libs/directives/*/` | `RemoveCharacterDirective`, `skeleton`, `auto-select-dropdown`, `mark-all-as-touched` |

> [!WARNING]
> Both HTTP wrappers export a class named `HttpWrapperService`. Which one you get depends only on the alias you import. `libs/services/proxy/users/src/lib/services-proxy-users.module.ts` imports the no-auth one as `HttpWrapperServiceNoAuth`. Do the same when one file needs both.

## How a proxy service builds a URL

1. Each app provides injection tokens. `ProxyBaseUrls` in `libs/models/root-models/src/index.ts` is a string enum used as DI tokens: `BaseURL`, `ProxyLogsUrl`, `IToken`, `FirebaseConfig`, `Env`, `ClientURL`.
   - Dashboard (`apps/36-blocks/src/app/app.config.ts`): `BaseURL` and `ProxyLogsUrl` both get `environment.baseUrl`. `IToken` gets a mutable `{ token: null, companyId: null }` object.
   - Widget (`apps/36-blocks-widget/src/main.ts`): `BaseURL` and `ClientURL` get `environment.apiUrl + environment.msgMidProxy`. The widget provides no `IToken` and no `ProxyLogsUrl`. Values are in [environment](../environment.md).
2. A service injects the base URL with `@Inject(ProxyBaseUrls.BaseURL)`. `LogsService` injects `ProxyLogsUrl` instead.
3. It calls a URL builder from `libs/urls/`, for example `FeaturesUrls.oauthConfig(baseUrl, featureId, oauthConfigId)`. Every builder is a call to `libs/service/src/index.ts:createUrl`, which returns `` `${baseUrl}/${url}` ``.
4. Path params are filled in one of two ways. Template-literal builders take arguments (`FeaturesUrls`, `AnalyticsUrls`). Older builders return `:id` / `:referenceId` placeholders that the service replaces with `.replace(':id', id)` (`UsersUrl`, `LogsUrls.getLogsById`, `FeaturesUrls.getMethodService`). Some services append `/${id}` themselves (`FeaturesService.getFeatureDetails`, `CreateProjectService.updateProject`).
5. The service passes the absolute URL to `HttpWrapperService.get/post/put/patch/delete` and returns the Observable without changing it. Services never subscribe, map or catch. NgRx effects or component stores do that.

The widget follows the same pattern with its own URL file (`apps/36-blocks-widget/src/app/otp/service/urls/otp-urls.ts`, which uses `createUrl`). The dashboard billing page does too (`apps/36-blocks/src/app/panel/billing/billing.urls.ts`). The full endpoint list is in [api.md](../api.md).

`HttpWrapperService.createUrl` exists on both wrappers (same `${baseUrl}/${url}` result), but no lib service uses it. Use the URL-constant libs.

## HttpWrapper contract

`libs/services/http-wrapper/src/lib/services-http-wrapper.module.ts:HttpWrapperService` (with auth, dashboard only):

| Method | Signature | Notes |
|---|---|---|
| `get` | `(url, params?, options?)` | `params` goes to `options.params` (Angular HttpParams object form) |
| `post` | `(url, body, options?, addcontentType = true)` | `addcontentType` is accepted and ignored |
| `put` / `patch` | `(url, body, options?)` | |
| `delete` | `(url, params?, options?)` | `params` goes to `options.search`, which Angular ignores (see warning) |

Every call runs `prepareOptions`:

1. Start from `{ withCredentials: true, ...options }`, then merge over `cloneDeep(DEFAULT_OPTIONS)`. Defaults are `Accept: application/json`, `Content-type: application/json`, `Authorization: ''`. A caller `headers` object replaces the default headers completely, because the merge is shallow.
2. If `AuthService.getTokenSync()` returns a token and the caller did not pass `headers.Authorization`, set `Authorization` to the **raw token, with no `Bearer ` prefix**.
3. If headers contain `noHeader`, delete `Content-Type` and `noHeader`.
4. Convert headers to `HttpHeaders`. `withCredentials` is coerced to a boolean (true by default).

Return type is `Observable<any>`. The generic `T` is only a hint. The wrapper adds no retry, mapping or error handling. In the dashboard, errors come from `ErrorInterceptor`.

`libs/services/http-wrapper-no-auth/src/lib/services-http-wrapper-no-auth.module.ts:HttpWrapperService` is the same without step 2, and it has no `AuthService` dependency, so it works without Firebase or `IToken`. It pipes empty `tap`/`finalize` operators. The widget's `OtpService` passes its own `options` with `reference_id` / `proxy_auth_token` headers (see [widget-auth](./widget-auth.md)).

Multipart upload pattern: `FeaturesService.uploadLogo` passes `{ headers: {} }`. This drops the JSON `Content-type` so the browser can set the multipart boundary, while step 2 still adds `Authorization`.

> [!WARNING]
> `noHeader` never removes the default content type. The default key is `Content-type` (lowercase t) and the code deletes `Content-Type`. To drop it, pass your own `headers` object, as `uploadLogo` does.

> [!WARNING]
> `delete(url, params)` sends no query string. It puts `objectToParams(params)` on `options.search`, a leftover from the old `@angular/http` API that `HttpClient` ignores. Build the query into the URL yourself. No lib caller passes params at HEAD.

## Backend response envelope

Every proxy endpoint is typed as `BaseResponse<T, TRequest>` (`libs/models/root-models/src/index.ts`):

```ts
class BaseResponse<T, TRequest> {
    data: T;
    status: 'success' | 'fail';
    hasError: boolean;
    errors: string[] | string | { [key: string]: [] };   // any of the three shapes
    request?: TRequest;
    queryString?: any;
}
interface IPaginatedResponse<P> {          // usually the `data` of list endpoints
    data: P; itemsPerPage: number; pageNumber: number; pageNo?: number;
    totalEntityCount: number; totalEntityCountWithoutFilter?: number; totalPageCount: number;
}
```

A list call therefore reads `res.data.data`. Callers check `res.hasError` in `map` **and** handle the thrown error in `catchError`. `apps/36-blocks/src/app/core/ngrx/effects/root/root.effect.ts` is the reference pattern. `errorResolver(errors)` normalizes the three `errors` shapes into `string[]` for toasts.

> [!WARNING]
> A 200 can carry `hasError: true`. Always check `res.hasError` before reading `res.data`.

`MicroserviceBaseResponse` adds `success` and `message`. The analytics endpoints are typed `Observable<any>`.

## ErrorInterceptor (dashboard only)

`libs/services/interceptor/error-interceptor/src/lib/services-interceptor-error-interceptor.module.ts:ErrorInterceptor` is registered as a class-based `HTTP_INTERCEPTORS` provider in `apps/36-blocks/src/app/app.config.ts`, with `withInterceptorsFromDi()`. The widget registers no interceptor. It runs on **every** `HttpClient` request in the dashboard, not only wrapper calls.

1. **Gate.** The request passes only if its URL contains `api/register`, `api/googleLogin`, `api/login`, `api/onboarding` or `flow.sokt.io` (substring match), **or** the `authToken` cookie exists. Otherwise it returns `EMPTY`. The request is never sent, and the Observable completes with no value and no error.
2. **Retry.** `retry({ count: 1 })` re-sends once only when `status === 0` (network failure or CORS). Any other error goes straight to step 3.
3. **Map errors** (`HttpErrorResponse` only):

| Status | Effect | Thrown value |
|---|---|---|
| 401 | Deletes the `authToken` cookie, toasts `errors[0]` (or `'Session expired'`), calls `afAuth.signOut()`, navigates to `/` | `err.error` (raw body) |
| 422 | none | `err.error` |
| 500 | none | `{ errors: err.error.errors \|\| 'Internal server error', hasError: true }` |
| 403 | none (the redirect to `/app` is commented out, commit `96ee30d9`) | `{ errors, hasError: true, errorCode: 403 }` |
| 400, 429 | none | `{ errors, hasError: true, errorCode }` |
| 404 | none | string body: `{ errors: body \|\| 'Internal server error', hasError: true }`; object body: `{ errors, hasError: true, data, status }` |
| other (including 0 after the retry) | none | the original `HttpErrorResponse` |

So `catchError((err) => err.errors)` works for 400/403/404/429/500 and usually for 401/422, but not for status 0 or other codes.

> [!WARNING]
> A request without the `authToken` cookie, to a URL outside the allow-list, is dropped silently. `subscribe` gets only `complete`. A spinner waiting for `next` or `error` spins forever, and an effect emits nothing. A new public endpoint (for example a new sign-up step) must be added to the allow-list. This also covers non-API `HttpClient` calls, such as `VersionCheckService` polling version.json before login.

> [!WARNING]
> On 401 the interceptor deletes the cookie, but `IToken.proxyJWTToken` stays in memory. `HttpWrapperService` keeps attaching the old token until `AuthService.clearTokenSync()` runs or the page reloads. After the 401, the gate drops further requests anyway, because the cookie is gone.

## AuthService and LoginService

`libs/services/proxy/auth/src/lib/services-proxy-auth.module.ts:AuthService` holds the proxy JWT in two places: the shared `IToken` object (`proxyJWTToken`) and the `authToken` cookie (path `/`, 30-day expiry), set by `setTokenSync` and removed by `clearTokenSync`. `getTokenSync` reads memory only. The cookie is read by the interceptor gate and by the dashboard guards and initializer (see [app-shell](./app-shell.md)). `getToken()` / `fetchActiveToken()` return the Firebase ID token (`IToken.token`), which is a separate value.

`LoginService.googleLogin(idToken)` posts to `${baseUrl}/googleLogin` with the Firebase ID token as `Authorization`. `logout()` sends `DELETE ${baseUrl}/logout`.

> [!WARNING]
> `googleLogin` uses `Object.assign({}, DEFAULT_OPTIONS)`, a shallow copy, then sets `options.headers.Authorization`. This **mutates the exported `DEFAULT_OPTIONS.headers`**. From then on, any wrapper call made while `getTokenSync()` is empty sends the Firebase ID token as `Authorization`. Commit `c8452766` ("Fix: logout Authorization issue") added `cloneDeep` to `prepareOptions` for this kind of leak, but this call site still mutates the shared object. Do not copy the pattern. Pass a fresh `{ headers: { Authorization } }` instead.

## BaseComponent

`libs/ui/base-component/src/lib/base-component/base.component.ts:BaseComponent` is an abstract `@Component({ standalone: false, template: '' })` base class. 23 components in `apps/` extend it, in both apps.

- `destroy$`: a lazily created `Subject`. `ngOnDestroy` emits on it and completes it. Use `.pipe(takeUntil(this.destroy$))` for subscriptions.
- `makeFormDirty(form)`: recursively marks every control as touched, so validation messages show.
- `onlyNumber(event)`: keypress filter based on `ONLY_INTEGER_REGEX`.
- `getValueFromObservable(obs)`: synchronous `take(1)` read, for store selectors.
- `goBackToHistory(redirectTo?)`: navigates to `redirectTo` with `Router`, else calls `Location.back()`.
- `hasUnsavedData()` / `_hasUnsavedData`: a flag that subclasses set.

> [!WARNING]
> If a subclass overrides `ngOnDestroy`, it must call `super.ngOnDestroy()`. Otherwise `destroy$` never fires and every `takeUntil(this.destroy$)` subscription leaks.

## Constants: `libs/constant/src/verification/verification.ts` (hot file)

This file is the contract between the dashboard and the widget. 14 commits have touched it since 2026-03, most recently `c38eea4a` (OAuth `auth2`).

- `WidgetConfig`: the shape of the `initVerification(config)` argument. Keys: `referenceId`, `authToken`, `type`, `authType`, `theme`, `isPreview`, `redirect_path`, `success`, `failure`, among others. The widget reads it in `apps/36-blocks-widget/src/app/init-verification.ts`. The dashboard builds it for the preview and code snippet under `apps/36-blocks/src/app/panel/features/create-feature/feature-preview/widget-preview/`.
- `PublicScriptType`: `authorization`, `user-profile`, `user-management`, `organization-details`, `subscription`, `oauth2`. It selects which widget screen mounts.
- `WidgetAuthType` (`authorization` | `auth2`), `WidgetTheme` (`system` | `light` | `dark`), `PROXY_DOM_ID` (`userProxyContainer`), `VERIFICATION_STATUS`, `VERIFICATION_MODE`.

`libs/constant/src/widget-events.ts:WidgetEvent` holds window event names (`OpenInviteMemberDialog = 'openAddUserDialog'`). Host pages dispatch these. The event list is in [api.md](../api.md).

> [!WARNING]
> Values of `PublicScriptType`, `WidgetAuthType` and `WidgetTheme` are public API. Customers write them in embed snippets (`libs/models/features-model/src/index.ts:ProxyAuthScript`, `ProxyUserManagementScript`). Renaming a value breaks live integrations. Add new values; do not rename existing ones.

Much of the rest of the constant lib has no importer in `apps/` at HEAD: `smsURLs`, the socket and Telegram enums, `DEBOUNCE_TIME`, `INTL_INPUT_OPTION`, `MICRO_SERVICE_MAPPING_KEYS`, and the files `jitsi-calling.ts` and `mat-icon.ts`. Constants that apps do use include `PAGE_SIZE_OPTIONS`, `DEFAULT_SELECTED_DATE_RANGE`, `DEFAULT_END_DATE` and `INFO_TOOLTIPS`. Grep before deleting anything; libs may import it too.

> [!WARNING]
> `TODAY`, `DEFAULT_END_DATE` and similar constants are computed once at module load. A tab left open overnight still uses yesterday's date. Use `new Date()` at the call site when the exact time matters.

## Validators, regex, utils

- `libs/custom-validator/src/index.ts:CustomValidators`: static `ValidatorFn`s (`noWhitespaceValidator`, `MustMatch`, `validUrl`, `minSelected`, `elementExistsInList`, ...). Used in both apps.
- `libs/regex/src/index.ts`: some exports are `RegExp` literals and some are **strings** (`COMMA_SEPARATED_URLS_REGEX`, `RCS_PHONE_NUMBER_REGEX`, `DECIMAL_VALUE_REGEX`, ...). `Validators.pattern` accepts both, but `.test()` exists only on the literals. Name and company validation share `NAME_REGEX` / `COMPANY_NAME_REGEX` (commit `3cf435a0`).
- `libs/utils/src/index.ts`: general helpers. `IntlPhoneLib` wraps intl-tel-input for phone fields. `crypto.ts` has AES/SHA helpers. `extractParentDomain` depends on `@proxy/ui/handle-domain`.

## UI libs

The component inventory with inputs and usage is in [docs/ui/components.md](../ui/components.md). One line each:

| Alias | Purpose |
|---|---|
| `@proxy/ui/base-component` | the abstract base class above |
| `@proxy/ui/prime-ng-toast` | `PrimeNgToastService` (`success`/`error`/`warn`/`info` Subjects) plus the toast host component |
| `@proxy/ui/confirm-dialog` | confirmation `MatDialog` |
| `@proxy/ui/copy-button` | standalone copy-to-clipboard button (signal inputs) |
| `@proxy/ui/loader` | spinner |
| `@proxy/ui/no-record-found` | empty-state block |
| `@proxy/ui/search` | debounced search input |
| `@proxy/ui/mat-paginator-goto` | `MatPaginator` with a go-to-page box |
| `@proxy/ui/service-list` | service list for features |
| `@proxy/ui/virtual-scroll` | CDK virtual scroll wrapper |
| `@proxy/date-range-picker` | date range picker |
| `@proxy/ui/handle-domain` | public-suffix domain parser (used by `@proxy/utils`) |
| `@proxy/ui/player`, `@proxy/ui/angular-mentions` | no importer in `apps/` at HEAD |

## Which app uses what

| Lib group | Dashboard `apps/36-blocks` | Widget `apps/36-blocks-widget` |
|---|---|---|
| `@proxy/services/httpWrapper`, `interceptor/errorInterceptor`, `login`, `proxy/*` | yes | **no**: they depend on `AngularFireAuth` and `IToken`, which the widget does not provide |
| `@proxy/services/http-wrapper-no-auth` | indirectly, through `UsersService.register/emailLogin/submitOnboarding` | yes (`OtpService`) |
| `@proxy/service` | `VersionCheckService`, `createUrl` | `createUrl` |
| `@proxy/models/*` | all | `root-models`, `features-model` |
| `@proxy/constant`, `@proxy/regex`, `@proxy/custom-validator`, `@proxy/utils` | yes | yes |
| `@proxy/ui/base-component`, `@proxy/ui/prime-ng-toast` | yes | yes |
| other `@proxy/ui/*`, `@proxy/date-range-picker`, `@proxy/directives/skeleton`, `RemoveCharacterDirective` | yes | no |
| `@proxy/pipes/*`, `auto-select-dropdown`, `mark-all-as-touched`, `@proxy/constant/file-size` | no direct import at HEAD (`DecimalFormatter` imports `FieldValuePipe`) | no |

> [!WARNING]
> Never import a `@proxy/services/proxy/*` service, `@proxy/services/httpWrapper` or `@proxy/services/login` into the widget. They inject `AngularFireAuth` and `ProxyBaseUrls.IToken`, which the widget does not provide, so DI fails at runtime. They would also pull Firebase into the single-file widget bundle. Write a widget-local service on `@proxy/services/http-wrapper-no-auth` instead.

> [!WARNING]
> `libs/services/proxy/analytics/src/lib/analytics.service.ts` imports its param types from `apps/36-blocks/src/app/panel/dashboard/dashboard.models.ts` (commit `5f792158` moved them there). This is a lib-to-app dependency. Do not import `AnalyticsService` into the widget, and do not copy this pattern. Shared types belong in `libs/models/`.

## Why it is built this way

- **Two wrappers instead of one with a flag.** The widget runs inside customer pages with no Firebase and no dashboard session. Its auth is per request (`reference_id` / `proxy_auth_token` headers), so a wrapper that needs `AuthService` cannot be injected there.
- **Raw `Authorization` header with no `Bearer`.** The backend expects it this way. The dashboard also reads the same raw token from the cookie.

  > [!TODO] Needs a human: confirm the proxy backend rejects a `Bearer `-prefixed token, before anyone "fixes" this.

- **Interceptor gate on the cookie.** It stops calls from firing on public pages and after logout, without changing every caller. The retry on status 0 was added in `0f36df9f` (PR #640 "retry-login-intercepter") for flaky first requests during login.
- **Standalone everywhere.** Commit `c57216c8` removed every shim NgModule from libs. File names like `services-http-wrapper.module.ts` are historical and contain no NgModule. Lib components are imported directly into standalone components.

## Changing it safely

- **New endpoint:** add a builder to the right `libs/urls/*/src/index.ts` (use `createUrl` with template-literal params), add a method to the matching `libs/services/proxy/` service that returns `this.http.<verb><BaseResponse<T, void>>(...)`, and put the types in `libs/models/`. Handle `hasError` and `catchError` in the effect or store. Update [api.md](../api.md).
- **New lib:** create `libs/<group>/<name>/src/index.ts`, add the alias to `tsconfig.base.json` `paths`, and add a `project.json` if Nx should lint or test it.
- **Endpoint called before login:** add its path to the `ErrorInterceptor` allow-list, or the request is silently dropped.
- **`verification.ts` / `WidgetConfig`:** change it with both apps in mind. Build both (`nx build 36-blocks`, `nx build 36-blocks-widget`) and check the preview snippet under `apps/36-blocks/src/app/panel/features/create-feature/feature-preview/widget-preview/`.
- **Wrapper or interceptor:** every dashboard call goes through them. Check login (Google and email), a 401 (session expiry toast and redirect to `/`), the logo upload (multipart) and a list page.
