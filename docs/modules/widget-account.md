---
covers: ["apps/36-blocks-widget/src/app/otp/user-management/**", "apps/36-blocks-widget/src/app/otp/user-profile/**", "apps/36-blocks-widget/src/app/otp/organization-details/**", "apps/36-blocks-widget/src/app/otp/component/subscription-center/**"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# Widget account screens

These are the logged-in screens of the embeddable widget: user management (members, roles, permissions), user profile, and organization details, plus a disabled subscription-center stub. The host page opens one by calling `window.initVerification({ type, authToken, ... })`. `ProxyAuthWidgetComponent` (in `apps/36-blocks-widget/src/app/otp/widget/widget.component.ts`) then renders it instead of the login UI. Bootstrap, shadow DOM, portals, the `openAddUserDialog` event and `UserManagementBridgeService` are covered in [widget-embed](./widget-embed.md). The login/OTP screens and the shared NgRx `otp` slice are in [widget-auth](./widget-auth.md).

| File | Role |
|---|---|
| `apps/36-blocks-widget/src/app/otp/user-management/user-management.component.ts` | `<user-management>`. It has three tabs: Members (list, search, paginate, add, edit role/permissions, remove), Roles and Permissions (create and edit). Every call goes through NgRx actions. |
| `apps/36-blocks-widget/src/app/otp/user-management/user-management.component.html` | The tabs, member cards, role cards and one shared add/edit dialog for member, role and permission, plus the remove-confirm dialog. Dialogs are moved to `document.body` with `WidgetPortalService`. |
| `apps/36-blocks-widget/src/app/otp/user-management/add-user-dialog.component.ts` | `AddUserDialogComponent`. A standalone "Add Member" dialog that `UserManagementBridgeService` opens through `WidgetDialogService` when `<user-management>` is not mounted. It closes only after `addUserSuccess`. |
| `apps/36-blocks-widget/src/app/otp/user-profile/user-profile.component.ts` | `<user-profile>`. It shows the user's name, email and mobile and lets them edit the name and mobile (a mobile change needs OTP verification). It lists the user's companies and lets them leave one that is not the current company. |
| `apps/36-blocks-widget/src/app/otp/organization-details/organization-details.component.ts` | `<organization-details>`. It shows and edits the current company's name, email, phone and timezone. It calls `OtpService` directly, with no NgRx. |
| `apps/36-blocks-widget/src/app/otp/component/subscription-center/subscription-center.component.ts` | `<proxy-subscription-center>`. A stub: the class body is commented out, and the `subscription` type never selects it. |

## How it works

### Which `type` opens which screen
`ProxyAuthWidgetComponent.viewMode` picks the screen. A screen is chosen only when `authToken` is truthy **and** `type` matches a `PublicScriptType` value (`libs/constant/src/verification/verification.ts`). In every other case the login UI shows.

| `initVerification` `type` | Screen | Inputs passed from `apps/36-blocks-widget/src/app/otp/widget/widget.component.html` |
|---|---|---|
| `'user-management'` | `<user-management>` | `[userToken]="authToken"`, `[pass]="isRolePermission"`, `theme`, `exclude_role_ids`, `include_role_ids` |
| `'user-profile'` | `<user-profile>` | `authToken`, `theme`, `openEditProfile` |
| `'organization-details'` | `<organization-details>` | `authToken`, `theme` |
| `'subscription'` | none. Its `viewMode` branch is commented out ("TODO: Uncomment when subscription is implemented"), so it falls back to the login UI. | (`referenceId`, `isPreview`, `isLogin`, `loginRedirectUrl` are still bound in the template) |

### How the screens get the auth token
1. The host passes `config.authToken` to `initVerification`. `apps/36-blocks-widget/src/app/init-verification.ts` copies it onto the `<proxy-auth>` element. It also copies `isRolePermission`, `openEditProfile`, `theme`, `exclude_role_ids` and `include_role_ids`.
2. `ProxyAuthWidgetComponent` passes `authToken` down as a component input. In user management the input is named `userToken`, but it is fed from `authToken`. `config.userToken` is set on the element and never reaches this screen.
3. Each call puts the token in the `proxy_auth_token` header (`OtpService` writes `this.options.headers['proxy_auth_token'] = authToken`). The one exception is `OtpService.getTimezones`, which also sends it as `Authorization`. All account endpoints use the `ProxyBaseUrls.ClientURL` base (`clientUrl`), except OTP send/verify, which use `BaseURL`.
4. The standalone add-member dialog gets its token from the `openAddUserDialog` event's `detail.authToken` (see [widget-embed](./widget-embed.md)).

The widget never refreshes or validates the token. An expired token shows up only as API errors in toasts.

### User management (`UserManagementComponent`)
1. `ngOnInit` dispatches `getCompanyUsers` (page 0, size 50, `exclude_role_ids`/`include_role_ids` from inputs). `OtpService.getCompanyUsers` converts the page index to 1-based `pageNo` and sends `include_role_ids` as the query key `role_ids`. It sends `exclude_role_ids` as `exclude_role_ids`, comma-joined.
2. The `companyUsersData` subscription stores `users`, `totalEntityCount`, `pageNo`, `itemsPerPage` and the three permission flags (see the role model below).
3. Search runs through `searchSubject` with a 300 ms debounce, then calls `getCompanyUsers(search)` on the server. Role and permission search (`applyRoleFilter`, `applyPermissionFilter`) filters on the client.
4. Tabs load on demand in `tabChange`. Roles loads `getRoles` and `getPermissions`, both with `itemsPerPage: 100`. Permissions loads `getPermissions`.
5. One dialog serves every form. The `isEditUser` / `isEditRole` / `isEditPermission` flags select the form. `getSaveAction`, `getDialogTitle` and `getSaveButtonText` branch on the same flags.
6. After a write, each `*Data` selector subscription reloads its list and shows `res.data.message` as a success toast. One `actions$` subscription on the nine `*Error` actions shows the first message found in `errorResponse.error.errors.message`, then `error.data.message`, `errors.message`, `data.message`, `message`.

### Role / permission model
- **Permissions** are named strings owned by the company (`GET/POST c/permission`, `PUT c/permission/:id`). They have `{ id, name }`.
- **Roles** bundle permissions. The roles response is `{ data: { data: Role[], default_roles: { default_member_role, ... } } }`. Each role has `{ id, name, is_default, c_permissions: [{ id, name }] }`. Default roles (`is_default`) show a "Default" badge, and their Edit button is disabled.
- **A member** has one role plus `additionalpermissions` (names) on top of that role's `permissions`. When editing, the dialog offers only permissions the role does not already grant (`getAvailableAdditionalPermissions`).
- **Who can do what** is decided by the backend per caller and returned with the member list:

  | Response field (`companyUsersData.data`) | Gates |
  |---|---|
  | `permissionToAddUser` | "Add member" button (`canAddUser`) |
  | `permissionToEditUser` | per-member Edit button (`canEditUser`) |
  | `permissionToRemoveUser` | per-member Remove button (`canRemoveUser`) |

  The Roles and Permissions tabs show only when the host passes `isRolePermission: true` (input `pass` → `availableTabs`). This is a host-side choice, not a permission check. `organization-details` uses a separate flag: Edit is enabled only when `currentCompany.permissions` includes `'update_c_company'`.

> [!TODO] Needs a human: which backend permission names guard the role/permission endpoints and `c/addUser`? The widget hides buttons only for add/edit/remove member. Anyone the host gives `isRolePermission: true` sees the Roles/Permissions tabs.

### User profile (`UserProfileComponent`)
1. `ngOnInit` dispatches `getUserDetails` (`GET c/getDetails`). The effect stores `data[0]` as `userProfileData`. The form takes `name`, `email` and `mobile`, and turns the literal `'--Not Provided--'` into `''`. `c_companies` drives the organization list. The current company is matched by `currentCompany.company_uname`.
2. With `openEditProfile: true`, the edit dialog opens once, after the first profile load.
3. Changing the mobile: `startEditMobile` → `getOtp` validates with `google-libphonenumber` (digits must include the country code) → `sendOtpAction` → a 4-digit OTP → `verifyOtpAction`. `otp_verification_token` is read from `selectVerifyOtpV2Data`. Resend has a 30 s cooldown.
4. `updateUser` sends `PUT c/updateUser` with `{ user: { name, mobile? }, otp_verification_token? }`. It sends mobile and the token only when the mobile changed. A changed mobile without a verified OTP sets the error `otpVerificationFailed` and stops.
5. Leaving a company: `openModal(org.id)` → confirm → `leaveCompany` (`POST c/inviteAction/leave` with `{ company_id }`) → on `leaveCompanySuccess` the profile reloads.

### Organization details (`OrganizationDetailsComponent`)
1. On init, if `authToken` is set, two requests run in parallel. `getOrganizationDetails` sends `GET c/getDetails?fields=currentCompany` and reads `data[0].currentCompany`. `getTimezones` sends `GET timezones`.
2. Form: `companyName` (`COMPANY_NAME_REGEX`), `email` (`EMAIL_REGEX`), `phoneNumber` (empty or 10–15 digits), `timeZoneName`. Picking a `timeZoneName` sets `timezone` to the matching entry's `offset`.
3. `onSubmit` does nothing if the form is unchanged. Otherwise it sends `PUT c/updateCompany` with `{ company: { name, email, mobile, timezone, timeZoneName } }` and dispatches `organizationDetailsUpdateResponse` on success or failure.

## Contracts

### Backend calls (summary; full list in [api.md](../api.md))
All URL builders are in `apps/36-blocks-widget/src/app/otp/service/urls/otp-urls.ts` (`otpVerificationUrls`). All methods are on `OtpService`.

| Screen | Calls (`otpVerificationUrls` key → path) |
|---|---|
| user-management | `getCompanyUsers` → `c/getCompanyUsers`; `addUser` → `c/addUser`; `createRole` → `c/roles` (GET list + POST create); `updateRole` → `c/roles/:id`; `createPermission` → `c/permission` (GET + POST); `updatePermission` → `c/permission/:id`; `updateUserRole` → `c/updateCUserRole/:id`; `updateUserPermission` → `c/updateCUserPermissions/:id`; `deleteUser` → `c/removeUser/:id` (DELETE) |
| add-user-dialog | `c/roles` (GET), `c/addUser` |
| user-profile | `getUserDetails` → `c/getDetails`; `updateUser` → `c/updateUser`; `leaveCompany` → `c/inviteAction/leave`; `sendOtp` → `otp/send`; `verifyOtpV2` → `otp/verify` |
| organization-details | `c/getDetails?fields=currentCompany`, `timezones`, `updateCompany` → `c/updateCompany` |

Request bodies sent by the screens:
```ts
// addUser (both dialogs)
{ user: { name, email, mobile }, role_id: string /* select value */ }
// createRole — action carries permission NAMES, service posts { name, cPermissions }
{ name, cPermissions: string[] }
// updateRole (PUT c/roles/:id) — body is the whole payload
{ id, name, cpermissions: number[] }
// updateUserRole / updateUserPermission (PUT .../:id, id = member.user_id)
{ id, role_id }            { id, cpermissions: number[] }
// updatePermission (PUT c/permission/:id)
{ name }
```

### What each screen sends back to the host
| Screen | Signal | Shape | When |
|---|---|---|---|
| organization-details | `window` CustomEvent `organizationDetailsUpdateResponse` (bubbles, composed) | `detail: { data, error: boolean }` | after every `updateCompany` response. On error, `data` is `error.error.errors ?? error.error ?? error`. |
| user-profile | `window.parent.postMessage(..., '*')` | `{ type: 'proxy', data: { event: 'userNameUpdated', enteredName } }` | when an update with a changed name is **dispatched** (before the server answers) |
| user-profile | `window.parent.postMessage(..., '*')` | `{ type: 'proxy', data: { event: 'userLeftCompany', companyId } }` | after `leaveCompanySuccess` |
| user-management, add-user-dialog | none | — | Results show only as toasts inside the widget. |

Hosts listen for the `postMessage` events with `window.addEventListener('message', ...)`. Without an iframe, `window.parent === window`. None of these screens call `config.success` / `config.failure`. `UserProfileComponent` declares `successReturn`, `failureReturn`, `target`, `showCard` and `css` inputs, but the widget never binds them and the template never reads them.

## Gotchas

> [!WARNING]
> The `*InProcess` flags for these calls mean "finished", not "loading". The reducer sets `companyUsersDataInProcess: true` on `getCompanyUsersComplete`, and the component computes `isUsersLoading = !isLoaded`. On `getCompanyUsersError` the flag goes back to `false`, so the members skeleton stays up forever after a failed load.

> [!WARNING]
> Role `<select>` values are strings (`role.id.toString()`), but role ids are numbers. `onRoleChange` and `getRoleById` compare with `===`, so they never match. Picking a role does not pre-fill its permissions, and `saveUser`'s `roleName` falls back to the raw id string. `role_id` is sent as a string.

> [!WARNING]
> Editing a member sends only `updateUserRole` and `updateUserPermission`, as two parallel requests that each trigger a refresh and a toast. Name, email and mobile are read-only in edit mode. `saveUser` builds a `userPayload` with name/mobile and never sends it. `updateCompanyUser` (`PUT c/updateUser`) is subscribed to but never dispatched from this screen.

> [!WARNING]
> Write results are deduped with `distinctUntilChanged(isEqual)` on the stored response (`addUserData`, `roleCreateData`, `deleteUserData`, ...). If two consecutive adds return an identical body, the second one does not refresh the list or show a toast. In the same way, `addUserSuccess` stays `true` after a successful add until the next `addUser` or `resetAll`. Reading the code, a second standalone `AddUserDialogComponent` would get `true` on subscribe and close right away.

> [!WARNING]
> `UserManagementComponent.saveUser`, `saveAddRole` and `saveAddPermissionTab` close the dialog right after dispatching. Form input is lost if the API fails, and only an error toast remains. The standalone `AddUserDialogComponent` stays open on error.

> [!WARNING]
> `OtpService.options.headers` is one shared, mutable object. Each method writes `proxy_auth_token` into it, and `setOtpRequestHeaders` deletes or replaces it. Two widget instances with different tokens on one page share the injector-level service and can send each other's token.

> [!WARNING]
> On a failed `updateCompany`, `OrganizationDetailsComponent` calls `showToast(undefined, 'error')`, which returns early. The user sees no error, and only the host gets `organizationDetailsUpdateResponse` with `error: true`. Also, `timeZoneName` falls back to looking the label up in `timezones`, which may not have loaded yet because both requests run in parallel.

> [!WARNING]
> `otpActions.deleteUser` takes a parameter named `companyId`, but the screen passes `user.user_id`. The service puts it into `c/removeUser/:id`. Do not "fix" the screen to pass a company id.

> [!WARNING]
> `user-profile` reuses the shared OTP fields (`getOtpSuccess`, `verifyOtpV2Success`, `apiErrorResponse`). It clears them with `resetAnyState` in `resetMobileOtpState`, which runs on dialog open, cancel and mobile edit. A new flow on this screen must keep that reset, or it will react to an earlier login's OTP success (see [widget-auth](./widget-auth.md#gotchas)).

> [!WARNING]
> `SubscriptionCenterComponent` has no inputs and no members, but `widget.component.html` still binds `[referenceId]`, `[isPreview]`, `[isLogin]`, `[loginRedirectUrl]` and `(togglePopUp)` on it. Its template also reads `subscriptionPlans`, `isPreview()`, `close()` and `selectPlan()`, which no longer exist. Re-enabling the `subscription` case in `viewMode` without restoring the class will break. The live subscription rendering is in `SubscriptionRendererService` ([widget-embed](./widget-embed.md)).

## Why it is built this way
- **Standalone add-member dialog** (commit `ca478dcc`). Hosts want to fire "invite member" from their own UI when `<user-management>` is not on the page. `AddUserDialogComponent` is mounted on `document.body` by `WidgetDialogService`. When the screen *is* mounted, the bridge sends the event to `addUser()`, so the member table refreshes (comment in the `UserManagementComponent` constructor).
- **Roles/Permissions tabs default off** (commit `4aa30c12`, "Disable role permissions tab by default in widget config"). Most hosts only manage members, so the host must opt in with `isRolePermission`.
- **Subscribe, then dispatch** in `updateUser` and `confirmLeave` (commits `ff9e0fbf`, `124a4749`). The success/error subscriptions use `skip(1)` / `take(1)` and are set up before the dispatch, so they react to this request and not to stale store state.
- **Mobile change needs OTP plus a country code** (commits `16b94f28`, `6411ea5b`). The backend requires `otp_verification_token` for a mobile update. `libphonenumber` validation stops numbers without a country code before an OTP is spent.
- **`openEditProfile`** (commit `962c042e`) lets a host deep-link straight into the edit dialog.
- **Subscription center commented out**: the class body was commented out by commit `f79e8b30`.
> [!TODO] Needs a human: is the `subscription` widget type deprecated for good (so the component and template can be deleted) or planned to come back?

## Changing it safely
- **New account screen:** add a `PublicScriptType` value, a branch in `ProxyAuthWidgetComponent.viewMode`, a `@case` in `widget.component.html`, and the type in `authTokenRequiredTypes` in `apps/36-blocks-widget/src/app/init-verification.ts`. Use `ViewEncapsulation.ShadowDom`, and move overlays to `document.body` with `WidgetPortalService.attach` like the existing screens do.
- **New user-management call:** add the URL to `otpVerificationUrls`, the method to `OtpService`, the action/effect/reducer/selector trio in `apps/36-blocks-widget/src/app/otp/store/`, then subscribe in the component and add the `*Error` action to the shared error `ofType` list. Check which response field the effect treats as success: user-management effects test `res.status === 'success'`, while profile effects test `res.type !== 'error'`.
- **Changing an event payload** (`organizationDetailsUpdateResponse`, `userNameUpdated`, `userLeftCompany`) breaks host pages. Treat it as a public API change and update [api.md](../api.md).
- Check by hand with the dev harness (`apps/36-blocks-widget/src/app/app.component.ts`: set `TYPE` and an auth token). There are no unit tests for these screens.
