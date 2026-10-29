---
covers: ["apps/36-blocks-widget/src/app/init-verification.ts", "apps/36-blocks-widget/src/main.ts", "apps/36-blocks-widget/src/app/otp/service/otp.service.ts", "apps/36-blocks-widget/src/app/otp/service/urls/**", "apps/36-blocks-widget/src/app/otp/service/user-management-bridge.service.ts", "libs/constant/src/widget-events.ts", "libs/urls/**", "libs/services/proxy/**", "libs/services/login/**", "apps/36-blocks/src/app/panel/billing/billing.urls.ts", "apps/36-blocks/src/app/panel/billing/billing.service.ts", "apps/36-blocks/src/app/app.config.ts"]
verified_at: 395659d5
verified_on: 2026-10-29
---
# API

This repo is two Angular front ends. It serves no HTTP routes. Its external surface has two parts:

1. **Widget contract for host pages.** Customer sites load proxy-auth.js and talk to it through `window.initVerification(config)`, the `<proxy-auth>` custom element, callbacks and window events. This doc is the home of that contract. Module docs link here.
2. **Backend calls.** Both apps call a backend that lives in another repo (the "proxy" API on msg91.com hosts). Every call is listed below, grouped by service and base URL.

The dashboard's own Angular route table is in [ui/routes.md](./ui/routes.md).

## Widget public API (host page → widget)

### Loading
The admin panel's snippet (`libs/models/features-model/src/index.ts:ProxyAuthScript`, `ProxyAuthScriptUrl`) loads `<proxyServer>/assets/proxy-auth/proxy-auth.js` and calls `initVerification` in the script's `onload`. `proxyServer` comes from the dashboard environment (see [environment](./environment.md)). Bundle build and loading details are in [widget-embed](./modules/widget-embed.md).

```html
<div id="REFERENCE_ID"></div>   <!-- type 'authorization': container id = referenceId -->
<div id="userProxyContainer"></div>  <!-- every other type: container id = PROXY_DOM_ID -->
<script>var configuration = { referenceId: 'REFERENCE_ID', success: fn, failure: fn };</script>
<script src="https://<proxyServer>/assets/proxy-auth/proxy-auth.js" onload="initVerification(configuration)"></script>
```

### `window.initVerification(config)`
Defined once in `apps/36-blocks-widget/src/app/init-verification.ts` (`if (!window.initVerification)`). The config keys are the assignments to `widgetElement` in that file. `WidgetConfig` in `libs/constant/src/verification/verification.ts` is only a partial type.

| Key | Required | Default | Effect |
|---|---|---|---|
| `type` | no | `'authorization'` (set when missing) | One of `PublicScriptType`: `authorization`, `user-profile`, `user-management`, `organization-details`, `oauth2`. `subscription` is deprecated and fails validation. An invalid value only logs `console.error`. |
| `referenceId` | for `authorization` | — | Feature/widget public id from the dashboard. Also the container div id for `authorization`. Sent in the URL of `POST /:referenceId/widget`. |
| `authToken` | for `user-profile`, `user-management`, `organization-details` | — | Logged-in end-user token. Sent as the `proxy_auth_token` header. Missing → `console.error` only. |
| `success` | **yes** | — | Function. Not a function → `throw Error('success callback function missing !')`. |
| `failure` | no | — | Function. Called only if it is a function. |
| `authType` | no | `'authorization'` | `WidgetAuthType`: `authorization` or `auth2` (OAuth 2.0 consent). |
| `theme` | no | system | `'system'`, `'light'` or `'dark'`. |
| `target` | no | `'_self'` | Link target for redirects. |
| `version` | no | — | `WidgetVersion` (`v1`/`v2`); v2 renders the inline password form. |
| `isRegisterFormOnly` | no | `false` | Also turned on by `?isRegisterFormOnly=true` in the host URL. |
| `redirect_path` | no | — | Moved to `otherData.addInfo.redirect_path` (admin preview only). |
| `showCompanyDetails`, `userToken`, `isRolePermission`, `isPreview`, `isLogin`, `openEditProfile`, `loginRedirectUrl`, `input_fields`, `show_social_login_icons`, `exclude_role_ids`, `include_role_ids` | no | — | Copied to the element's inputs. `exclude_role_ids` / `include_role_ids` filter the user-management member list. |
| anything else | no | — | Ends up in `otherData` (see below). |

