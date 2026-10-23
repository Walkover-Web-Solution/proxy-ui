---
verified_at: 76f26ae5
verified_on: 2026-10-14
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

Open questions the code can't answer. Answer them in the doc that asks, then delete the TODO.

- **Branching:** which branch to cut `-clean` from, and whether `main` and `development` are retired ([conventions.md](conventions.md#branching-and-release)).
- **Deploy and CI:**
  - the deploy target and the branch-to-environment mapping ([architecture.md](architecture.md#build), [environment.md](environment.md))
  - whether CI "Build check" passes ([environment.md](environment.md))
  - whether the `postbuild.js` hash regex matches upper-case hashes ([environment.md](environment.md))
  - whether stage `production: false` is intended ([environment.md](environment.md))
- **SSR:** why it was removed, and whether the leftover files can be deleted ([modules/app-shell.md](modules/app-shell.md)).
- **Auth:**
  - whether the backend rejects `Bearer` ([modules/shared-libs.md](modules/shared-libs.md))
  - the missing redirect after email login, and whether `/login` can return 401 ([flows/dashboard-login.md](flows/dashboard-login.md))
- **Widget:**
  - client-side AES with static keys ([modules/widget-auth.md](modules/widget-auth.md))
  - whether MSG91 and callback errors should reach the host's `failure` ([modules/widget-auth.md](modules/widget-auth.md), [flows/widget-verification.md](flows/widget-verification.md))
  - whether Tailwind preflight leaks into host pages, and whether `webpack.config.js` is dead ([modules/widget-embed.md](modules/widget-embed.md))
  - which backend permissions guard the role/permission endpoints, and the future of the `subscription` type ([modules/widget-account.md](modules/widget-account.md))
- **Blocks:** whether `feature_id` 1/2 are stable, and the dead Lago helpers ([modules/panel-features.md](modules/panel-features.md)).
- **Panel:** whether Logs is still a supported product, and which payment provider sits behind checkout ([modules/panel-ops.md](modules/panel-ops.md)).
- **UI:** the rule for where state goes ([ui/state.md](ui/state.md)) and the `@apply` opacity limit ([ui/design-system.md](ui/design-system.md)).
