---
covers: ["apps/36-blocks/src/app/panel/features/**"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# Panel features (blocks)

The dashboard's "Blocks" section: list the project's features, create one through a stepper wizard, then manage it (services, branding, settings, webhook, members, OAuth clients) and preview it in the embeddable widget. It lives in `apps/36-blocks/src/app/panel/features/` and is mounted under `/app/features` by `apps/36-blocks/src/app/panel/panel.routes.ts` (the copy in `apps/36-blocks/src/app/panel/layout/layout.routes.ts` is dead; see [routes](../ui/routes.md)). All backend calls go through `FeaturesService` in `libs/services/proxy/features/` (see [shared-libs](../modules/shared-libs.md)). The end-to-end trace is in [feature-configuration](../flows/feature-configuration.md).

A **feature** (UI name: **block**) is a backend record with a `reference_id`. Host pages pass that `reference_id` to the widget script (`initVerification`) to render it ([widget-embed](../modules/widget-embed.md)). The code knows two feature types, both identified by `feature_id`:

| `feature_id` | Type | Script `type` | Wizard path |
|---|---|---|---|
| `1` | Authorization (login / sign-up methods) | `authorization` | Block Name → Configure Method → Authorization Setup → Branding → Design & code |
| `2` | Subscription (plans and billing) | `subscription` | Block Name → Integration Choice → Organization Details → Billable Metrics → Payment Details → Create Plan → Plans Overview & Snippet |

The ids are hard-coded as `=== 1` / `=== 2` checks throughout `create-feature.component.ts` and `create-feature.component.html`. The list of types comes from the backend (`FeaturesService.getFeatureType`). There is no enum for them.

| File | Role |
|---|---|
| `apps/36-blocks/src/app/panel/features/features.routes.ts` | `''` → list, `create` → wizard, `manage/:id` → the same wizard component in edit mode |
| `apps/36-blocks/src/app/panel/features/feature/feature.component.ts` | Paginated, searchable features table (name, reference_id, method, type). Links to manage and to the preview |
| `apps/36-blocks/src/app/panel/features/feature/feature.store.ts` | `FeatureComponentStore`: a single `getFeature` effect. Also reused by `apps/36-blocks/src/app/panel/users/management/management.component.ts` |
| `apps/36-blocks/src/app/panel/features/create-feature/create-feature.component.ts` | About 2200 lines. One reactive `featureForm`, the create stepper (`!isEditMode`), edit tabs (`isEditMode`), dynamic service forms, billing (metrics/plans/taxes/payment), the snippet |
| `apps/36-blocks/src/app/panel/features/create-feature/create-feature.component.html` | About 2400 lines. Stepper, tabs, and many `ng-template`s (`designAndCode`, `manageFeature`, `oauthConfig`, `webhook`, …) |
| `apps/36-blocks/src/app/panel/features/create-feature/create-feature.store.ts` | `CreateFeatureComponentStore`: one effect per `FeaturesService` call. Results are stored as "last response" slices |
| `apps/36-blocks/src/app/panel/features/create-feature/create-plan-dialog/create-plan-dialog.component.ts` | `CreatePlanDialogComponent`: add/edit a subscription plan from a backend form config. Returns the plan payload on close |
| `apps/36-blocks/src/app/panel/features/create-feature/create-tax-dialog/create-tax-dialog.component.ts` | `CreateTaxDialogComponent`: tax form from a backend config. Returns the `taxesForm` value on close |
| `apps/36-blocks/src/app/panel/features/create-feature/simple-dialog/simple-dialog.component.ts` | `SimpleDialogComponent`: generic config-driven form, used for billable metrics. Returns the form value |
| `apps/36-blocks/src/app/panel/features/oauth-config/oauth-config.component.ts` | `OauthConfigComponent` (`proxy-oauth-config`, input `featureId`): OAuth clients and block scopes CRUD (the "OAuth Config" edit tab) |
| `apps/36-blocks/src/app/panel/features/oauth-config/oauth-config.store.ts` | `OauthConfigComponentStore`: effects for OAuth configs and block scopes |
| `apps/36-blocks/src/app/panel/features/create-feature/feature-preview/feature-preview.component.ts` | `blocks-feature-preview`: "Preview Widgets" button that navigates to `/widget-preview/:referenceId` |
| `apps/36-blocks/src/app/panel/features/create-feature/feature-preview/widget-preview/widget-preview.component.ts` | `WidgetPreviewComponent`: full-page live widget preview. Routed from `apps/36-blocks/src/app/app.routes.ts`, outside `/app` |
| `apps/36-blocks/src/app/panel/features/create-feature/feature-preview/widget-preview/widget-code-snippet.ts` | `buildCodeSnippet(referenceId, type)`: the copyable snippet shown in the preview's code view |

## How it works

### List
1. `FeatureComponent.ngOnInit` calls `FeatureComponentStore.getFeature(params)`. That calls `FeaturesService.getFeature` with `pageNo`, `itemsPerPage` and `search`.
2. `hasSomeFeatures` is set only when the request has no `search`, so a search with no results still shows the table, not the empty-state CTA.
3. Row actions: `manage/:id` (the numeric `id`), and `navigateToPreview(reference_id)`, which goes to `/widget-preview/<reference_id>` with `state.originUrl` so that "back" returns to the list.

### Create wizard (`/app/features/create`)
1. `ngOnInit` → `getFeatureType()` → `GET getFeatures`. The first type's `id` is written to `primaryDetails.feature_id`. If there is only one type, the stepper auto-advances. The "Select Block" step is commented out in the template, so the type is in practice always `features[0]`.
2. When leaving step 0, `stepChange` → `getServiceMethods(feature_id)` → `GET getMethodsService/:id`, which returns `IMethod[]`. The first method's id is auto-selected into `primaryDetails.method_id` (there is no UI to pick it).
3. `selectedMethod` emits. For each `method_services[i]`, a `ServiceFormGroup` (`requirements`, `configurations`, `createPlanForm`, `chargesForm`, `is_enable`) is built from the backend `IFieldConfig` dictionaries via `createFormControl`. On create, only Google (`FeatureServiceIds.GoogleAuthentication`, 7) starts enabled.
4. Authorization: `redirect_url` is copied into every service's `configurations.redirect_uri` (`setRedirectUrlInServiceDetails`). Its hostname is auto-added as an allowed origin chip (`syncAllowedOriginFromRedirectUrl`). Then the "Authorization Setup" step's button calls `createFeature()` → store `createFeature` → `POST features`.
5. The response goes into `createUpdateObject`. The component subscribes to it and rebuilds `proxyAuthScript` with the new `reference_id`, sets `demoDiv` to `<div id="<reference_id>">`, stores `featureId = obj.id` and advances the stepper. The Branding step after it already has an id, so it saves with `updateFeature('branding')`.
6. Subscription: the feature is created from the **Organization Details** step. `markDirtyOrganizationDetailsFormTouched` → `createPlansFormControlsOnDemand` → the component's `getPlansForm()`, which, despite its name, calls store `createFeature(mergeObjects(...))`. On success, metrics and taxes are loaded by `reference_id`. Plans are created by `createPlanAndGenerateSnippet`.

### Edit (`/app/features/manage/:id`)
`getFeatureDetalis()` (the typo is the real name) calls store `getFeatureDetalis(id)` → `GET features/:id` and store `getAllowedOrigins(id)` → `GET features/:id/allowedOrigins`. `featureDetails$` patches the whole form. Each tab saves one slice with `updateFeature(type)` → `PUT features/:id`. After a successful update, the component refetches the details. Tabs: Service, Branding, Setting (authorization), Design & code, Webhook (Configurations / Event Catalog), Manage Members (`proxy-management` from [panel-ops](../modules/panel-ops.md), keyed by `reference_id`), OAuth Config (`proxy-oauth-config`, keyed by numeric `featureId`). The last two tabs are full width (`editModeManageMembersTabIndex` = 5, `editModeOauthConfigTabIndex` = 6).

### Store → service map

`CreateFeatureComponentStore` (all in `create-feature.store.ts`. "–" means no caller in this area):

| Store effect | `FeaturesService` method | Called from component |
|---|---|---|
| `getFeatureType` | `getFeatureType` | `getFeatureType()` (create mode) |
| `getServiceMethods` | `getMethodService` | `getServiceMethods()` |
| `createFeature` | `createFeature` | `createFeature()` (auth), `getPlansForm()` (subscription) |
| `updateFeature` | `updateFeature` | `updateFeature(type)` |
| `getFeatureDetalis` | `getFeatureDetails` | `getFeatureDetalis()` |
| `getAllowedOrigins` | `getAllowedOrigins` | `getFeatureDetalis()` |
| `uploadLogo` | `uploadLogo` (multipart, field `logo`) | `onBrandingLogoFileSelected` |
| `getWebhookEvents` | `getWebhookEvents` | `ngOnInit` |
| `getAllBillableMetrics` / `createBillableMetric` / `updateBillableMetric` / `deleteBillableMetric` | same names | metrics table + `SimpleDialogComponent` |
| `getAllPlans` / `createPlan` / `updatePlan` / `deletePlan` | same names | plans table + `CreatePlanDialogComponent` |
| `getTaxes` / `createTax` / `deleteTax` | same names | taxes table + `CreateTaxDialogComponent` |
| `getPaymentDetailsForm` / `getPaymentDetailsFormById` / `updatePaymentDetails` | same names | Payment Details step / tab |
| `createLagoFeature`, `getPlansForm`, `getBillableMetricForm` | same names | – (unused) |

`OauthConfigComponentStore`: `getOauthConfigs`, `createOauthConfig`, `updateOauthConfig`, `deleteOauthConfig`, `regenerateOauthSecret`, `disableOauthConfig`, `getBlockScopes`, `createBlockScope`, `updateBlockScope` and `deleteBlockScope` each call the `FeaturesService` method with the same name. `getBlockScopeCatalog` calls `getBlockScopes` with `{ itemsPerPage: 100, pageNo: 1 }` to fill the scope picker.

URL builders are in `libs/urls/features-url/src/index.ts:FeaturesUrls`, relative to `ProxyBaseUrls.BaseURL` (= `environment.baseUrl`, see [environment](../environment.md)). The full endpoint list is in [api](../api.md).

## Contracts

### Create payload (authorization), from `CreateFeatureComponent.createFeature`
```ts
{
  name, feature_id, method_id, redirect_url,          // ...primaryDetails
  authorization_format: { ...selectedMethod.authorization_format, key: authorizationKey }, // default key 'Authorization'
  session_time,                                       // seconds, default 86400, min 60
  origins: string[],                                  // allowed-domain chips
  extra_configurations: { theme, create_account_link },
  services: IMethodService[],                         // see below
  ui_preferences: { ...brandingDetails },             // icons, logo_url, light_/dark_theme_primary_color,
                                                      // button_color, button_hover_color, button_text_color,
                                                      // border_radius, title, sign_up_button_text,
                                                      // create_account_link, remove_branding, theme, version
}
```
`services` (`getServicePayload`) sends the **backend's own `method_services[i]` object** with each field's `value` filled in from the form. Only dirty service groups that are enabled are included (in edit mode, all dirty groups):
```ts
{ service_id, method_id, name, is_enable,
  requirements:   { [key]: IFieldConfig & { value } },
  configurations: { fields: { [key]: IFieldConfig & { value } }, mappings } }
```
Chip lists are sent joined by `config.delimiter` (default space). `readFile` fields are sent as the file's text.

### Create payload (subscription), from `CreateFeatureComponent.mergeObjects`
```ts
{ name, feature_id, method_id,
  services: [{ service_id, configurations: { fields: { [key]: { value } }, mappings }, requirements }] }
```

### Update payloads (`updateFeature(type)` → `PUT features/:id`)
```ts
name:          { name }
service:       { services }
authorization: { extra_configurations: { theme, create_account_link, default_role: { name: 'Owner', value: 1 } },
                 encryption_key, block_registration, authorization_format, session_time, origins }
branding:      { ui_preferences: { ...existing minus primary_color, ...brandingDetails, input_fields: 'top'|'bottom', logo_url },
                 block_registration }   // = brandingDetails.create_account_link
webhook:       { webhook: { url, method }, trigger_events: string[] }
```
Read side: `IFeatureDetails` in `libs/models/features-model/src/index.ts` declares `service_configurations`, `authorization_format`, `encryption_key` and `block_registration`. The component also reads `ui_preferences`, `webhook` and `trigger_events` (or `webhook_events`), which the interface does not declare.

### Plan, tax and metric sub-configs (subscription only)
The form *definitions* come from the backend inside the selected method: `method_services[0].configurations.plans.fields`, `.billable_metrics.fields` and `.forms.taxes.fields`. Payment form: `getPaymentDetailsForm()` → `.stripe`. Every URL is keyed by the feature's `reference_id`, not its numeric id (`subscription/<refId>/plans|taxes|billableMetrics`).
```ts
// createPlan / updatePlan body (CreatePlanDialogComponent.onSubmit, CreateFeatureComponent.transformPayloadToPlanMeta)
{ ...planFields, amount_cents: number, tax_codes: string[],
  charges: [{ billable_metric_id, max_limit }],
  plan_meta?: { metrics?, features?: { included?, notIncluded? }, extra?, highlight_plan?, tag? } }
// createTax: dialog's taxesForm value → POST subscription/<refId>/taxes
// createBillableMetric: { ...simpleDialogValue, reference_id } → POST subscription/<refId>/billableMetrics
// update/delete metric, plan, tax: addressed by `code`
```

### OAuth sub-config (`OauthConfigComponent`)
- Create body `IOAuthConfigCreatePayload`: `{ name, client_type: 'public'|'confidential', pkce_required, allowed_scopes, redirect_uris }`. Update body `IOAuthConfigUpdatePayload` is the same minus `client_type`, plus `status`. Enabling a client sends `{ status: 'active' }` through `updateOauthConfig`. Disabling uses the dedicated `disableOauthConfig` POST.
- `client_type` cannot be changed after create (the control is disabled when editing). For `public` clients, `pkce_required` is forced to `true` and disabled (`syncPkceForClientType`). Only `confidential` clients can regenerate a secret.
- `allowed_scopes` options = `BUILTIN_OAUTH_SCOPES` (`profile`, `email`, never returned by the API) + block scopes. A scope key must match `SCOPE_KEY_PATTERN` `/^[a-z0-9_]+(:[a-z0-9_]+)*$/`.
- `client_secret` appears only in the create and regenerate responses. The component shows it once in a reveal dialog (`openSecretReveal`).

### Preview and snippet: how a feature reaches the widget
- `ProxyAuthScript(environment.proxyServer, reference_id, type)` (in `libs/models/features-model/src/index.ts`) renders `var configuration = { referenceId, type, success, failure }` plus `<script src=".../assets/proxy-auth/proxy-auth.js" onload="initVerification(configuration)">`. `type` is `'authorization'` when `feature_id === 1`, otherwise `'subscription'`. The wizard also shows `demoDiv` = `<div id="<reference_id>"></div>`, the inline mount point (otherwise the widget opens in a dialog).
- `WidgetPreviewComponent` reads `:referenceId` from the route and calls `window.initVerification(config)` with `{ referenceId, type: activeTab, theme, target: '_blank', success, failure }`. The Authorization tab adds `redirect_path` and mounts into `#<referenceId>`. The User Profile, User Management and Organization tabs (`PublicScriptType`) need an `authToken`: either from the Authorization tab's `success` token, or from the `proxy_auth_token` query param. They mount into `#userProxyContainer` (`PROXY_DOM_ID`). Query params `tab` and `theme` are kept in sync.
- `buildCodeSnippet` uses `referenceId` only for `authorization`. For other types it emits `authToken: 'ENCRYPTED_AUTH_TOKEN'` and `PROXY_DOM_ID`.

## Gotchas

> [!WARNING]
> Two ids. Feature CRUD, allowed origins, logo, OAuth and block scopes use the numeric `id` (`featureId`, the `manage/:id` param). Billing (plans, taxes, metrics, payment) and the widget use the string `reference_id` (`getReferenceId()`). Mixing them up returns 404s or another feature's data.

> [!WARNING]
> `create-feature.component.ts` runs all writes inside `setTimeout(..., 100)` because `setFormDataInPayload` fills `readFile` and `chipList` values through promises that mutate the payload in place. Do not remove the delay or `await` around it without making `getServicePayload` async. Otherwise file contents are sent as `null`.

> [!WARNING]
> The plan form is split **by key order**: the last 2 keys of `configurations.plans.fields` become the charges sub-form (`createPlansFormControls`, `getChargesFormConfig`). `CreatePlanDialogComponent.getPlanFormFields` hides them. If the backend reorders or adds a field, the wrong inputs move into "charges".

> [!WARNING]
> Store slices such as `createPlan`, `createTax` and `deleteTax` keep the last response and are never reset. The component reacts to them with `filter(Boolean)` subscriptions that refetch lists. A new subscription to one of them fires immediately with the old value.

> [!WARNING]
> `CreateFeatureComponent.getPlansForm()` *creates the subscription feature*. It has nothing to do with the store's `getPlansForm` effect, which has no caller. Calling it twice creates two features.

> [!WARNING]
> `create-feature.component.ts` imports `WidgetThemeService` straight from `apps/36-blocks-widget/src/app/otp/service/widget-theme.service.ts` (a cross-app import) and provides it locally. Moving or renaming that widget file breaks the dashboard build.

> [!WARNING]
> In the branding update, `block_registration` is set from `create_account_link`. On load, `create_account_link` is patched from `feature.block_registration ?? true`. The authorization update sets `block_registration` from the "block new sign-ups" toggle. Both tabs write the same backend flag with opposite-sounding meanings.

- Branding saves strip the legacy `ui_preferences.primary_color` (commit `bd7dc18e` "fix the branding issue"). Light and dark colors replace it.
- `onCreateTax` is passed into `CreatePlanDialogComponent`'s data, but the dialog never reads it. `SimpleDialogComponent` injects `HttpClient` and never uses it.
- `WidgetPreviewComponent.launchWidget` deletes every `proxy-auth` element before each launch. It injects the script only once, guarded by `window.__proxyAuthLoaded` (set by the widget bundle, commit `f32ca395`), so re-created preview instances do not load the widget script twice.
- `apps/36-blocks/src/app/panel/layout/layout.component.ts` calls `FeaturesService.getFeature({ itemsPerPage: 1, pageNo: 1 })` on `/features/create` and hides the sidebar when the project has no features yet (first-run onboarding).

## Why it is built this way

- Service, plan, tax, metric and payment forms are **rendered from backend field configs** (`IFieldConfig`: `type`, `is_required`, `regex`, `is_hidden`, `is_disable`, `delimiter`, `read_only_value`, `source`…). New login providers or billing fields can then ship without a UI release. The UI sends the backend's own config object back with `value` filled in (commits `ba9c7c13` "Created `Service` form dynamically" and `7a701020` "dynamic with hard code").
- The create and manage pages are one component, so the same templates (`serviceDetails`, `brandingStepContent`, `designAndCode`) serve both the stepper and the tabs.
- OAuth configs and block scopes were added in `d6999655` "OAuth crud" as a separate component with its own store, rather than more state in the 800-line create store.

> [!TODO] Needs a human: are `feature_id` 1 and 2 stable backend ids? Are more feature types planned? There is no enum, and the UI hard-codes them.

> [!TODO] Needs a human: are `createLagoFeature`, store `getPlansForm` and `getBillableMetricForm` (Lago = the billing backend behind subscription blocks) dead code that can be removed?

## Changing it safely

1. New backend call: add the URL to `FeaturesUrls`, the method to `FeaturesService`, then an effect in the relevant ComponentStore that uses `tapResponse`, checks `res.hasError`, shows `showError` toasts and sets `isLoading`. Follow the pattern of existing effects.
2. New field on a feature: add it to the right `featureForm` group, to the matching `updateFeature` case **and** to `createFeature()` when it applies on create, and to the edit-mode `patchValue` in `ngOnInit`. Add it to `IFeatureDetails` if it is read back.
3. New feature type: search for `feature_id')?.value === 1`, `feature_id === 1` and `feature_id === 2` in `create-feature.component.ts` and `create-feature.component.html`, and for the script `type` mapping (`'authorization' : 'subscription'`).
4. Preview or snippet changes must stay compatible with the widget's `initVerification` config ([widget-embed](../modules/widget-embed.md), [api](../api.md) for the public JS API).
5. Check: `nx serve 36-blocks`. Create one authorization block, then open `/app/features/manage/<id>`, save each tab, and open "Preview Widgets".
