---
covers: [".prettierrc.json", "package.json", ".husky/pre-commit", "apps/*/.eslintrc.json", ".eslintrc.json", ".github/workflows/main.yml", "tsconfig.base.json"]
verified_at: 395659d5
verified_on: 2026-10-29
---
# Conventions

These are the rules this repo actually follows. They are checked against the code, not taken from the old style guide in `README.md`, much of which no longer applies (NgModules, a 400-line file limit, Jitsi).

## Formatting and lint

- Prettier runs on commit: `.husky/pre-commit` runs `npx lint-staged`, which runs `prettier --write` on `*.{html,scss,ts,json}`. `.prettierrc.json` sets single quotes, 4-space indent, a 120-column print width and `trailingComma: es5`. Don't hand-format against it.
- The component/directive selector prefix is `proxy` (`apps/36-blocks/.eslintrc.json`, `apps/36-blocks-widget/.eslintrc.json`), e.g. `proxy-root`. A few widget screens use unprefixed selectors (`user-profile`, `user-management`); don't copy that.
- File names follow `<feature>.<type>.ts` in dash-case. Some libs keep legacy `<name>.module.ts` names that now hold standalone classes or services (e.g. `libs/services/proxy/auth/src/lib/services-proxy-auth.module.ts`). No `@NgModule` is declared anywhere; don't add one.

## Angular style

- Write new code as standalone components, using `inject()` and signal `input()` / `output()`. Signal inputs outnumber `@Input()` about 3 to 1.
  > [!WARNING]
  > Keep `@Input()` on `apps/36-blocks-widget/src/app/otp/widget/widget.component.ts:ProxyAuthWidgetComponent`. Angular Elements turns its inputs into properties of the `<proxy-auth>` element, and `apps/36-blocks-widget/src/app/init-verification.ts` sets those properties. Check the custom element before migrating them.
- Page state lives in a `<page>.store.ts` ComponentStore next to the page (`apps/36-blocks/src/app/panel/**`). Global NgRx is kept for clients, projects and auth. The widget has one global `otp` slice. Where each kind of state goes: [ui/state.md](ui/state.md).
- Components that need teardown extend `libs/ui/base-component/src/lib/base-component/base.component.ts:BaseComponent` and use `takeUntil(this.destroy$)`. An override of `ngOnDestroy` must call `super.ngOnDestroy()`.
- Dialog components opened with `MatDialog.open()` don't go in a component's `imports`; listing them gives NG8113 "unused standalone import" warnings.

## Where things go

| Kind | Location |
|---|---|
| Dashboard page | `apps/36-blocks/src/app/panel/<page>/` (component + `<page>.store.ts`), routed from `apps/36-blocks/src/app/panel/panel.routes.ts`. Never use `apps/36-blocks/src/app/panel/layout/layout.routes.ts`: nothing imports it. |
| Public website page | `apps/36-blocks/src/app/website/<page>/`, routed from `apps/36-blocks/src/app/website/website.routes.ts`, and added to the `websiteRoutes` list in `apps/36-blocks/src/app/app.component.ts` |
| Dashboard backend call | URL in `libs/urls/<domain>/`, method in `libs/services/proxy/<domain>/`, types in `libs/models/<domain>/` (exception: billing keeps its own in `apps/36-blocks/src/app/panel/billing/`) |
| Widget backend call | `apps/36-blocks-widget/src/app/otp/service/otp.service.ts:OtpService`, with URLs in `apps/36-blocks-widget/src/app/otp/service/urls/otp-urls.ts` |
| Widget public constants | `libs/constant/src/verification/verification.ts` (add values; never rename) and `libs/constant/src/widget-events.ts` |
| Shared component | `libs/ui/<name>/`, plus an `@proxy/...` alias in `tsconfig.base.json` |

Step-by-step versions are in [recipes.md](recipes.md).

## HTTP and errors

- Proxy services return the wrapper Observable unchanged. The store or effect checks `res.hasError` in `map` (a 200 can carry an error) **and** handles errors in `catchError`. The pattern is in `apps/36-blocks/src/app/core/ngrx/effects/root/root.effect.ts`.
- Widget effects don't agree on how they detect success: `res.type !== 'error'`, `res.status === 'success'` and `res.hasError` are all used. Match the endpoint you're calling; see [modules/widget-auth.md](modules/widget-auth.md).
- A dashboard endpoint called before login must be added to the allow-list in `libs/services/interceptor/error-interceptor`; otherwise it is silently dropped. See [modules/shared-libs.md](modules/shared-libs.md).
- In the widget, copy `OtpService.options` before adding per-call headers, because the shared headers object leaks into later calls.
- Show user-facing errors as toasts: `libs/ui/prime-ng-toast` on the dashboard, `apps/36-blocks-widget/src/app/otp/service/toast.service.ts` in the widget.

## Widget-specific rules

- No dynamic `import()` anywhere in `apps/36-blocks-widget`. It creates a `chunk-*` file that `apps/36-blocks-widget/build-elements.js` leaves out of proxy-auth.js, and the bundle breaks on customer sites.
- Put new widget CSS in component styles (shadow-scoped). `apps/36-blocks-widget/src/styles.scss` is also injected into the host page's `<head>`.
- Build overlays and dialogs with `WidgetPortalService` / `WidgetDialogService`, not raw fixed-position elements.
- Use the `w-*` classes from `apps/36-blocks-widget/src/assets/scss/widget-ui.scss` first, and give each new one a `.dark &` block. The `@apply` limits and dark-mode variants are in [ui/design-system.md](ui/design-system.md).

## Branching and release

The flow used in practice, from merged PRs #620–#661:

1. Cut `<card-id>-clean` (e.g. `P0091-clean`). This branch is the single source of truth for the card.
2. Open a PR `<card>-clean` → `stage`. If it conflicts, cut `<card>-test` / `<card>-stage` from the target and merge `-clean` into it. Never pull an integration branch into `-clean`, and never resolve conflicts in the GitHub UI.
3. Release with `stage` → `production`. If that conflicts, use a `<card>-prod` branch → `production`. Hotfixes sometimes go straight to `production`; any revert must also land on `stage`, or the next release brings the change back (this happened with the retry interceptor, #642 → #639).

> [!WARNING]
> `README.md` still describes `development` → `main` → `production`. `main` (last merged 2026-04-21) and `development` (2026-04-27) are stale. `.github/workflows/main.yml` runs only on PRs to `development`, `main` and `production`, so **PRs into `stage` get no CI build**. Where it does run, it currently fails on every PR because `env-variables.ts` is never generated ([environment.md](environment.md#ci-githubworkflowsmainyml-build-check)). Build locally before you open one.

> [!TODO] Needs a human: confirm which branch new `-clean` branches should be cut from now (`stage` or `production`), and whether `main` / `development` are retired.

## Upgrading Angular / Nx

- Upgrade one major version at a time, on its own branch. Run `nx migrate` and then `nx migrate --run-migrations`, and visually check the widget on a host page after each step.
- Bump `@angular/fire` and `firebase` together with Angular. They bring their own rxjs, and a mismatch causes deep `Observable` type errors.
- Install with `--legacy-peer-deps`, as CI does (`npm ci --audit false --legacy-peer-deps`).
