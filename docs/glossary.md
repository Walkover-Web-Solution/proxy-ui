---
covers: ["libs/constant/src/verification/verification.ts", "libs/models/root-models/src/index.ts", "libs/models/features-model/src/index.ts"]
verified_at: 395659d5
verified_on: 2026-10-29
---
# Glossary

| Term | Meaning | In code |
|---|---|---|
| 36 Blocks | Product name. The repo, the backend and old code still say "proxy". | `apps/36-blocks`, `apps/36-blocks-widget`, `@proxy/...` aliases |
| proxy / proxy backend | The backend API both apps call. It lives in another repo and has a base URL per environment. | `ProxyBaseUrls.BaseURL` in `libs/models/root-models/src/index.ts` |
| block = feature | One configurable auth or billing product a customer creates in the dashboard. The UI says "block"; code and API say "feature". | `apps/36-blocks/src/app/panel/features/` |
| `feature_id` | Type of a block: `1` = authorization, `2` = subscription. Hard-coded, with no enum. The Users page also reuses this name for a `reference_id`. | `apps/36-blocks/src/app/panel/features/create-feature/create-feature.component.ts` |
| `id` vs `reference_id` | The two id spaces of a block. The numeric `id` drives feature CRUD, origins, logo, OAuth and scopes. The string `reference_id` drives the widget (`referenceId`) and the billing URLs. | [modules/panel-features.md](modules/panel-features.md) |
| `referenceId` | The `reference_id` as the widget sees it: sent in the `reference_id` header and the `:referenceId/widget` path. For `authorization` it is also the id of the host's container div. | `apps/36-blocks-widget/src/app/init-verification.ts` |
| `PROXY_DOM_ID` / `userProxyContainer` | Container div id for every widget type except `authorization`. | `libs/constant/src/verification/verification.ts:PROXY_DOM_ID` |
| `type` (widget) | Which screen the widget shows: `authorization`, `user-profile`, `user-management`, `organization-details`, `oauth2`, or `subscription` (deprecated). | `PublicScriptType` |
| `authType` | `authorization` (default) or `auth2`, which runs the OAuth 2.0 consent flow first. | `WidgetAuthType` |
| method / `method_services` | A backend login-method bundle and its services. Service ids are in `FeatureServiceIds` (6 MSG91 OTP, 7 Google, 8 Apple, 9 password). | `libs/models/features-model/src/index.ts` |
| client | The customer's organization (company). The current client is stored on the server against the token, so requests never send a client id. Switching client reloads the page. | `apps/36-blocks/src/app/core/ngrx/` (`switchClient`) |
| client secret | Two unrelated things. A **block client secret** (`features/:id/clientSecrets`, `IClientSecret`, at most 2 active) lets the customer's server exchange a `code`-mode login code for the token. An **OAuth client secret** belongs to one confidential OAuth client (`oauthConfigs/:id/regenerateSecret`). Neither has to do with "client" meaning the customer's company. | `libs/models/features-model/src/index.ts` |
| redirect response mode | Per-block setting for what the post-login redirect carries: `legacy` (the `proxy_auth_token` in the URL) or `code` (a one-time code for `POST /c/exchange`). Missing means `legacy`. | `RedirectResponseMode` in `libs/models/features-model/src/index.ts` |
| project / environment | Entities from the old proxy-gateway product. Only the Logs filters and the `/project` wizard use them; they are not blocks. | `libs/models/logs-models` |
| `authToken` (cookie) | The proxy JWT for the dashboard session, kept 30 days at path `/`. It is mirrored in memory as `IToken.proxyJWTToken`. | `libs/services/proxy/auth` (`AuthService.setTokenSync`) |
| `authToken` (widget config) | The end user's token, passed by the host page to the account screens. The widget sends it as the `proxy_auth_token` header. | `apps/36-blocks-widget/src/app/otp/service/otp.service.ts` |
| `BaseResponse` | Backend envelope `{data, status, hasError, errors}`. Paginated lists sit at `res.data.data`. | `libs/models/root-models/src/index.ts` |
| `otherData` | `initVerification` config minus `RESERVED_KEYS`, merged over URL params. It is POSTed as the widget-data request body. | `apps/36-blocks-widget/src/app/init-verification.ts` |
| `state` / `proxy_state` | AES-encrypted opaque values: the per-feature service state that login/register/reset echo back, and the encrypted register payload. | [modules/widget-auth.md](modules/widget-auth.md) |
| Lago | The billing system behind subscription blocks, reached only through the backend's `v1/billing/*`. | `apps/36-blocks/src/app/panel/billing/` |
| test identities | Emails and mobiles on a block that are treated as test users. The full array is sent on every save. | `extra_configurations.test_identities`, see [modules/panel-ops.md](modules/panel-ops.md) |