`initFn` mounts only if `referenceId || authToken || showCompanyDetails` is set. Otherwise it throws `Reference Id is missing!`.

**`RESERVED_KEYS` and `otherData`.** `RESERVED_KEYS` is `['referenceId', 'target', 'style', 'success', 'failure', 'authType']`. The element gets `otherData = { ...paramsData, ...omit(config, RESERVED_KEYS) }`. `paramsData` comes from the host URL query: `first_name` → `firstName`, `last_name` → `lastName`, `email`, `signup_service_id` → `signupServiceId`. Config keys win over query params. `otherData` becomes the request body of `POST /:referenceId/widget`, so any key not in `RESERVED_KEYS` (including `type`, `theme`, `authToken`) is sent to the backend.

> [!WARNING]
> `initVerification` runs its work inside `setTimeout` or `DOMContentLoaded`. Both throws (`Reference Id is missing!`, `success callback function missing !`) are uncaught errors on the host page. A host `try/catch` around the call never sees them.

> [!WARNING]
> If the container div is not in the DOM yet, the widget waits for it with a `MutationObserver` plus a 150 ms interval, for up to 30 s. After that it logs `Container element with id="…" was not found` and gives up. A second call removes only the first `proxy-auth` element in the document, then mounts a new one.

### Custom element `<proxy-auth>`
Defined in `apps/36-blocks-widget/src/main.ts` from `ProxyAuthWidgetComponent` (`apps/36-blocks-widget/src/app/otp/widget/widget.component.ts`). Hosts should not create it by hand: `initVerification` sets non-attribute properties on it (`successReturn`, `failureReturn`, `otherData`). Never rename the tag; host pages and the admin preview query it by name.

### Callbacks (widget → host)
`successReturn` and `failureReturn` on `ProxyAuthWidgetComponent` hold `config.success` / `config.failure`.

| Call | When | Argument |
|---|---|---|
| `success(res)` | password login succeeds without a `redirect_url` (`ProxyAuthWidgetComponent.returnSuccessObj`) | raw `POST /c/login` response body |
| `success(res)` | MSG91 OTP widget succeeded and `callbackUrl` answered (`ProxyAuthWidgetComponent.hitCallbackUrl`) | raw callback response. If it has `data.redirect_to`, the widget navigates there after 100 ms. |
| `failure(err)` | password login HTTP error other than the 403 "open registration" case | `HttpErrorResponse` |
| (none) | user closes the login or register dialog | Nothing is sent. `LoginComponent.close(true)` / `RegisterComponent.close(true)` would send `{ code: 0, closeByUser: true, message: 'User cancelled the …' }`, but nothing calls them at this commit; the X button and Esc end in `closeOverlayDialog()`. See [widget-verification](./flows/widget-verification.md). |

