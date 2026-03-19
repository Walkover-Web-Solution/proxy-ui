# Standalone Component Migration Progress

## Overview
Migrating all Angular components from `standalone: false` (NgModule-declared) to standalone components. Each component gets `imports: []` in its `@Component` decorator. NgModules are converted to shims (empty `declarations`, components moved to `imports`).

**Branch:** `angular-v21-migration`
**Last verified build:** ✅ Both `proxy` and `proxy-auth` pass

---

## ✅ Completed — `libs/` (all done)

| File | Change |
|---|---|
| `libs/directives/mark-all-as-touched/src/lib/directives-mark-all-as-touched.module.ts` | `MarkAllAsTouchedDirective` → standalone; module → shim |
| `libs/directives/remove-character-directive/src/lib/directives-remove-character-directive.module.ts` | `RemoveCharacterDirective` → standalone; module → shim |
| `libs/directives/skeleton/src/lib/skeleton/skeleton.component.ts` | `SkeletonComponent` → standalone; `inject()` migration |
| `libs/directives/skeleton/src/lib/skeleton/skeleton.directive.ts` | `SkeletonDirective` → standalone; `inject()` migration |
| `libs/directives/skeleton/src/lib/directives-skeleton.module.ts` | module → shim |
| `libs/directives/auto-select-dropdown/src/lib/directives-auto-select-dropdown.module.ts` | `AutoSelectDropDownDirective` already standalone; module → shim |

> All other `libs/ui/*` components (loader, no-record-found, confirm-dialog, search, date-range-picker, mat-paginator-goto, player, virtual-scroll, prime-ng-toast, copy-button) were migrated to standalone in a prior session — modules converted to shims.

---

## ✅ Completed — `apps/proxy/` (this session)

### Components made standalone

| Component | File |
|---|---|
| `AppComponent` | `apps/proxy/src/app/app.component.ts` |
| `DashboardComponent` | `apps/proxy/src/app/dashboard/dashboard.component.ts` |
| `RegistrationComponent` | `apps/proxy/src/app/registration/registration.component.ts` |
| `AuthComponent` | `apps/proxy/src/app/auth/auth.component.ts` |
| `RegisterComponent` | `apps/proxy/src/app/register/register.component.ts` |
| `LayoutComponent` | `apps/proxy/src/app/layout/layout.component.ts` |
| `MainLeftSideNavComponent` | `apps/proxy/src/app/layout/main-left-side-nav/main-left-side-nav.component.ts` |
| `ChatbotComponent` | `apps/proxy/src/app/chatbot/chatbot.component.ts` |
| `LogComponent` | `apps/proxy/src/app/logs/log/log.component.ts` |
| `LogsDetailsSideDialogComponent` | `apps/proxy/src/app/logs/log-details-side-dialog/log-details-side-dialog.component.ts` |
| `FeatureComponent` | `apps/proxy/src/app/features/feature/feature.component.ts` |
| `CreateFeatureComponent` | `apps/proxy/src/app/features/create-feature/create-feature.component.ts` |
| `SimpleDialogComponent` | `apps/proxy/src/app/features/create-feature/simple-dialog/simple-dialog.component.ts` |
| `CreatePlanDialogComponent` | `apps/proxy/src/app/features/create-feature/create-plan-dialog/create-plan-dialog.component.ts` |
| `CreateTaxDialogComponent` | `apps/proxy/src/app/features/create-feature/create-tax-dialog/create-tax-dialog.component.ts` |
| `UserComponent` | `apps/proxy/src/app/users/user/user.component.ts` |
| `ManagementComponent` | `apps/proxy/src/app/users/management/management.component.ts` |
| `CreateProjectComponent` | `apps/proxy/src/app/create-project/create-project.component.ts` |

### NgModules converted to shims

