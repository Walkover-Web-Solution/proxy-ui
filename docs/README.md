---
verified_at: 395659d5
verified_on: 2026-10-29
---
# Docs index

Start with [../AGENTS.md](../AGENTS.md), then read the doc for the area you're changing. Every path and symbol in these docs was checked against the code at the commit in each doc's frontmatter.

## Cross-cutting

| Doc | Read it when |
|---|---|
| [architecture.md](architecture.md) | You need the big picture: the two apps, startup, layers, the request path, the build, external systems |
| [conventions.md](conventions.md) | You're adding a file, a page or an HTTP call, or opening a PR (branch flow, CI gap) |
| [glossary.md](glossary.md) | A name looks ambiguous: block/feature, `id` vs `reference_id`, client vs project, the two `authToken`s |
| [api.md](api.md) | You're touching the widget's public JS API (`initVerification`, callbacks, window events) or any backend call |
| [environment.md](environment.md) | You're running or building locally, adding an env key, or touching CI or `tools/` |
| [recipes.md](recipes.md) | You're making a common change: a page, a backend call, a block tab, a widget config key or screen, an env value, a lib, a release |
| [decisions.md](decisions.md) | You want to know why something is built the way it is before changing it: the single-file widget, two HTTP wrappers, build-time config, per-page stores, no Nx Cloud |
| [open-questions.md](open-questions.md) | You hit something the code can't explain. Every open question for a human, linked to the doc that holds the detail |

## Modules

| Doc | Read it when |
|---|---|
| [modules/app-shell.md](modules/app-shell.md) | Dashboard bootstrap, auth token handling, guards, the root store, website pages, the dead SSR files |
| [modules/panel-features.md](modules/panel-features.md) | The block create/manage wizard, plans and taxes, OAuth clients, widget preview and snippet |
| [modules/panel-ops.md](modules/panel-ops.md) | Panel layout, client switching, the dashboard analytics page, users and roles, logs, billing, onboarding |
| [modules/shared-libs.md](modules/shared-libs.md) | Anything in `libs/`: aliases, HTTP wrappers, ErrorInterceptor, proxy services, `BaseResponse`, constants |
| [modules/widget-embed.md](modules/widget-embed.md) | The widget's global API, bootstrap, shadow DOM and CSS isolation, window events, the single-file build |
| [modules/widget-auth.md](modules/widget-auth.md) | Widget login, register, OTP, OAuth consent, the `otp` store, encryption |
| [modules/widget-account.md](modules/widget-account.md) | Widget user-management, user-profile and organization-details screens |

## Flows

| Doc | Read it when |
|---|---|
| [flows/dashboard-login.md](flows/dashboard-login.md) | Email or Google login, onboarding redirect, boot with an existing session, 401 handling, client switch, logout |
| [flows/feature-configuration.md](flows/feature-configuration.md) | A block from creation to its manage tabs to the snippet a customer pastes |
| [flows/widget-verification.md](flows/widget-verification.md) | A host page loading proxy-auth.js through to the user being logged in and the host callbacks |

## UI

| Doc | Read it when |
|---|---|
| [ui/routes.md](ui/routes.md) | Adding or changing a dashboard route or guard |
| [ui/state.md](ui/state.md) | Deciding where state lives: global NgRx, ComponentStore or signals |
| [ui/components.md](ui/components.md) | Looking for an existing shared component, directive or pipe before writing one |
| [ui/design-system.md](ui/design-system.md) | Styling: Tailwind v4, SCSS layout, dark mode in both apps, the widget's `w-*` classes |

## Replaced docs

The older notes (docs/widget-*.md, docs/build-modernization.md, docs/angular-*.md, docs/standalone-migration-progress.md) were removed when this set was written; they are still in git history. Their still-true content (rationale, runbooks, the widget contract) now lives in the docs above. `README.md` (branch flow, style guide) and `DESIGNGUIDE.md` are largely stale; [conventions.md](conventions.md) and [ui/design-system.md](ui/design-system.md) hold the current versions.

## Needs a human

Open questions the code can't answer are collected in [open-questions.md](open-questions.md), and each one is also a `[!TODO]` in the doc it concerns. Answer it in that doc, then delete the TODO and the line in open-questions.md.

## Where the standard doc names live

Some agent guides expect files named ARCHITECTURE, FLOWS, CONFIGURATION, DECISIONS and OPEN_QUESTIONS. In this repo they map to the existing lower-case files, so there is one source of truth per topic and no case-only name clashes on case-insensitive file systems:

| Expected | Here |
|---|---|
| ARCHITECTURE.md (modules, data, who calls whom) | [architecture.md](architecture.md), with per-module detail in [modules/](#modules) |
| FLOWS.md (main flows step by step) | [flows/](#flows): [dashboard-login](flows/dashboard-login.md), [feature-configuration](flows/feature-configuration.md), [widget-verification](flows/widget-verification.md) |
| CONFIGURATION.md (every setting and env var) | [environment.md](environment.md) |
| DECISIONS.md | [decisions.md](decisions.md) |
| OPEN_QUESTIONS.md | [open-questions.md](open-questions.md) |