Login or register responses that carry `data.redirect_url` navigate the page (`window.location.href`) instead of calling `success`. The account screens (`user-profile`, `user-management`, `organization-details`) never call `success` / `failure`; see [widget-account](./modules/widget-account.md#what-each-screen-sends-back-to-the-host).

### Window events
| Direction | Event | `detail` | Code |
|---|---|---|---|
| host → widget | `openAddUserDialog` (`WidgetEvent.OpenInviteMemberDialog` in `libs/constant/src/widget-events.ts`) | `{ authToken: string, theme?: 'dark' \| 'light' \| 'system' }` | `apps/36-blocks-widget/src/app/otp/service/user-management-bridge.service.ts:UserManagementBridgeService` |
| widget → host | `organizationDetailsUpdateResponse` (`bubbles`, `composed`, dispatched on `window`) | `{ data: res.data, error: false }` or `{ data: error.error.errors ?? error.error ?? error, error: true }` | `apps/36-blocks-widget/src/app/otp/organization-details/organization-details.component.ts:OrganizationDetailsComponent` |
| widget → host | `window.parent.postMessage({ type: 'proxy', data: { event: 'userNameUpdated' \| 'userLeftCompany', … } }, '*')` | — | user-profile screen; see [widget-account](./modules/widget-account.md#what-each-screen-sends-back-to-the-host) |

```js
window.dispatchEvent(new CustomEvent('openAddUserDialog', { detail: { authToken: 'TOKEN', theme: 'dark' } }));
window.addEventListener('organizationDetailsUpdateResponse', (e) => console.log(e.detail.error, e.detail.data));
```

`openAddUserDialog` can fire before the bundle bootstraps Angular. `init-verification.ts` buffers early events in `window.__proxyAuth.pendingDialogEvents`, and `UserManagementBridgeService` replays only the last one. If the user-management screen is mounted, the event goes to it. Otherwise a standalone add-user dialog opens. Details: [widget-embed](./modules/widget-embed.md#window-events-and-callbacks).

Globals the bundle sets: `window.initVerification`, `window.__proxyAuthLoaded`, `window.__proxyAuth` (`version`, `buildTime`, `pendingDialogEvents`, `inlinedStyles`), `window.libLoaded`.

## Backend calls: shared conventions

| App | Base URL token → value | HTTP wrapper | Auth |
|---|---|---|---|
| dashboard `36-blocks` | `ProxyBaseUrls.BaseURL` and `ProxyBaseUrls.ProxyLogsUrl` → `environment.baseUrl` (`apps/36-blocks/src/app/app.config.ts`) | `@proxy/services/httpWrapper` (`HttpWrapperService` in `libs/services/http-wrapper/`) | `Authorization: <JWT>` from `AuthService.getTokenSync()` (the `authToken` cookie). `withCredentials: true`. |
| widget `36-blocks-widget` | `ProxyBaseUrls.BaseURL` and `ProxyBaseUrls.ClientURL` → `environment.apiUrl + environment.msgMidProxy` (`apps/36-blocks-widget/src/main.ts`) | `@proxy/services/http-wrapper-no-auth` | No `Authorization` (except timezones). `reference_id` or `proxy_auth_token` headers set by `OtpService`. `withCredentials: false`. |

URL builders live in `libs/urls/**`, `apps/36-blocks-widget/src/app/otp/service/urls/otp-urls.ts` and `apps/36-blocks/src/app/panel/billing/billing.urls.ts`. Each is `createUrl(baseUrl, 'path')` → `${baseUrl}/path`; `:id` / `:referenceId` placeholders are filled with `.replace()` in the service. Paths below are relative to the base URL.

Responses use the `BaseResponse` envelope from `libs/models/root-models/src/index.ts`: `{ data, status: 'success' | 'fail', hasError, errors, request?, queryString? }`. Lists use `IPaginatedResponse`: `{ data, itemsPerPage, pageNumber, totalEntityCount, totalPageCount }`. More in [shared-libs](./modules/shared-libs.md#backend-response-envelope).

> [!WARNING]
> In the dashboard, `ErrorInterceptor` drops (returns `EMPTY` for) every request made without the `authToken` cookie, unless the URL contains `api/register`, `api/googleLogin`, `api/login`, `api/onboarding` or `flow.sokt.io`. A new public endpoint must be added to that allow-list. Status mapping is in [shared-libs](./modules/shared-libs.md#errorinterceptor-dashboard-only). The widget has no interceptor.

> [!WARNING]
> A 200 can carry an error. Check `hasError` / `status` on the body, not only the HTTP status.

## Dashboard: auth and session
`LoginService` (`libs/services/login/src/lib/services-login.module.ts`) and `UsersService` (`libs/services/proxy/users/src/lib/services-proxy-users.module.ts`). Base `environment.baseUrl`.

| Method | Path | Auth | Service method | Caller | Request → response read |
|---|---|---|---|---|---|
| POST | `/googleLogin` | `Authorization: <Firebase ID token>` | `LoginService.googleLogin` | `LogInEffects.authenticatedAction$` | `{}` → `data.auth` (JWT, stored with `setTokenSync`) |
| DELETE | `/logout` | JWT | `LoginService.logout` | `LogInEffects.logoutActionComplete$` | — |
| POST | `/login` | none (no-auth wrapper) | `UsersService.emailLogin` | `LogInEffects.emailLogin$` | `{ email, password }` (plain) → `data.token`, `data.is_onboarding_pending` |
| POST | `/register` | none | `UsersService.register` | `RegistrationEffects.registrationSubmit$` | form payload (includes `email`) |
| POST | `/onboarding` | none | `UsersService.submitOnboarding` | `apps/36-blocks/src/app/panel/onboarding/onboarding.component.ts:OnboardingComponent` | `{ user: { name, mobile }, client: { name, mobile }, onboarding_token? }` → `data.token` |

> [!WARNING]
> `logoutActionComplete$` calls `clearTokenSync()` (deletes the cookie) and sets `window.location.href = '/'` before it calls `DELETE /logout`. With the cookie gone, `ErrorInterceptor` returns `EMPTY` for `/logout`, so the backend logout request is never sent.

## Dashboard: client, projects, logs, analytics
Base `environment.baseUrl`; all with the JWT `Authorization` header.

| Method | Path | Service method (file) | Caller |
|---|---|---|---|
| GET | `/getClientSettings` | `RootService.getClientSettings` (`libs/services/proxy/root/src/lib/services-proxy-root.module.ts`) | `apps/36-blocks/src/app/core/ngrx/effects/root/root.effect.ts:RootEffects` |
| GET | `/clients` | `RootService.getClients` (query params) | `RootEffects` |
| POST | `/switchclient` | `RootService.switchClient` body `{ client_id }` | `RootEffects` |
| GET | `/generateToken` | `RootService.generateToken` params `{ source: 'chatbot' }` → `data.jwt` | `apps/36-blocks/src/app/panel/layout/layout.component.ts:LayoutComponent` |
| GET | `/projects` | `RootService.getProjects`, `LogsService.getProjects` | `RootEffects`, `apps/36-blocks/src/app/panel/logs/log/logs.store.ts` |
| POST | `/projects` | `CreateProjectService.createProject` (`libs/services/proxy/create-project/src/lib/services-proxy-create-project.module.ts`) | `apps/36-blocks/src/app/panel/create-project/create-project.store.ts` |
| PUT | `/projects/:id` <!-- verify:ignore --> | `CreateProjectService.updateProject` | create-project store |
| GET | `/environments` | `CreateProjectService.getEnvironments`, `LogsService.getEnvironments` | create-project store, logs store |
| GET | `/clients` (`CreatProjectUrl.getClient`) | `CreateProjectService.getClientData` | create-project store |
| POST | `/sourceDomains` | `CreateProjectService.createSource` | create-project store |
| GET | `/proxyLogs` | `LogsService.getProxyLogs` (`libs/services/proxy/logs/src/lib/services-proxy-logs.module.ts`) | logs store |
| GET | `/proxyLogs/:id` | `LogsService.getProxyLogsById` | logs store |
| GET | `/analytics/overview` | `AnalyticsService.getOverview` (`libs/services/proxy/analytics/src/lib/analytics.service.ts`) | `apps/36-blocks/src/app/panel/dashboard/dashboard.component.ts` |
| GET | `/analytics/timeseries` | `AnalyticsService.getTimeseries` | `apps/36-blocks/src/app/panel/dashboard/timeseries-chart/timeseries-chart.component.ts` |
| GET | `/analytics/breakdown` | `AnalyticsService.getBreakdown` | `apps/36-blocks/src/app/panel/dashboard/breakdown-chart/breakdown-chart.component.ts` |

`LogsService` uses the `ProxyLogsUrl` token, which is also `environment.baseUrl`.

## Dashboard: users, roles, permissions (admin side)
`UsersService` (`libs/services/proxy/users/src/lib/services-proxy-users.module.ts`), JWT auth. Caller: `apps/36-blocks/src/app/panel/users/user/user.store.ts`. The service takes `referenceId` (and `id`) from the payload, puts them in the path and deletes them from the body.

| Method | Path | Service method |
|---|---|---|
| GET | `/clientUsers` | `getUsers` |
| GET / POST | `/:referenceId/cRoles` | `getRoles` / `createRole` |
| PUT / DELETE | `/:referenceId/cRoles/:id` | `updateRole` / `deleteRole` |
| GET / POST | `/:referenceId/cPermission` | `getPermissions` / `createPermission` |
| PUT / DELETE | `/:referenceId/cPermission/:id` | `updatePermission` / `deletePermission` |

## Dashboard: features (blocks) configuration
`FeaturesService` (`libs/services/proxy/features/src/lib/services-proxy-features.module.ts`), JWT auth, base `environment.baseUrl`. Callers: `apps/36-blocks/src/app/panel/features/create-feature/create-feature.store.ts`, `apps/36-blocks/src/app/panel/features/feature/feature.store.ts`, `apps/36-blocks/src/app/panel/features/oauth-config/oauth-config.store.ts`, `apps/36-blocks/src/app/panel/features/client-secrets/client-secrets.store.ts`, plus `LayoutComponent`, `DashboardComponent` and the users store (feature lists). Field-level details are in [panel-features](./modules/panel-features.md).

<!-- verify:ignore-start -->
| Method | Path | Service method |
|---|---|---|
| GET / POST | /features | `getFeature` (list) / `createFeature`, `createLagoFeature` |
| GET / PUT | /features/:id | `getFeatureDetails` / `updateFeature` |
| GET | /getFeatures | `getFeatureType` |
| GET | /getMethodsService/:id | `getMethodService` |
| POST | /features/:id/upload-logo | `uploadLogo` (FormData) |
| GET | /features/:id/allowedOrigins | `getAllowedOrigins` |
| GET / POST | /features/:featureId/oauthConfigs | `getOauthConfigs` / `createOauthConfig` |
| GET / PUT / DELETE | /features/:featureId/oauthConfigs/:oauthConfigId | `getOauthConfig` / `updateOauthConfig` / `deleteOauthConfig` |
| POST | /features/:featureId/oauthConfigs/:oauthConfigId/regenerateSecret | `regenerateOauthSecret` |
| POST | /features/:featureId/oauthConfigs/:oauthConfigId/disable | `disableOauthConfig` |
| GET / POST | /features/:featureId/clientSecrets | `getClientSecrets` / `createClientSecret` (plaintext `client_secret` only in this response) |
| DELETE | /features/:featureId/clientSecrets/:secretId | `revokeClientSecret` (revokes; the secret stays listed with `revoked_at`) |
| GET / POST | /features/:featureId/blockScopes | `getBlockScopes` / `createBlockScope` |
| PUT / DELETE | /features/:featureId/blockScopes/:blockScopeId | `updateBlockScope` / `deleteBlockScope` |
| GET / POST | /subscription/:refId/billableMetrics | `getAllBillableMetrics` / `createBillableMetric` |
| PUT / DELETE | /subscription/:refId/billableMetrics/:code | `updateBillableMetric` / `deleteBillableMetric` |
| GET | /getBillableMetricForm | `getBillableMetricForm` |
| GET / POST | /subscription/:refId/plans | `getPlansForm`, `getAllPlans` / `createPlan` |
| PUT / DELETE | /subscription/:refId/plans/:code | `updatePlan` / `deletePlan` |
| GET / POST | /subscription/:refId/taxes | `getTaxes` / `createTax` |
| DELETE | /subscription/:refId/taxes/:code | `deleteTax` |
| GET | /paymentCredentialsForm | `getPaymentDetailsForm` |
| GET | /:refid/paymentForm | `getPaymentDetailsFormById` |
| POST | /subscription/:refid/updateCredentials | `updatePaymentDetails` |
| GET | /getWebhookTriggerEvents | `getWebhookEvents` |
<!-- verify:ignore-end -->

These paths are built from template strings in `libs/urls/features-url/src/index.ts:FeaturesUrls` (and `/features/:id` by string concatenation in the service), so they are not literal in code.

## Dashboard: billing
`BillingService` (`apps/36-blocks/src/app/panel/billing/billing.service.ts`), JWT auth, base `environment.baseUrl`. Caller: `apps/36-blocks/src/app/panel/billing/billing.store.ts`. Types: `apps/36-blocks/src/app/panel/billing/billing.models.ts`.

| Method | Path | Service method | Body → response read |
|---|---|---|---|
| GET | `/v1/billing/plans` | `getPlans` | → `IBillingPlan[]` |
| GET | `/v1/billing/plans/:planCode` <!-- verify:ignore --> | `getPlanByCode` | `planCode` is `encodeURIComponent`-ed |
| GET | `/v1/billing/subscription/status` | `getSubscriptionStatus` | → `IBillingSubscriptionStatus` |
| GET | `/v1/billing/subscription/usage` | `getSubscriptionUsage` | → `IBillingSubscriptionUsage` |
| POST | `/v1/billing/customer` | `createCustomer` | `{}` |
| POST | `/v1/billing/subscription/upgrade` | `upgradeSubscription` | `{ plan_code }` → `IBillingUpgradeResponse` (may carry `checkout_url`) |
| POST | `/v1/billing/customer/checkout-url` | `addPaymentMethod` | `{}` → `checkout_url` |
| GET | `/v1/billing/customer/payment-methods` | `getPaymentMethods` | → `IBillingPaymentMethodsResponse` |
| POST | `/v1/billing/customer/default-payment-method` | `setDefaultPaymentMethod` | `{ payment_method_id }` |

## Dashboard: calls outside the backend
| Method | URL | Caller | Notes |
|---|---|---|---|
| POST | `CONTACT_WEBHOOK_URL` (a `flow.sokt.io` function, hard-coded) | `apps/36-blocks/src/app/website/contact/contact.component.ts:ContactComponent` | `Content-Type: text/plain`, body `JSON.stringify({ name, email, category, subject, message, submittedAt, environment, sourceUrl })` |
| POST | user-entered webhook URL | `apps/36-blocks/src/app/panel/features/create-feature/create-feature.component.ts:CreateFeatureComponent.copySampleResponse` | sends the sample webhook payload; result ignored |
| GET | `environment.proxyServer + '/version.json?t=…'` | `libs/service/src/lib/version-check/version-check.service.ts:VersionCheckService` | file written by `tools/postbuild.js`; not called when `env === 'local'` |

## Widget: login, register, OTP
`OtpService` (`apps/36-blocks-widget/src/app/otp/service/otp.service.ts`), URLs from `otpVerificationUrls`. Base `ProxyBaseUrls.BaseURL` = `environment.apiUrl + environment.msgMidProxy`. Flow details: [widget-auth](./modules/widget-auth.md).

| Method | Path | Auth header | Service method ← caller | Request → response read |
|---|---|---|---|---|
| POST | `/:referenceId/widget` | `reference_id` in path | `getWidgetData` ← `OtpEffects.getWidgetData$` | `otherData` (+ `state` for `auth2`) → `data.ciphered` (AES, decrypted with `AUTH_API_*` keys) |
| GET | `/oauth/authorize` | none | `getOauthAuthorize` ← `ProxyAuthWidgetComponent` (OAuth mode) | host page query params |
| POST | `/oauth/authorize/decision` | `proxy_auth_token` | `postOauthAuthorizeDecision` | consent payload → `data.redirect_to` |
| POST | `/otp/send` | `reference_id` or `proxy_auth_token`, plus `origin` | `sendOtp` ← `OtpEffects.getOtp$` | `{ identifier }` |
| POST | `/otp/retry` | same | `retryOtp` ← `OtpEffects.getOtp$` (`useRetry`) | `{ identifier }` |
| POST | `/otp/verify` | same | `verifyOtpV2` ← `OtpEffects.verifyOtpV2$` | `{ identifier, otp }` → `data.otp_verification_token` |
| POST | `/c/register?action=redirect` | none | `register` ← `RegisterComponent.submit` | `{ proxy_state, state, email_otp_verification_token?, mobile_otp_verification_token? }` → `data.redirect_url` |
| POST | `/c/login` | none | `login` ← `LoginComponentStore`, `ProxyAuthWidgetComponent` | `{ state, user, password (AES), hCaptchaToken }`; 403 → widget opens registration |
| POST | `/c/resetPassword` | none | `resetPassword` | `{ state, user }` |
| POST | `/c/verifyResetPassword` | none | `verfyResetPasswordOtp` | `{ state, user, password (AES), otp }` |
| GET | `otpWidgetData.callbackUrl` (from widget config) | none | `callBackUrl` ← `ProxyAuthWidgetComponent.hitCallbackUrl` | `{ state, code }` query |
| POST | `/widget/retryOtp`, `/widget/verifyOtp` | none | `resendOtpService`, `verifyOtpService` | legacy; effects exist but no screen dispatches them |

## Widget: account screens (logged-in end user)
Same `OtpService`, base `ProxyBaseUrls.ClientURL` (same value as `BaseURL`). Every call sets `proxy_auth_token: <authToken>` on the shared `options.headers`. Callers are `OtpEffects` (`apps/36-blocks-widget/src/app/otp/store/effects/otp.effects.ts`) unless noted. Screen behaviour: [widget-account](./modules/widget-account.md).

| Method | Path | Service method | Request |
|---|---|---|---|
| GET | `/c/getDetails` | `getUserDetailsData`; `getOrganizationDetails` (`OrganizationDetailsComponent`) | org screen sends `{ fields: 'currentCompany' }` |
| GET | `/timezones` | `getTimezones` (`OrganizationDetailsComponent`) | **`Authorization: <authToken>`**, not `proxy_auth_token` |
| PUT | `/c/updateCompany` | `updateCompany` (`OrganizationDetailsComponent`) | `{ company: { name, email, mobile, timezone, timeZoneName } }` |
| POST | `/c/inviteAction/leave` | `leaveCompanyUser` | `{ company_id }` |
| PUT | `/c/updateUser` | `updateUser`, `updateCompanyUser` | `{ user: { name, mobile? }, otp_verification_token? }` |
| POST | `/c/addUser` | `addUser` | add-user form payload |
| GET | `/c/getCompanyUsers` | `getCompanyUsers` | query `itemsPerPage`, `pageNo` (1-based), `search`, `exclude_role_ids`, `role_ids` (from `include_role_ids`) |
| DELETE | `/c/removeUser/:id` | `deleteUser` | `:id` is the member's `user_id` |
| PUT | `/c/updateCUserRole/:id` | `updateUserRole` | payload |
| PUT | `/c/updateCUserPermissions/:id` | `updateUserPermission` | payload |
| GET / POST | `/c/roles` | `getRoles` / `createRole` | POST `{ name, cPermissions }` |
| PUT | `/c/roles/:id` | `updateRole` | payload |
| GET / POST | `/c/permission` | `getPermissions` / `createPermission` | POST `{ name }` |
| PUT | `/c/permission/:id` | `updatePermission` | `{ name }` |
| GET | `/subscription/:referenceId/getSnippetsData` | `getSubscriptionPlans` | `proxy_auth_token` only if given |
| POST | `/subscription/:referenceId/subscribe` | `upgradeSubscription` | payload |

> [!WARNING]
> `OtpService.options.headers` is one shared, mutable object. Methods write `proxy_auth_token` (and `setOtpRequestHeaders` writes `reference_id` and `origin`) into it, and the values stay for later calls. Copy the options, as `postOauthAuthorizeDecision` and `getTimezones` do, when a header must apply to one call only.

> [!WARNING]
> `setOtpRequestHeaders` sets an `origin` header. `Origin` is a forbidden request header in browsers, so the backend receives the browser's own `Origin`, not this value. Do not rely on it server-side.

> [!WARNING]
> `HttpWrapperService.delete` (both wrappers) puts `params` into `options.search`, which Angular's `HttpClient` ignores. Query params on DELETE are dropped; put ids in the path.

## Third-party scripts loaded at runtime
- `https://verify.msg91.com/otp-provider.js` (`window.initSendOTP`) — `apps/36-blocks-widget/src/app/otp/service/otp-widget.service.ts:OtpWidgetService`.
- hCaptcha `https://js.hcaptcha.com/1/api.js?render=explicit` — widget login form.
- `environment.interfaceScriptUrl` (`INTERFACE_SCRIPT_URL`, viaSocket chatbot) — `LayoutComponent`.
- Firebase Auth (Google sign-in popup) — `libs/services/proxy/auth/src/lib/services-proxy-auth.module.ts:AuthService.loginViaGoogle`.