| Module | File |
|---|---|
| `AppModule` | `apps/proxy/src/app/app.module.ts` |
| `DashboardModule` | `apps/proxy/src/app/dashboard/dashborad.module.ts` |
| `RegistrationModule` | `apps/proxy/src/app/registration/registration.module.ts` |
| `AuthModule` | `apps/proxy/src/app/auth/auth.module.ts` |
| `RegisterModule` | `apps/proxy/src/app/register/register.module.ts` |
| `LayoutModule` | `apps/proxy/src/app/layout/layout.module.ts` |
| `LogsModule` | `apps/proxy/src/app/logs/logs.module.ts` |
| `FeaturesModule` | `apps/proxy/src/app/features/features.module.ts` |
| `CreateFeatureModule` | `apps/proxy/src/app/features/create-feature/create-feature.module.ts` |
| `UsersModule` | `apps/proxy/src/app/users/users.module.ts` |
| `CreateProjectModule` | `apps/proxy/src/app/create-project/create-project.module.ts` |

---

## ⏳ Remaining — `apps/proxy/`

Check if any components still have `standalone: false`:

```bash
grep -r "standalone: false" apps/proxy/src --include="*.ts"
```

Likely remaining (not yet verified):
- Any components inside `apps/proxy/src/app/chatbot/` sub-routes (if any)
- Any components inside `apps/proxy/src/app/ngrx/` (if any are components)

---

## ✅ Completed — `apps/proxy-auth/`

### Components made standalone

| Component | File |
|---|---|
| `AppComponent` | `apps/proxy-auth/src/app/app.component.ts` |
| `SendOtpComponent` | `apps/proxy-auth/src/app/otp/send-otp/send-otp.component.ts` |
| `SendOtpCenterComponent` | `apps/proxy-auth/src/app/otp/component/send-otp-center/send-otp-center.component.ts` |
| `RegisterComponent` | `apps/proxy-auth/src/app/otp/component/register/register.component.ts` |
| `LoginComponent` | `apps/proxy-auth/src/app/otp/component/login/login.component.ts` |
| `SubscriptionCenterComponent` | `apps/proxy-auth/src/app/otp/component/subscription-center/subscription-center.component.ts` |
| `UserProfileComponent` | `apps/proxy-auth/src/app/otp/user-profile/user-profile.component.ts` |
| `ConfirmationDialogComponent` | `apps/proxy-auth/src/app/otp/user-profile/user-dialog/user-dialog.component.ts` |
| `UserManagementComponent` | `apps/proxy-auth/src/app/otp/user-management/user-management.component.ts` |
| `OrganizationDetailsComponent` | `apps/proxy-auth/src/app/otp/organization-details/organization-details.component.ts` |

### NgModules converted to shims

| Module | File |
|---|---|
| `AppModule` | `apps/proxy-auth/src/app/app.module.ts` |
| `OtpModule` | `apps/proxy-auth/src/app/otp/otp.module.ts` |
| `UserDialogModule` | `apps/proxy-auth/src/app/otp/user-profile/user-dialog/user-dialog.module.ts` |

---

## ✅ Final Status

```
grep -r "standalone: false" apps/ --include="*.ts"
# → No results. All components are standalone.
```

Both builds verified passing:
- `nx build proxy` ✅
- `nx build proxy-auth` ✅

---

## ⏳ Next Steps

### 1. Migrate `@Input()` / `@Output()` decorators → signals
Components still using `@Input()` / `@Output()` decorators can be migrated to `input()` / `output()` / `model()` signals (Angular v17+ API). This is a separate phase.

Find candidates:
```bash
grep -r "@Input()\|@Output()" apps/ libs/ --include="*.ts" -l
```

### 2. Remove shim NgModules entirely (future)
Once all consumers import standalone components directly, the shim NgModules can be deleted entirely.

### 3. Migrate constructor injection → `inject()` function
Components still using constructor-based DI can be updated to use `inject()`.

```bash
grep -rn "constructor(" apps/ libs/ --include="*.ts" -l
```

---

## Warnings (non-blocking, pre-existing)

- Bundle initial budget exceeded (~2MB vs 500KB limit) — pre-existing
- `auth.component.scss` and `create-feature.component.scss` CSS budget exceeded — pre-existing
- `LogsDetailsSideDialogComponent` and dialog components in `imports` show NG8113 warning (opened via `MatDialog`, not used directly in template) — expected, not an error
