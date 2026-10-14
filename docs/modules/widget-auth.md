---
covers: ["apps/36-blocks-widget/src/app/otp/widget/**", "apps/36-blocks-widget/src/app/otp/component/login/**", "apps/36-blocks-widget/src/app/otp/component/register/**", "apps/36-blocks-widget/src/app/otp/component/index.ts", "apps/36-blocks-widget/src/app/otp/store/**", "apps/36-blocks-widget/src/app/otp/service/otp.service.ts", "apps/36-blocks-widget/src/app/otp/service/otp-widget.service.ts", "apps/36-blocks-widget/src/app/otp/service/otp-utility.service.ts", "apps/36-blocks-widget/src/app/otp/service/urls/**", "apps/36-blocks-widget/src/app/otp/model/**"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# Widget auth (login / register / OTP)

The sign-in part of the embeddable `<proxy-auth>` widget: the button list a host page shows ("Continue with Google", "Login with OTP", password form), the login, register and forgot-password dialogs, the OAuth 2.0 consent screen, and the NgRx `otp` store plus `OtpService` that talk to the backend. The custom element itself, the `initVerification` JS API and the Shadow-DOM portal are in [widget-embed](widget-embed.md). The logged-in screens (profile, user management, org details, subscription center) are in [widget-account](widget-account.md). End-to-end sequence: [widget-verification flow](../flows/widget-verification.md).

| File | Role |
|---|---|
| `apps/36-blocks-widget/src/app/otp/widget/widget.component.ts` | `ProxyAuthWidgetComponent` (2100 lines). Root of the custom element: picks the view mode, loads widget config, injects auth buttons into the DOM by hand, owns the password-login V2 form, forgot-password dialog, OAuth consent, and calls the host's `successReturn` / `failureReturn`. |
| `apps/36-blocks-widget/src/app/otp/widget/widget.component.html` | Three top-level blocks: `#buttonContainer`, the `show()` block (account screens), and `#dialogPortal` (register / login / forgot password / OAuth dialogs). |
| `apps/36-blocks-widget/src/app/otp/widget/utility/model.ts` | `WidgetVersion` (`v1`/`v2`) and `InputFields` (`top`/`bottom`). |
| `apps/36-blocks-widget/src/app/otp/component/login/login.component.ts` | `proxy-login` dialog (V1 password login): 3 steps — login with hCaptcha, forgot password (send OTP), reset password with OTP. |
| `apps/36-blocks-widget/src/app/otp/component/login/login.store.ts` | `LoginComponentStore` (ComponentStore, not the global store): `loginData`, `resetPassword`, `verfyPasswordOtp` effects. |
| `apps/36-blocks-widget/src/app/otp/component/register/register.component.ts` | `proxy-register` dialog: sign-up form, inline email and mobile OTP verification through the global store, encrypted submit. |
| `apps/36-blocks-widget/src/app/otp/store/reducers/otp.reducer.ts` | `IOtpState`, `initialState`, `otpReducer` (single `otp` feature). |
| `apps/36-blocks-widget/src/app/otp/store/actions/otp.action.ts` | All actions (`[OTP] …`). Auth uses `getWidgetData`, `sendOtpAction`, `verifyOtpAction`, `resetAll`, `resetAnyState`; the rest serve widget-account. |
| `apps/36-blocks-widget/src/app/otp/store/effects/otp.effects.ts` | `OtpEffects`: one `switchMap` effect per API; decrypts widget config. |
| `apps/36-blocks-widget/src/app/otp/store/selectors/otp.selector.ts` | One selector per state field. |
| `apps/36-blocks-widget/src/app/otp/store/app.state.ts` | `IAppState { otp }` and the `reducers` map passed to `provideStore` in `apps/36-blocks-widget/src/main.ts`. |
| `apps/36-blocks-widget/src/app/otp/service/otp.service.ts` | `OtpService`: every HTTP call of the widget (auth and account), header handling. |
| `apps/36-blocks-widget/src/app/otp/service/urls/otp-urls.ts` | `otpVerificationUrls`: path templates (`:referenceId`, `:id`). |
| `apps/36-blocks-widget/src/app/otp/service/otp-widget.service.ts` | `OtpWidgetService`: loads MSG91's external OTP script and relays its token; also the `showlogin` subject that opens the login dialog. |
| `apps/36-blocks-widget/src/app/otp/service/otp-utility.service.ts` | `OtpUtilityService.aesEncrypt` / `aesDecrypt` (AES-CBC, PKCS7, crypto-js). |
| `apps/36-blocks-widget/src/app/otp/model/otp.ts` | Request/response interfaces, `IRegistrationFields`, `UserManagementTab`. |

## How it works

### 1. Which screen shows (the state machine)

There is no single state enum. The screen is decided by these inputs and signals on `ProxyAuthWidgetComponent`:

| Decides | Source | Effect |
|---|---|---|
| `authType` input | `WidgetAuthType` (`authorization` default, `auth2`) | `auth2` runs `initOauthAuthorize` before anything else. |
| `viewMode` computed | `authToken` + `type` inputs | `user-management` / `organization-details` / `user-profile` only when `authToken` is set; anything else (including `subscription`, whose case is commented out) is `PublicScriptType.Authorization`. |
| `show` signal | `toggleSendOtp`, `setShowLogin`, `setShowRegistration` | Renders the account screen block and the dialog wrapper. |
| `showLogin` | `OtpWidgetService.showlogin` (BehaviorSubject) | `proxy-login` dialog. |
| `showRegistration` | signal | `proxy-register` dialog. |
| `showForgotPassword` + `forgotPasswordStep` (1/2) | signals | Forgot-password dialog used by the V2 inline password form. |
| `showOauthConsent` / `showOauthError` | signals | OAuth consent dialog or static error; both hide `#buttonContainer`. |

Template rules (`widget.component.html`):
- `#buttonContainer` renders when `viewMode() === Authorization` and no OAuth consent/error is shown.
- `#dialogPortal` renders when any of `showRegistration`, `showLogin`, `showForgotPassword`, `showOauthConsent`, `showOauthError` is true. Inside it, register and login are shown only when forgot-password and OAuth are not. When a dialog opens, the component attaches `#dialogPortal` with `WidgetPortalService.attach` (see [widget-embed](widget-embed.md)); detaching calls `closeOverlayDialog`, which resets every dialog flag.

### 2. Boot (`ngOnInit`)

1. `captureHostPageUrl`, then `store.dispatch(resetAll())` — the whole `otp` slice is cleared on every mount.
2. If `authType === auth2` → `initOauthAuthorize` (section 6) and stop.
3. Else `initClassicAuthorizationWidget`:
   - Subscribes to `selectWidgetTheme` and copies `ui_preferences` into component fields: `version`, `input_fields`, `show_social_login_icons` (`icons`), `isCreateAccountTextAppended` (`block_registration`), `dialogBorderRadius`. `loginWidgetData` comes from `registerState`.
   - `toggleSendOtp(true)`: for Authorization, draws a skeleton in `#buttonContainer` and calls `addButtonsToReferenceElement`.
   - If `type === authorization` and `referenceId` is set, dispatches `getWidgetData({ referenceId, payload: buildWidgetDataPayload() })`. `payload` is the host's `otherData` (for auth2 it adds `addInfo.redirect_path` and a JSON `state`).
   - On `selectWidgetData`, finds the entry with `service_id === FeatureServiceIds.Msg91OtpService` (6) → `otpWidgetData`, calls `OtpWidgetService.setWidgetConfig(widget_id, token_auth, state)` and `loadScript()`. The `PasswordAuthentication` (9) entry becomes `loginWidgetData` if `registerState` was absent.
   - Subscribes to `otpWidgetToken`: when MSG91's script returns a token it calls `hitCallbackUrl(otpWidgetData.callbackUrl, { state, code: token })`.

### 3. Button injection (`addButtonsToReferenceElement` → `appendButton`)

Buttons are plain DOM built with `Renderer2`, not Angular templates. For each item of `widgetData`:
- OTP service: appended when `OtpWidgetService.scriptLoading` turns false, or after a 4 s fallback. Hidden (`visibility:hidden`) until then.
- Password authentication: skipped on sign-up routes (`isSignupRoute` matches `signup|register|registration` in the URL). With `version === 'v1'` it is a button that opens `proxy-login`; with v2 it is an inline form built by `appendPasswordAuthenticationButtonV2` + `buildLoginFields` (hCaptcha loaded by `ensureHCaptchaScriptLoaded`).
- Anything with `urlLink` (social logins): `window.open(urlLink, target)`.
- After all buttons: `appendCreateAccountText` adds "Are you a new user? Create an account" (not on sign-up routes, not for auth2, not when `block_registration`) and the "Powered by" footer (unless `ui_preferences.remove_branding`).
- Skeleton safety nets: 3 s, 8 s and 10 s timeouts force the skeleton off.

`getAuthButtonText` rewrites "Continue/Login/Sign in" to "Sign up" on sign-up routes.

### 4. OTP send / verify / retry

There are two separate OTP mechanisms.

**A. Login with OTP (MSG91 hosted widget).** The widget does not call send/verify itself. `OtpWidgetService.openWidget` loads `https://verify.msg91.com/otp-provider.js` (cache-busted) and calls `window.initSendOTP({ widgetId, tokenAuth, state, success, failure })`. `success(data)` pushes `data.message` into `otpWidgetToken`; the component then calls the feature's `callbackUrl` with `{ state, code }` (section 7). `failure` pushes to `otpWidgetError`, which nothing subscribes to.

**B. Inline OTP in the register form (and user profile).** Channels are `mobile` and `email` (`OtpChannel` in `register.component.ts`). OTP length is 4.

1. `getOtp` / `getEmailOtp` → `sendOtpForChannel(channel, false)`: validates the field (mobile also needs `intlClass['user'].isRequiredValidNumber`), sets `pendingOtpChannel`, dispatches `sendOtpAction({ request: { referenceId, identifier, useRetry } })`.
2. `OtpEffects.getOtp$`: `useRetry` → `OtpService.retryOtp` (`otp/retry`), else `sendOtp` (`otp/send`). Body is `{ identifier }`. A 200 with `type: 'error'` becomes `sendOtpActionError`.
3. Reducer: `sendOtpActionComplete` stores `otpGenerateData = { reqId: response.message }`, `getOtpSuccess = true`. The component then shows OTP boxes and starts a 30 s resend timer per channel.
4. Resend → `sendOtpForChannel(channel, true)`. `useRetry` is true only if the identifier is unchanged since the last send; a changed identifier is a fresh `otp/send` and resets the timer.
5. Verify: when 4 digits are entered, `verifyOtpAction({ request: { referenceId, identifier, otp } })` → `OtpEffects.verifyOtpV2$` → `otp/verify`. Success requires `res.status === 'success'`.
6. `verifyOtpV2Data.data.otp_verification_token` is kept as `emailVerificationToken` or `mobileVerificationToken` based on `pendingOtpChannel`.
7. Errors land in `apiErrorResponse`; the component shows "Please enter valid OTP" and resets the OTP boxes.

Rules from `registration_fields` (`IRegistrationFields`, from the widget theme; default `{ mobile: 'optional_with_otp', company: 'optional' }`): mobile OTP is required when mode is `mandatory_with_otp`, or `optional_with_otp` and a number was entered. Email OTP is always required unless `isRegisterFormOnly`.

The older actions `getOtpResendAction` / `getOtpVerifyAction` (`widget/retryOtp`, `widget/verifyOtp`) still exist in the store but nothing in the repo dispatches them.

### 5. Register submit (`RegisterComponent.submit`)

1. Decrypts the service `state` (login service state if `registrationViaLogin`, else OTP service state) with `uiEncodeKey`/`uiIvKey` to read `url_unique_id`.
2. Builds `request_data` from the form (`firstName + lastName` → `user.name`, drops `confirmPassword`, adds empty `meta`).
3. AES-encrypts `{ reference_id, service_id, url_unique_id, request_data, signup_service_id? }` with the UI keys → `proxy_state`.
4. `OtpService.register` → `POST c/register?action=redirect` with `{ proxy_state, state, email_otp_verification_token?, mobile_otp_verification_token? }`.
5. On success: `window.location.href = response.data.redirect_url`. On error: inline message only.

### 6. OAuth 2.0 (`authType: 'auth2'`)

`initOauthAuthorize` reads the host page query string.
- No `proxy_auth_token` → `GET oauth/authorize` with all params. Valid (`client_id` or `client_name` in data) → classic widget boots; the V2 password title becomes "Sign in to continue to {client_name}". Invalid → `openOauthErrorPage` (static message, no widget API call).
- `proxy_auth_token` and `state` present (user came back after login) → params are recovered from the JSON `state` by `resolveAuthorizeParamsAfterLogin`, `oauth/authorize` is re-validated, then the consent dialog opens. `submitOauthConsent` posts `{ action: approve|deny, client_id, redirect_uri, state, response_type, scope?, code_challenge?, code_challenge_method? }` to `oauth/authorize/decision` with header `proxy_auth_token`, then navigates to `data.redirect_to`.

## Contracts

### How calls are authenticated

- All calls go through `HttpWrapperService` from `@proxy/services/http-wrapper-no-auth` (no auth interceptor). Base URL for both `ProxyBaseUrls.BaseURL` and `ProxyBaseUrls.ClientURL` is `environment.apiUrl + environment.msgMidProxy` (see `apps/36-blocks-widget/src/main.ts`).
- Public widget calls are identified by the `referenceId` in the path (`:referenceId/widget`) or the `reference_id` header. `OtpService.setOtpRequestHeaders` sends `proxy_auth_token` if an `authToken` is in the request, else `reference_id`, plus an `origin` header (`location.origin + pathname`).
- Logged-in calls send the user's token in the `proxy_auth_token` header (`getUserDetailsData`, `postOauthAuthorizeDecision`, the account APIs). `getTimezones` alone uses `Authorization`.
- Each feature item in widget data carries an opaque `state`; login, reset-password and register send it back.
- hCaptcha: login sends `hCaptchaToken`; site key from `environment.hCaptchaSiteKey` (`NgHcaptchaModule.forRoot` in `main.ts` for `proxy-login`; explicit `hcaptcha.render` for the V2 inline form).

### Encryption (the `AUTH_*` keys)

`tools/set-env.js` generates env-variables.ts next to `apps/36-blocks-widget/src/environments/environment.ts` (git-ignored, so it is absent in a fresh checkout) from `AUTH_UI_ENCODE_KEY`, `AUTH_UI_IV_KEY`, `AUTH_API_ENCODE_KEY`, `AUTH_API_IV_KEY`, `HCAPTCHA_SITE_KEY`, `SEND_OTP_AUTH_KEY`, exposed as `environment.uiEncodeKey`, `uiIvKey`, `apiEncodeKey`, `apiIvKey`, `hCaptchaSiteKey`, `sendOtpAuthKey`. Values and defaults live in [environment.md](../environment.md).

| Data | Direction | Keys | Where |
|---|---|---|---|
| Widget config `data.ciphered` | decrypt (base64-wrapped) | `apiEncodeKey` / `apiIvKey` | `OtpEffects.getWidgetData$` |
| Passwords (login, reset) | encrypt `JSON.stringify(password)`, base64 | `uiEncodeKey` / `uiIvKey` | `LoginComponent.encryptPassword`, widget `encryptPassword` |
| Register `proxy_state` | encrypt | `uiEncodeKey` / `uiIvKey` | `RegisterComponent.submit` |
| Service `state` (to read `url_unique_id`) | decrypt | `uiEncodeKey` / `uiIvKey` | `RegisterComponent.submit` |

### Store state (`IOtpState`, auth-relevant part)

```ts
{
  widgetData: Array<{ service_id: number; text; icon; urlLink?; state; widget_id?; token_auth?; callbackUrl?; ... }> | null, // decrypted `ciphered`
  theme: { ciphered; ui_preferences?: {...}; registration_fields?: IRegistrationFields; registerState? } | null, // raw res.data
  otpGenerateData: { reqId: string } | null,  getOtpInProcess, getOtpSuccess,
  verifyOtpV2Data: { status: 'success'; data: { otp_verification_token } } | null, verifyOtpV2InProcess, verifyOtpV2Success,
  resendOtpInProcess, resendOtpSuccess, resendCount,   // legacy retry path only
  verifyOtpData, verifyOtpInProcess, verifyOtpSuccess, // legacy verify path only
  errors: string[] | null, apiErrorResponse: any, closeWidgetApiFailed: boolean, // true after getWidgetData fails
  // + ~45 *Data / *InProcess / *Success fields owned by widget-account
}
```

The `widgetData` item shape is not typed in the code; the keys above are the ones the component reads.

### What the host page gets

The host passes `success` and `failure` callbacks to `initVerification`; `apps/36-blocks-widget/src/app/init-verification.ts` sets them as `successReturn` / `failureReturn` on the element (`success` is mandatory).

| Event | Host receives |
|---|---|
| OTP-widget login, callback URL succeeds | `successReturn(res)` with the callback response; then redirect to `res.data.redirect_to` if present, else buttons are redrawn. |
| V2 inline password login succeeds without `redirect_url` | `successReturn(res)` |
| V2 inline password login fails (not 403) | `failureReturn(HttpErrorResponse)` |
| Login / register dialog closed by the user (X or Esc) | Nothing. Both end in `closeOverlayDialog()`. `LoginComponent.close(true)` / `RegisterComponent.close(true)` would call `failureReturn({ code: 0, closeByUser: true, ... })`, but nothing calls them at this commit. |
| Login or register returns `redirect_url` | No callback; `window.location.href = redirect_url`. |
| 403 from login or the OTP callback URL | No callback; the register dialog opens (prefilled with the username) unless registration is blocked. |
| OAuth consent | No callback; navigation to `data.redirect_to`. |

The auth area emits no `window` events or `postMessage`; those come from widget-account.

### Backend endpoints

Path constants are in `otpVerificationUrls`; the full list with methods is in [api.md](../api.md). Auth uses: `getWidgetData` (POST), `oauthAuthorize` (GET), `oauthAuthorizeDecision` (POST), `sendOtp`, `retryOtp`, `verifyOtpV2`, `register`, `login`, `resetPassword`, `verifyPasswordOtp` (all POST), plus the feature's own `callbackUrl` (GET, absolute URL from widget data).

## Gotchas

> [!WARNING]
> `OtpService.options` is one shared mutable object. `setOtpRequestHeaders`, `getUserDetailsData` and most account methods write `proxy_auth_token` / `reference_id` / `origin` into it and they stay for every later call that uses `this.options`. A call that needs different headers must copy the object, as `postOauthAuthorizeDecision` and `getTimezones` do.

> [!WARNING]
> The `otp` slice is shared by register and widget-account (`user-profile` also dispatches `sendOtpAction` / `verifyOtpAction`). `getOtpSuccess`, `verifyOtpV2Success` and `apiErrorResponse` stay set until reset; `RegisterComponent.close` clears them with `resetAnyState`. A new OTP consumer must reset these fields too, or it will react to the previous flow's success.

> [!WARNING]
> The register form decides which field an OTP response belongs to from `pendingOtpChannel`, not from the response. Sending a mobile OTP and an email OTP at the same time attributes the first response to the wrong channel.

> [!WARNING]
> `hitCallbackUrl` calls `this.successReturn(res)` directly, not through `returnSuccessObj`, so it throws if the host gave no `success` function. `initVerification` enforces it today; keep that check.

> [!WARNING]
> `proxy-register` binds `(successReturn)="closeOverlayDialog()"`, and register never emits it anyway: a successful registration only redirects. Do not expect `successReturn` on the host after sign-up.

> [!WARNING]
> The register request sends `email_otp_verification_token` / `mobile_otp_verification_token`, but `IRegisterReq` declares `email_verification_token` / `mobile_verification_token`. The interface is wrong; the request keys are what the backend gets.

> [!WARNING]
> Effects treat a 200 body as failure in different ways: `getOtp$` checks `res.type !== 'error'`, `verifyOtpV2$` requires `res.status === 'success'`, the login store checks `res.hasError`. Use the same check as the neighbouring code when adding an effect.

> [!WARNING]
> If `AUTH_API_ENCODE_KEY` / `AUTH_API_IV_KEY` are missing or wrong, `aesDecrypt` returns an empty string, `JSON.parse` throws, and `getWidgetDataError` sets `closeWidgetApiFailed`. The widget shows no buttons; the console logs `[36Blocks] getWidgetData failed` and whether each key is defined.

> [!WARNING]
> The reducer writes `widgetDataInProcess` / `widgetDataSuccess`, which are not in `IOtpState` and have no selector. Do not rely on them.

## Why it is built this way

- Auth buttons are injected as raw DOM into `#buttonContainer` inside the element's shadow root (commit c475054f "encapsulate all Authorization mode DOM inside proxy-auth"). Before that, buttons were appended to a host element found by `document.getElementById(referenceId)`; that path still exists for subscription mode.
- `otp/send` + `otp/retry` + `otp/verify` (V2, identifier-based) replaced the `widget/retryOtp` / `widget/verifyOtp` reqId-based calls (commits 16b94f28 "fix the otp issue", 0ae2f506 "fix the retry"). The old actions were never removed.
- `registration_fields` makes mobile/company fields configurable per feature (commit e6da5810 "Make the registratio form dynamic").
- Sign-up route detection and "Sign up" button labels came from b6e48af8 / 8dbed658.
- OAuth 2.0 support was added in c38eea4a; it reuses the classic login widget instead of a separate page.

> [!TODO] Needs a human: why is password/state encryption done client-side with static keys shipped in the bundle (`AUTH_UI_*`), and does the backend treat it as transport obfuscation only?

> [!TODO] Needs a human: is `otpWidgetError` (MSG91 OTP widget failure) meant to reach the host's `failureReturn`? Today nothing subscribes to it.

## Changing it safely

- New backend call: add the path to `otpVerificationUrls`, a method on `OtpService` that copies `this.options` if it sets headers, then action triple + reducer cases + effect + selector. Mirror the `*Data / *InProcess / *Success` naming.
- New auth button type: add its `FeatureServiceIds` branch in both `appendButton` click handlers (icon-only and full button) and in `addButtonsToReferenceElement`; keep `checkAndAppendCreateAccountText` counting every button or the skeleton stays until the 8 s fallback.
- New dialog: add a signal, include it in the `#dialogPortal` `@if` in `widget.component.html`, attach the portal like `setShowLogin`, and reset it in `closeOverlayDialog`.
- Register fields: change `registrationForm` and `applyRegistrationFieldRules` together, and check the payload rename block in `submit`.
- Check by running the widget dev app (see [widget-embed](widget-embed.md)) with a real `referenceId`, in both `v1` and `v2`, on a normal URL and a `/signup` URL, and with `authType: 'auth2'`.
