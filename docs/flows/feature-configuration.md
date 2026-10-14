---
covers: ["apps/36-blocks/src/app/panel/features/**", "apps/36-blocks/src/app/panel/onboarding/onboarding.component.ts", "apps/36-blocks/src/app/panel/layout/layout.component.ts", "libs/services/proxy/features/**", "libs/urls/features-url/**", "libs/models/features-model/**"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# Flow: create and configure a block (feature)

A logged-in user opens `/app/features/create`, walks the stepper, and the UI creates a feature with `POST /features`; the result is a `reference_id` plus a `<script>` snippet that the customer pastes into their own site to render the widget. After that, `/app/features/manage/:id` saves one slice per tab with `PUT /features/:id`. Component internals, payload shapes in full and the field-config model are in [panel-features](../modules/panel-features.md); the widget side of `initVerification` is in [widget-embed](../modules/widget-embed.md); endpoint list in [api.md](../api.md).

```mermaid
flowchart TD
    A[/onboarding submit or Features list 'Create'/] --> B[/app/features/create<br>CreateFeatureComponent]
    B --> C[GET getFeatures → feature_id = types 0]
    C --> D[Block Name step → GET getMethodsService/:feature_id<br>method_id = methods 0, build serviceDetails]
    D -->|feature_id 1| E[Configure Method → Authorization Setup<br>createFeature → POST features]
    D -->|feature_id 2| F[Integration Choice → Organization Details<br>getPlansForm → POST features]
    E --> G[createUpdateObject: id, reference_id<br>snippet = ProxyAuthScript]
    F --> G
    G -->|1| H[Branding: PUT features/:id → Design & code]
    G -->|2| I[metrics / taxes / payment / plans<br>subscription/:reference_id/...]
    I --> J[Plans Overview & snippet]
    H --> K[/app/features/manage/:id<br>tabs → PUT features/:id]
    J --> K
    K --> L[/widget-preview/:referenceId<br>window.initVerification]
```

## Steps

### Entry

1. **Reach the wizard** — two links lead to `/app/features/create`:
   - `apps/36-blocks/src/app/panel/onboarding/onboarding.component.ts:OnboardingComponent.submitOnboarding` after first sign-up ([dashboard-login](./dashboard-login.md)).
   - the "Create" button in `apps/36-blocks/src/app/panel/features/feature/feature.component.html`.
   The route is `create` in `apps/36-blocks/src/app/panel/features/features.routes.ts`, under `/app` (`CanActivateRouteGuard`).
2. **Sidebar check** — `apps/36-blocks/src/app/panel/layout/layout.component.ts:LayoutComponent` on `NavigationEnd` to a URL containing `/features/create` calls `FeaturesService.getFeature({ itemsPerPage: 1, pageNo: 1 })` and hides the sidebar when `data.totalEntityCount` is 0 (first block).

### Create wizard (`CreateFeatureComponent`, `isEditMode = false`)

All component methods below are in `apps/36-blocks/src/app/panel/features/create-feature/create-feature.component.ts`; store effects are in `apps/36-blocks/src/app/panel/features/create-feature/create-feature.store.ts:CreateFeatureComponentStore`; HTTP is `libs/services/proxy/features/src/lib/services-proxy-features.module.ts:FeaturesService` with URLs from `libs/urls/features-url/src/index.ts:FeaturesUrls`.

3. **Load types** — `ngOnInit` (no `:id` param) → `getFeatureType` → store `getFeatureType` → `GET /getFeatures`. The `featureType$` subscription writes `features[0].id` into `primaryDetails.feature_id` and auto-advances when there is only one type. Also `getWebhookEvents` → `FeaturesUrls.getWebhookEvents` (GET getWebhookTriggerEvents).
4. **Block Name step** — `validateFirstStepAndNext`: `name` must be valid; for `feature_id === 1`, `redirect_url` must match `URL_REGEX`, and `setRedirectUrlInServiceDetails` copies it into every service's `configurations.redirect_uri` and adds its origin as an allowed-origin chip (`syncAllowedOriginFromRedirectUrl`).
5. **Load methods** — `stepChange` when leaving step 0 → `getServiceMethods(feature_id)` → `GET /getMethodsService/:id`. `serviceMethods$` sets `method_id = methods[0].id` (no picker) → `selectedMethod` emits → one `ServiceFormGroup` per `method_services[i]`, controls built by `createFormControl` from backend `IFieldConfig`. Only Google (`FeatureServiceIds.GoogleAuthentication`) starts with `is_enable: true`.
6. **Branch on `feature_id`.**

#### Authorization block (`feature_id === 1`)

7. **Configure Method** — the user toggles services and edits each in the configure dialog (`editService`, `configureMethodDialogForm`). Step completes when `isConfigureMethodValid`.
8. **Authorization Setup → create** — the step button calls `createFeature()`:
   - `authorizationDetails` invalid → mark touched, stop.
   - builds the payload (below), then `setTimeout(100)` → store `createFeature` → `POST /features`.
   - `getServicePayload` sends only groups that are `dirty` **and** `is_enable`; values for `chipList`/`readFile` fields are filled by promises inside `setFormDataInPayload`, which is why the 100 ms delay exists (commit `8194f26a`).
9. **Create result** — store: `hasError` → toast, stop; else toast "Feature created successfully" and `createUpdateObject = res.data`. The component's `createUpdateObject$` subscription sets `featureId = obj.id`, rebuilds `proxyAuthScript = ProxyAuthScript(environment.proxyServer, obj.reference_id, 'authorization')`, sets `demoDiv = <div id="<reference_id>">`, and advances the stepper after 10 ms. Earlier steps become non-editable (`[editable]="!(createUpdateObject$ | async)"`).
10. **Branding** — `updateFeature('branding')` → store `updateFeature` → `PUT /features/:id`. A logo file is uploaded first with `onBrandingLogoFileSelected` → `POST /features/:id/upload-logo` (multipart field `logo`); `logo_url` in the payload is `logoUrl()` when `logoInputMode === 'file'`.
11. **Design & code** — `designAndCode` template shows `proxyAuthScript` and `demoDiv` with copy buttons, and a "Manage Feature" link to `/app/features/manage/<id>`.

#### Subscription block (`feature_id === 2`)

7. **Integration Choice** → **Organization Details** — the step button calls `markDirtyOrganizationDetailsFormTouched` → `isOrganizationDetailsValid` (a getter that also sets `canCreatePlansFormControls = true`) → `createPlansFormControlsOnDemand` → `getPlansForm()` → `mergeObjects(featureForm.value, method_services[0])` → `setTimeout(100)` → store `createFeature` → `POST /features`.
8. **Create result** — same as step 9 above, plus `getAllBillableMetrics(reference_id)` → `GET /subscription/:refId/billableMetrics` and `getTaxes(reference_id)` → `GET /subscription/:refId/taxes`.
9. **Billable Metrics** — `addBillableMetric` opens `SimpleDialogComponent` → store `createBillableMetric` → `POST /subscription/:refId/billableMetrics`. The "Next" button calls `getPaymentDetailsFormData` → `FeaturesUrls.getPaymentDetailsForm` (GET paymentCredentialsForm) → `paymentDetailsForm$` builds the Stripe form from `.stripe`.
10. **Payment Details** — `savePaymentDetails` → store `updatePaymentDetails` → `POST /subscription/:refId/updateCredentials`. "Next" calls `getCreatePlansFormData` → `createPlansFormControls` (plan form from `method_services[0].configurations.plans.fields`; last two keys become the charges sub-form).
11. **Taxes** — the tax select's "add" option (`addNewOption`) opens `CreateTaxDialogComponent` → store `createTax({ refId, body })` → `POST /subscription/:refId/taxes`; `createTax$` refetches taxes after 500 ms.
12. **Create Plan** — `createPlanAndGenerateSnippet` → `transformPayloadToPlanMeta` + `chargesList` → if `isCreatePlansFormControlsValid`, store `createPlan` → `POST /subscription/:refId/plans`. `createPlan$` refetches plans (`GET /subscription/:refId/plans`) and advances to **Plans Overview & Subscription Snippet**, which shows `designAndCode` with `type: 'subscription'`.

### Manage (`/app/features/manage/:id`, `isEditMode = true`)

13. **Load** — `ngOnInit` sees `params.id` → `featureId = params.id` → `getFeatureDetalis()` → store `getFeatureDetalis(id)` → `GET /features/:id` and store `getAllowedOrigins(id)` → `GET /features/:id/allowedOrigins`.
14. **Patch form** — first `featureDetails$` subscription (distinct on `feature_id` + `reference_id`): `getServiceMethods(feature.feature_id)`, rebuild `proxyAuthScript` and `demoDiv` from `feature.reference_id`; for `feature_id === 2` also loads metrics and plans. Second subscription waits for `serviceMethods$` then `patchValue`s every group. Service controls take values from `feature.service_configurations[service_id]`. `redirect_url` validators are cleared (field hidden).
15. **Save a tab** — each tab button calls `updateFeature(type)` with `type` in `'name' | 'service' | 'authorization' | 'branding' | 'webhook'`; the matching form group must be valid, then `setTimeout(100)` → `PUT /features/:id` with only that slice. In edit mode `getServicePayload` sends every dirty group, enabled or not.
16. **After save** — store sets `createUpdateObject = res.data` → the same `createUpdateObject$` subscription runs: `nameFieldEditMode = false`, `getFeatureDetalis()` refetch, `featureId = obj.id`, snippet rebuilt.
17. **Subscription billing in manage** — plans, taxes, metrics and payment are edited through the same dialogs and store effects as the wizard, always keyed by `getReferenceId()` (`createUpdateObject.reference_id ?? featureDetails.reference_id`). Members and OAuth tabs are separate components; see [panel-features](../modules/panel-features.md#edit-appfeaturesmanageid).

### Preview and the customer snippet

18. **Open preview** — `apps/36-blocks/src/app/panel/features/create-feature/feature-preview/feature-preview.component.ts:FeaturePreviewComponent.openPreview` (header button, shown once a `reference_id` exists) or the list row action → `router.navigate(['/widget-preview', referenceId], { state: { originUrl } })`. The route is top-level in `apps/36-blocks/src/app/app.routes.ts`, guarded by `CanActivateRouteGuard`, outside the panel layout.
19. **Launch widget** — `apps/36-blocks/src/app/panel/features/create-feature/feature-preview/widget-preview/widget-preview.component.ts:WidgetPreviewComponent.launchWidget`: removes stale `proxy-auth` elements, injects `ProxyAuthScriptUrl(environment.proxyServer, Date.now())` once (guarded by `window.__proxyAuthLoaded`), then calls `window.initVerification(config)`. Authorization tab mounts into `#<referenceId>` with `redirect_path`; on `success` with a token it stores `authToken` and switches to the User Profile tab. Other tabs mount into `#userProxyContainer` (`PROXY_DOM_ID`) with `authToken`. There is no Subscription tab in the preview.
20. **Snippet the customer pastes** — two variants exist:
   - wizard/manage "Design & code": `ProxyAuthScript(environment.proxyServer, reference_id, type)` from `libs/models/features-model/src/index.ts` plus `demoDiv`.
   - preview "code" view: `apps/36-blocks/src/app/panel/features/create-feature/feature-preview/widget-preview/widget-code-snippet.ts:buildCodeSnippet(referenceId, activeTab)`, which includes the mount `<div>`; for non-authorization tabs it uses `authToken: 'ENCRYPTED_AUTH_TOKEN'` instead of `referenceId`.
   On the host page the script loads proxy-auth.js from `environment.proxyServer` and `onload` calls `initVerification(configuration)`; from there it is the widget's flow ([widget-embed](../modules/widget-embed.md)).

## Data at key hops

```ts
// GET /getMethodsService/:id → IMethod[] (trimmed)
[{ id, authorization_format, method_services: [{ service_id, method_id, name,
    requirements: { [key]: IFieldConfig },
    configurations: { fields: { [key]: IFieldConfig }, mappings,
                      plans?, billable_metrics?, forms?: { taxes? } } }] }]

// POST /features (authorization), CreateFeatureComponent.createFeature
{ name, feature_id: 1, method_id, redirect_url,
  authorization_format: { ...method.authorization_format, key },   // key default 'Authorization'
  session_time,                                                     // default 86400
  origins: string[],
  extra_configurations: { theme, create_account_link },
  services: [ /* backend method_services[i] with field .value filled, is_enable */ ],
  ui_preferences: { icons, logo_url, light_theme_primary_color, dark_theme_primary_color, button_color,
                    button_hover_color, button_text_color, border_radius, title, sign_up_button_text,
                    create_account_link, remove_branding, theme, version } }

// POST /features (subscription), mergeObjects
{ name, feature_id: 2, method_id,
  services: [{ service_id, configurations: { fields: { [key]: { value } }, mappings }, requirements }] }

// Response → createUpdateObject (IFeature)
{ id, feature_id, method_id, name, reference_id, feature, method, session_time, created_by, updated_by }

// PUT /features/:id bodies by tab
name          { name }
service       { services }
authorization { extra_configurations: { theme, create_account_link, default_role: { name: 'Owner', value: 1 } },
                encryption_key, block_registration, authorization_format, session_time, origins }
branding      { ui_preferences: { ...existing minus primary_color, ...brandingDetails, input_fields, logo_url },
                block_registration }
webhook       { webhook: { url, method }, trigger_events }

// POST /subscription/:refId/plans (createPlanAndGenerateSnippet)
{ ...planFields, plan_meta?, charges: [{ billable_metric_id, max_limit }], refId }   // refId also sent in the body

// window.initVerification config (preview, authorization tab)
{ referenceId, type: 'authorization', theme, target: '_blank', redirect_path, success, failure }
```

## Errors

- Every store effect uses `tapResponse`: `res.hasError` → `showError(res.errors)` toast and `isLoading: false`; thrown errors (already reshaped by `ErrorInterceptor` to `{ errors, hasError }`) → same toast. Nothing is rethrown, so the component never sees a failure except that `createUpdateObject` does not change and the stepper stays on its step.
- Form validation failures stop locally with `markAllAsTouched`; no request is sent.
- `getFeatureDetalis` clears `featureDetails` to `null` before fetching; a failed fetch leaves the manage page with an empty form.
- Preview: script load failure → toast "Failed to load widget script"; widget `failure` callback → toast with `error.message`.

> [!WARNING]
> Two id spaces on one page. `featureId` (numeric `id`, the `manage/:id` param) addresses `features/:id`, allowed origins, logo upload, OAuth and block scopes. `reference_id` addresses every `subscription/:refId/...` call, the preview route and the snippet. In manage mode `featureId` starts as the route **string** and becomes the number from `obj.id` after the first save.

> [!WARNING]
> On subscription blocks the feature is created by `getPlansForm()` when Organization Details is submitted. Clicking that button again after a successful create calls `POST /features` again (the step is non-editable afterwards, but the button handler has no guard).

> [!WARNING]
> `createUpdateObject` is written by both create and update. Its subscriber always calls `stepper.first.next()` after 10 ms, and in manage mode also refetches details. Adding another writer to `createUpdateObject` will advance the stepper and refetch as a side effect.

## Side effects

- Backend writes: `POST /features`, `PUT /features/:id`, `POST /features/:id/upload-logo`, and for subscription blocks `POST /subscription/:refId/billableMetrics`, `POST /subscription/:refId/taxes`, `POST /subscription/:refId/plans` and `POST /subscription/:refId/updateCredentials`. The backend creates the `reference_id`.
- Toasts on every success and failure (`PrimeNgToastService`).
- Layout: sidebar hidden on `/features/create` for a client with no blocks.
- Preview: appends the proxy-auth.js `<script>` to `<head>` once per page load, writes `widget_preview_origin_<referenceId>` to `sessionStorage` for the back button, keeps `tab`/`theme` in the query string, and calls `window.closeChatbot` (from `LayoutComponent`) when navigating to `/widget-preview`.
- Nothing is persisted in the browser for the feature itself; the source of truth is `GET /features/:id`.
