# proxy-ui — Angular Upgrade Plan & Architecture Guide

> **Created:** Feb 26, 2026  
> **Author:** Divyanshu (via Cascade AI pair programming session)  
> **Scope:** Project onboarding, architecture overview, and Angular 14 → 17 migration plan

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Flow](#2-architecture--flow)
3. [NX Monorepo Structure](#3-nx-monorepo-structure)
4. [The 3 Apps Explained](#4-the-3-apps-explained)
5. [State Management (NgRx)](#5-state-management-ngrx)
6. [User Journey Flow](#6-user-journey-flow)
7. [Angular Upgrade Decision](#7-angular-upgrade-decision)
8. [Dependency Safety Report — v14 → v17](#8-dependency-safety-report--v14--v17)
9. [Step-by-Step Migration Plan](#9-step-by-step-migration-plan)
10. [2 Package Replacements Required](#10-2-package-replacements-required)

---

## 1. Project Overview

**proxy-ui** is a platform for managing OTP verification, authentication, user management, project features, logs, and dashboards. It is built with **Angular 14 + NX 15 Monorepo**.

### Current Stack

| Technology | Version |
|---|---|
| Angular | 14.2.2 |
| NX | 15.0.3 (`@nrwl/*`) |
| TypeScript | 4.8.4 |
| Zone.js | 0.11.5 |
| RxJS | ~7.5.7 |
| NgRx | 14.x |
| Angular Material | 14.2.2 |
| Firebase | 9.16.0 |
| @angular/fire | 7.5.0 |

---

## 2. Architecture & Flow

```
proxy-ui/
├── apps/                        ← 3 Angular Applications
│   ├── proxy/                   ← Main Admin Dashboard App
│   ├── proxy-auth/              ← OTP Auth Widget (Web Component / Angular Element)
│   └── proxy-auth-element/      ← Build variant of auth element
│
└── libs/                        ← Shared Libraries (used by all apps)
    ├── models/                  ← TypeScript interfaces/models
    ├── services/                ← API service calls
    ├── urls/                    ← API URL constants
    ├── pipes/                   ← Angular pipes
    ├── directives/              ← Angular directives
    ├── ui/                      ← Reusable UI components
    ├── constant/                ← App-wide constants
    ├── utils/                   ← Utility functions
    └── shared/                  ← Shared modules
```

### NX Path Aliases

All libs are available via `@proxy/...` aliases (defined in `tsconfig.base.json`):

```typescript
// Clean NX import (instead of ../../../../)
import { ServicesProxyAuthModule } from '@proxy/services/proxy/auth';
import { IProjects } from '@proxy/models/logs-models';
```

---

## 3. NX Monorepo Structure

NX is a **monorepo manager**. Instead of 3 separate Angular repos, everything lives in one repo with shared libraries.

- `apps/` — deployable Angular applications
- `libs/` — reusable Angular modules (like local npm packages)
- `node_modules/` — single shared node_modules for all apps
- `workspace.json` — lists all projects and their paths
- `nx.json` — NX configuration, task runner, caching settings
- `tsconfig.base.json` — defines `@proxy/*` path aliases

---

## 4. The 3 Apps Explained

### `apps/proxy` — Main Admin Dashboard

Full Angular SPA for internal admin use.

**Boot Flow:**
```
main.ts
  └── bootstraps AppModule
        └── AppComponent (proxy-root)
              └── RouterModule loads routes lazily
```

**Route Structure (`app.routes.ts`):**
```
/              → redirects to /login
/login         → AuthModule (lazy loaded)
/app           → LayoutModule (lazy, 🔒 Firebase Auth Guard)
/project       → CreateProjectModule (lazy, 🔒 Firebase Auth Guard)
/p             → PublicModule (no auth)
```

**Inside `/app` — LayoutModule (main shell after login):**
```
/app
  └── LayoutComponent (sidebar + toolbar)
        ├── /app/dashboard  → DashboardModule
        ├── /app/logs       → LogsModule
        ├── /app/features   → FeaturesModule
        ├── /app/users      → UsersModule
        └── /app/chatbot    → ChatbotComponent
```

**Route Guards:**
- `AngularFireAuthGuard` — checks Firebase login state
- `CanActivateRouteGuard` — checks role/permissions
- `ProjectGuard` — checks if user has projects; redirects to `/project` if none

---

### `apps/proxy-auth` — OTP Auth Web Component (Widget)

This is **NOT a regular Angular SPA** visited in a browser. It is compiled as a **Web Component (Angular Element)** and embedded on external client websites.

**How it works:**
```
External website calls:
  window.initVerification({ referenceId: '...', success: fn })
       ↓
  Creates <proxy-auth> custom HTML element dynamically
       ↓
  Angular's SendOtpComponent renders inside it
       ↓
  User sees OTP / auth widget on the external site
```

The `element.module.ts` registers `proxy-auth` as a browser Custom Element via `createCustomElement()`. This is the Angular Elements API — it converts an Angular component into a native Web Component usable on any website.

**Supported types via `window.initVerification`:**
- `""` — Standard OTP flow
- `"user-management"` — User management panel
- `"organization-details"` — Organization details form
- `"subscription"` — Subscription management

---

### `apps/proxy-auth-element` — Build Variant

Alternative build configuration for the auth element. Produces the same web component output with different build settings.

---

## 5. State Management (NgRx)

The main `proxy` app uses **NgRx** (Redux pattern for Angular):

```
User Action (click/event)
      ↓
  dispatch(Action)        ← e.g. rootActions.getAllProject()
      ↓
  Effects (side effects)  ← makes HTTP API call via services
      ↓
  Reducer                 ← updates Store state
      ↓
  Selector                ← component reads updated state
      ↓
  Component re-renders
```

**State Slices:**
- `auth` — login/logout state (Firebase user data)
- `root` — app-level state (projects list, client settings, header title)

**Special — `clearStateMetaReducer`:**  
On `logoutAction`, the entire NgRx state is wiped to an empty object — clean slate on logout.

```typescript
// apps/proxy/src/app/ngrx/store/app.state.ts
export function clearStateMetaReducer<State>(reducer) {
    return function (state, action) {
        if (action.type === logoutAction.type) {
            state = {} as State; // Full state reset on logout
        }
        return reducer(state, action);
    };
}
```

---

## 6. User Journey Flow

```
1. User visits /
        ↓
2. Redirects to /login  (AuthModule loads)
        ↓
3. User logs in via Firebase
        ↓
4. AngularFireAuthGuard allows access to /app
        ↓
5. ProjectGuard checks NgRx store for projects
   ├── No projects? → redirect to /project (CreateProjectModule)
   └── Has projects? → proceed to /app/dashboard
        ↓
6. LayoutComponent renders (sidebar + toolbar shell)
        ↓
7. User navigates between:
   dashboard / logs / features / users / chatbot
```

---

## 7. Angular Upgrade Decision

### Why Upgrade?

| Trigger | Should Upgrade? |
|---|---|
| Angular 14 hits end-of-security-support | ✅ Yes — security vulnerability risk |
| A critical dependency drops Angular 14 support | ✅ Yes |
| A client requests Angular 18+ features (Signals, SSR) | ✅ Yes |
| "Just to be on latest" | ❌ Not worth the risk |

### Why NOT Jump Directly to v21?

1. **Clients use the Web Component** — Any bundle format or CSS change in `proxy-auth` can break embedded client integrations silently.
2. **Angular Material MDC** — The v15 upgrade completely changes Material component DOM/CSS. All custom SCSS will need review.
3. **`@angular/fire` compat removal** — v18+ drops the `@angular/fire/compat` API entirely, requiring a full Firebase auth rewrite.
4. **3 abandoned packages** in v21 path require full replacements.

### Chosen Target: v17 ✅

**Why v17 is the right first milestone:**
- All major dependencies have stable v17 versions
- `@angular/fire` compat module is **still available** in v17 (no rewrite needed)
- `ng-hcaptcha` officially supports up to v17 (last supported version)
- Improved Ivy-only build (~30% smaller bundles, no `ngcc`)
- Angular Signals available but optional (no forced migration)
- Lower risk than v18+ (no compat removals)

### Angular 14 → 21 Cannot Be Done in One Step

You MUST upgrade one major version at a time:
```
14 → 15 → 16 → 17   ← Stop here first
```
Then later: `17 → 18 → 19 → 20 → 21`

---

## 8. Dependency Safety Report — v14 → v17

### ✅ Safe — Clean v17 Versions Available

| Package | Current | Target |
|---|---|---|
| `@angular/*` | 14.2.2 | 17.x |
| `@angular/material` + `cdk` | 14.2.2 | 17.x |
| `@ngrx/*` (store, effects, entity, router-store, etc.) | 14.x | 17.x |
| `primeng` | 14.2.2 | 17.x |
| `ngx-cookie-service` | 14.0.1 | 17.x |
| `ngx-markdown` | 14.0.1 | 17.x |
| `@abacritt/angularx-social-login` | 1.2.5 | 2.2.x |
| `@angular/fire` | 7.5.0 | 17.x (compat still present ✅) |
| `firebase` | 9.16.0 | 10.x |
| `highcharts-angular` | 3.0.0 | 3.x (legacy-peer-deps) |
| `ng-hcaptcha` | ^2.6.0 | stays ^2.6.0 (officially supports v17) |
| `ng-otp-input` | 1.8.5 | 2.x (requires Angular 16+) |
| `ngrx-store-localstorage` | 14.0.0 | 17.x / 18.x |
| `zone.js` | 0.11.5 | 0.14.x |
| `rxjs` | ~7.5.7 | ~7.8.x |
| `typescript` | 4.8.4 | 5.2.x |

### ⚠️ Requires Replacement (2 packages)

| Package | Issue | Replacement |
|---|---|---|
| `@angular-material-components/datetime-picker` | Abandoned — last published 3 years ago, max Angular 16 | `@danielmoncada/angular-datetime-picker@17.x` (maintained fork, identical API) |
| `@materia-ui/ngx-monaco-editor` | Abandoned — stopped at Angular 13 | `ngx-monaco-editor-v2@17.x.x` (active fork) |

### ✅ No Angular Peer Dependency — No Changes Needed

`chart.js`, `crypto-js`, `dayjs`, `d3-*`, `highcharts`, `lodash-es`, `socket.io-client`, `tributejs`, `jssip`, `recordrtc`, `intl-tel-input`, `google-libphonenumber`, `froala-editor`

---

## 9. Step-by-Step Migration Plan

### Environment Prerequisites

| Angular Version | Node.js | TypeScript | Zone.js |
|---|---|---|---|
| v15 | 14.20.x / 16.13.x / 18.10.x | 4.8+ | 0.12.x |
| v16 | 16.x / 18.x | 4.9.3+ | 0.13.x |
| **v17** | **18.13.0+** | **5.2+** | **0.14.x** |

> Upgrade Node.js to **v18.13.0 LTS or higher** before starting.

---

### Step 1 — v14 → v15 (branch: `angular-v15-migration`)

```bash
npx nx migrate @nrwl/workspace@15
npx nx migrate --run-migrations
npx ng update @angular/core@15 @angular/cli@15
npx ng update @angular/material@15
```

**Code changes required:**
- Remove `enableIvy` from all `tsconfig.json` files
- Change `DATE_PIPE_DEFAULT_TIMEZONE` → `DATE_PIPE_DEFAULT_OPTIONS`
- Update `RouterLinkWithHref` → `RouterLink`
- **Visual review required** — Angular Material MDC refactor changes all component DOM/CSS at this step

---

### Step 2 — v15 → v16 (branch: `angular-v16-migration`)

```bash
npx nx migrate @nrwl/workspace@16
npx nx migrate --run-migrations
npx ng update @angular/core@16 @angular/cli@16
npx ng update @angular/material@16
```

**Code changes required:**
- **Remove `ngcc` from `postinstall` script in `package.json`** (ngcc is removed in v16):
  ```json
  // DELETE this line:
  "postinstall": "ngcc --properties es5 browser module main --first-only --create-ivy-entry-points"
  ```
- Upgrade `zone.js` → `0.13.x`
- Remove `BrowserTransferStateModule` references
- Replace `ReflectiveInjector` → `Injector.create`
- `@nrwl/*` → `@nx/*` package rename begins (NX handles this automatically)

---

### Step 3 — v16 → v17 (branch: `angular-v17-migration`)

```bash
npx nx migrate @nx/workspace@17
npx nx migrate --run-migrations
npx ng update @angular/core@17 @angular/cli@17
npx ng update @angular/material@17
```

**Code changes required:**
- Upgrade TypeScript → `5.2.x`, `zone.js` → `0.14.x`
- Fix Zone.js import paths:
  - `zone.js/dist/zone` → `zone.js`
  - `zone.js/bundles/zone-testing.js` → `zone.js/testing`
- `AnimationDriver.NOOP` → `NoopAnimationDriver`
- Check templates for `NgSwitch` equality (now uses `===` instead of `==`)
- Configure router properties (`titleStrategy`, `urlHandlingStrategy`, etc.) via `provideRouter()` instead of `Router` public API
- **Replace the 2 abandoned packages** (see Section 10)

---

## 10. 2 Package Replacements Required

Both replacements affect only **4 source files total** — very contained scope.

### Replacement 1: `@angular-material-components/datetime-picker` → `@danielmoncada/angular-datetime-picker`

**Install:**
```bash
npm uninstall @angular-material-components/datetime-picker @angular-material-components/moment-adapter
npm install @danielmoncada/angular-datetime-picker@17.x
```

**Files to update (import path change only):**
- `libs/ui/time-picker/src/lib/ui-time-picker.module.ts`
- `libs/directives/open-datepicker-on-focus-directive/src/lib/directives-open-datepicker-on-focus-directive.module.ts`

```typescript
// Before
import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';

// After
import { NgxMatDatetimePickerModule } from '@danielmoncada/angular-datetime-picker';
```

---

### Replacement 2: `@materia-ui/ngx-monaco-editor` → `ngx-monaco-editor-v2`

**Install:**
```bash
npm uninstall @materia-ui/ngx-monaco-editor
npm install ngx-monaco-editor-v2@17.x.x
```

**Files to update:**
- `libs/ui/editor/src/lib/editor.component.ts`
- `libs/ui/editor/src/lib/ui-editor.module.ts`

```typescript
// Before
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';

// After
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
```

---

## Key Rules for the Migration

1. **One major version at a time** — never skip versions
2. **Separate git branch per version hop** — easy rollback if needed
3. **Test + visual review after every hop** — especially after v15 (Material MDC)
4. **Do NOT touch `@angular/fire` compat API** until v18+ migration (it still works in v17)
5. **Run `nx migrate --run-migrations` after every `nx migrate`** — this applies automated code transforms

---

*End of document.*
