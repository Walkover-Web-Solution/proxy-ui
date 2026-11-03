---
covers: ["tailwind.config.js", "apps/shared/scss/**", "apps/shared/assets/utils/intl-tel-input-custom.scss", "apps/36-blocks/src/styles.scss", "apps/36-blocks/src/assets/scss/**", "apps/36-blocks/src/app/panel/layout/ui-settings.service.ts", "apps/36-blocks-widget/src/styles.scss", "apps/36-blocks-widget/src/assets/scss/**", "apps/36-blocks-widget/src/app/otp/**/*.scss"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# Design system

Both apps use **Tailwind CSS v4** (CSS-first, through `@tailwindcss/postcss`) plus SCSS. The dashboard (`apps/36-blocks`) adds **Angular Material 21 with an M3 theme** for components. The widget (`apps/36-blocks-widget`) uses no Material: plain HTML, Tailwind's default palette and its own `w-*` utility classes, all inside Shadow DOM.

> [!WARNING]
> `tailwind.config.js` at the repo root is **not read** by Tailwind v4 (its own header says so). There is no darkMode, theme.extend or content config anywhere. Tailwind is configured in the CSS entry files: `apps/shared/scss/global.scss` (dashboard) and the widget component SCSS files that `@use 'tailwindcss'`. Do not add settings to `tailwind.config.js`; they do nothing. Older docs (`DESIGNGUIDE.md`, `apps/36-blocks-widget/DESIGN-STRUCTURE.md`) that mention it are stale.

## Style files

| File | Role |
|---|---|
| `apps/36-blocks/src/styles.scss` | Dashboard global entry. `@use`s the base variables, light/dark CSS variables, Material theme, component partials and `../../shared/scss/global`. Defines `body` colours from `--mat-sys-*`, `.website-active` marketing background, dialog size classes, `.app-content`. |
| `apps/36-blocks/src/assets/scss/base/_default-variables.scss` | `:root` tokens: `--border-common-radius-4`, `--custom-mat-form-field-height` (48px), `--color-common-green`, channel colours (`--color-email-primary`, `--color-otp-primary`, ...). |
| `apps/36-blocks/src/assets/scss/base/_light-theme.scss`, `_dark-theme.scss` | `--color-common-*` neutrals per `body.light-theme` / `body.dark-theme` (`--color-common-bg`, `--color-common-text`, `--color-common-border`, ...). |
| `apps/36-blocks/src/assets/scss/theme/_custom-palette.scss` | Generated M3 palettes (primary teal from `#0F766E`, tertiary `#0EA5E9`, error `#DC2626`), `$light-theme` / `$dark-theme` (`mat.define-theme`, Inter, density 0), and the `emit-design-tokens` mixin that writes `--proxy-primary-*`, `--proxy-neutral-*`, `--proxy-error-*` and `--proxy-color-*` aliases. |
| `apps/36-blocks/src/assets/scss/theme/_default-theme.scss` | Applies the Material theme (see [Dashboard theme](#dashboard-theme)). |
| `apps/36-blocks/src/assets/scss/theme/_theme-base-classes.scss` | Image filter variables for dark mode. Not `@use`d by `styles.scss`, so currently inert. |
| `apps/36-blocks/src/assets/scss/component/` | `_utility-classes.scss` (`.card-with-header`), `_icon.scss` (`.mat-icon-14` … `.mat-icon-32`, `.mat-icon-circle`), `_toast.scss`, `_loader.scss`, `_animation.scss`, `_website-animations.scss` (marketing pages). |
| `apps/shared/scss/global.scss` | Shared by both apps' global `styles.scss`: `@use 'tailwindcss'`, the dashboard dark variant, helper classes (`.text-success`, `.text-danger`, `.text-primary`, `.text-dark`, `.text-secondary`, `.text-grey`, `.text-pending`, `.bg-gray`, `.bg-light-grey`, `.font-10` … `.font-20`, `.w-break`, `.w-b-hyphens`, `.box-shadow-none`), `.service-list`, `.stepper-starched`, markdown `pre` scrollbars. |
| `apps/shared/scss/_imports.scss` | Pulls in `_fonts.scss` (Inter from `apps/shared/fonts/`) and `component/{_mat-form-field,_table,_tabs}.scss`. |
| `apps/shared/scss/component/_table.scss` | `.table-scroll`, `.default-table`, `.default-table.responsive-table` (see [Tables](#tables)). |
| `apps/shared/scss/component/_mat-form-field.scss` | Forces outlined `mat-form-field` height to `--custom-mat-form-field-height` (opt out with `.initial-height`); `.no-padding` hides the subscript (hint and error) area. |
| `apps/shared/scss/mixins/_common-utils.scss` | `custom-scroll-bar` (used), `media-breakpoint-down/up` (576/768/992/1200/1400 px, Bootstrap-era; unused) and `sideNavHoverActiveState` (unused). |
| `apps/36-blocks-widget/src/styles.scss` | Widget global entry: shared `global`, `assets/scss/widget-ui`, intl-tel-input overrides, and `body.blocks-widget` theme classes for the dev harness page. Also listed in `ProxyAuthWidgetComponent.styleUrls`, so it is compiled into the shadow root. |
| `apps/36-blocks-widget/src/assets/scss/widget-ui.scss` | All `w-*` classes (see [Widget `w-*` classes](#widget-w--classes)). |
| `apps/36-blocks-widget/src/assets/scss/_shadow-reset.scss` | `*` reset (Inter, antialiasing, `border-box`) for Shadow DOM components. |
| `apps/36-blocks-widget/src/app/otp/widget/widget.component.scss` | Widget Tailwind entry: intl-tel-input CSS, `@use 'tailwindcss'`, shadow reset, `@custom-variant dark`, `:host { all: initial; isolation: isolate; ... }`. |
| `apps/shared/assets/utils/intl-tel-input-custom.scss` | intl-tel-input dropdown overrides, global so the dropdown is styled outside Shadow DOM. |

SCSS include paths: both `project.json` build targets add `apps/shared/scss` (the widget also adds `apps/shared`), so `@use 'component/table'` style imports resolve there. The dashboard also loads PrimeNG's primeng.min.css and a Prism theme from `node_modules` through `project.json` `styles`.

## Tokens

Dashboard colours come from three layers. Use them in this order:

1. **Material system tokens** `--mat-sys-*` (emitted by `mat.system-level-colors`, `use-system-variables: true`): `var(--mat-sys-surface)`, `var(--mat-sys-on-surface)`, `var(--mat-sys-primary)`, `var(--mat-sys-error)`. These switch with the theme automatically.
2. **Common variables** `--color-common-*` from `_light-theme.scss` / `_dark-theme.scss` for app chrome (`--color-common-bg`, `--color-common-border`, `--color-common-text`, `--color-common-secondary-text`) and `_default-variables.scss` for fixed colours.
3. **Palette tones** `--proxy-*` from `emit-design-tokens` (emitted on `html` in `_default-theme.scss`) when you need a specific tone.

Tailwind utilities are used freely for layout and spacing. In the dashboard panel, prefer the variables above for colour so dark mode works; Tailwind colour classes need a `dark:` partner. The marketing website (`WebsiteLayoutComponent` pages) is the exception: it is always dark (`body.website-active`, `#0d1117`) and is styled with Tailwind `teal-*` / `gray-*` directly.

> [!WARNING]
> `_custom-palette.scss` says "Tailwind's tailwind.config.js references the same var() names". It does not; Tailwind has no theme extension. `--proxy-*` variables exist only where `emit-design-tokens` ran: the dashboard's `html`. The widget's `register.component.scss` uses `var(--proxy-error-40)` with no fallback, so that invalid-phone outline shows inside the dashboard preview but not on a customer site. Always give `--proxy-*` a fallback in widget code, as `intl-tel-input-custom.scss` does (`var(--proxy-primary-40, #4f46e5)`).

Typography: Inter is the Material brand and plain family (local TTFs in `apps/shared/fonts/`); body text is `0.875rem`. `apps/36-blocks/src/index.html` also loads DM Sans and the Material Icons / Material Icons Outlined fonts from Google Fonts; the website layout sets `Space Grotesk` inline.

Breakpoints: use Tailwind's defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536). Hand-written SCSS mostly uses `max-width: 768px`. The 576/992/1200 numbers in `DESIGNGUIDE.md` only survive in the unused SCSS mixins.

## Dashboard theme

- **Light / dark / system.** `UiSettingsService` (`apps/36-blocks/src/app/panel/layout/ui-settings.service.ts`) stores a preference `light` | `dark` | `system` in `localStorage['ui-settings']` for 30 days (default `light`; older records that only have `theme: 'light-theme' | 'dark-theme'` still load). It puts exactly one of `light-theme` / `dark-theme` on `<body>`. `system` follows `prefers-color-scheme` and updates when the OS scheme changes. `apps/36-blocks/src/index.html` applies the same choice before Angular boots so the first paint matches. The workspace top bar, the account menu and the widget-preview sidebar (`proxy-theme-switcher`) all set it. `LayoutComponent` tells the GTWY chatbot the resolved `light` or `dark` value whenever it changes. The marketing site (`body.website-active`) keeps its own light palette. The widget preview's Light / System / Dark group is a different control: it sets the embed's `config.theme`, not the console.
- **Material.** `_default-theme.scss` includes `mat.all-component-themes($light-theme)` once on `html`, then only `mat.all-component-colors($dark-theme)` + `mat.system-level-colors` under `body.dark-theme` (and under a `prefers-color-scheme: dark` block for a body with no theme class). It also re-points `--mat-sys-outline` to `--color-common-border` and sets `--mat-sys-on-surface` per theme.
  - Why colours only for dark: including `all-component-themes` a second time re-emits density and typography and triggers Material's duplicate-styles warning. Keep this split when you add themes.
- **Tailwind `dark:`.** `apps/shared/scss/global.scss` declares `@variant dark (&:where(.dark-theme, .dark-theme *));` (cbfb7d1e), so `dark:` utilities in dashboard templates follow `body.dark-theme`, not the OS setting.

> [!WARNING]
> The `prefers-color-scheme` block in `_default-theme.scss` only applies when `<body>` has neither class. `UiSettingsService` always sets one class. System mode still paints with `body.light-theme` or `body.dark-theme`; it does not leave the body unclassed. Do not rely on that media block; use `body.dark-theme`.

### Dialogs

Pass size classes as `panelClass` to `MatDialog.open` (defined in `apps/36-blocks/src/styles.scss`):

| `panelClass` | Effect |
|---|---|
| `['mat-dialog']` | Centered, `min-width: 500px` |
| `['mat-dialog', 'mat-dialog-md']` | 680px wide, 24px padding |
| `['mat-dialog', 'mat-dialog-lg']` | Container `min-width: 800px` |
| `+ 'mat-high-dialog'` | `max-height: 90vh`, scrolls |
| `+ 'mat-dialog-auto'` | Width fits content |
| `['mat-right-dialog', 'mat-dialog-xs' / 'mat-dialog-md' / 'mat-dialog-lg' / 'mat-dialog-xlg']` | Full-height side sheet on the right; 374px / 450px / 535px / 40vw (60vw ≤1280px, full ≤992px) |
| `'preview-fullscreen-dialog'` | 100vw × 100vh, no radius |

### Tables

Use `mat-table` with `class="default-table"` inside a `.table-scroll` wrapper. Add `responsive-table` to turn rows into cards at ≤768px: the header row is hidden and each `<td>` shows its `data-label` attribute as the label (`content: attr(data-label)`), so put `data-label="Name"` on every `<td mat-cell>`. Example: `oauth-config.component.html`.

### Other conventions that still hold

- Lowercase-hyphen class names; classes, not ids, for styling.
- `!important` is acceptable mainly to override Angular Material internals.
- Component styles are private (default emulated encapsulation); put cross-page styles in the shared or app SCSS above, not in a component file.
- Icon sizes: `mat-icon-14`/`16`/`18`/`20`/`22`/`24`/`32`.
- Many class names in `DESIGNGUIDE.md` (`mat-data-card`, `t-opacity-*`, `fw-*`, `status-*`, `icon-btn-md`, `mat-btn-xs`, ...) are not defined in any stylesheet. Some still appear in templates and do nothing.

## Widget theme

- **Dark mode is class-based inside the shadow root.** Each Shadow DOM component SCSS (`widget.component.scss`, `user-profile`, `user-management`, `organization-details`) declares `@custom-variant dark (&:where(.dark, .dark *));`. Templates put `[class.dark]="isDark()"` (or `isDarkTheme()`) on their root and dialog-portal divs; `WidgetDialogService` adds a `.dark` wrapper for portalled dialogs. The class has to be inside the shadow root; a `.dark` on the host page's `<html>` does not reach it.
- **Which theme.** `WidgetThemeService.isDark$` resolves the server override (`ui_preferences.theme`) or the host's `config.theme` (`dark` / `light` / anything else = OS `prefers-color-scheme`, watched live). Details and the dialog-specific rule are in [widget-embed](../modules/widget-embed.md#theming).
- **Host isolation.** `:host { all: initial; isolation: isolate; font-family: Inter, ...; font-size: 16px }` plus `_shadow-reset.scss` stops host-page CSS leaking in, and dialogs use `z-index` near `2147483647` to sit above host overlays.
- **Customer brand colours** (`ui_preferences.light_theme_primary_color`, `dark_theme_primary_color`, `button_color`, `button_hover_color`, `button_text_color`, `border_radius`) are applied as inline styles from TypeScript in `ProxyAuthWidgetComponent` and `RegisterComponent` (V2 widgets only; defaults `#3f51b5` / `#303f9f`). The "no inline style" rule applies to templates, not to these DOM builders. See [widget-auth](../modules/widget-auth.md).
- **Palette.** Tailwind default colours only. The widget's own accent is **indigo** (`indigo-600` buttons, `indigo-500` focus rings); the gray scale pairs light/dark as in `widget-ui.scss` (`gray-200`/`gray-600` borders, `white`/`gray-800` inputs, `white`/`gray-900` panels). `DESIGN-STRUCTURE.md` says blue; that is stale.

## Widget `w-*` classes

`apps/36-blocks-widget/src/assets/scss/widget-ui.scss` defines one class per repeated UI pattern, each with its dark variant built in (`.dark & { ... }`). Shadow DOM components get them with `@use '../../../assets/scss/widget-ui' as *;`. Why: one short class instead of 200-character Tailwind strings, dark mode handled once, one place to change a pattern.

| Group | Classes |
|---|---|
| Inputs | `w-input`, `w-input-sm`, `w-input-icon-right`, `w-input-search`, `w-input-readonly`, `w-textarea`, `w-select`, `w-input-otp`, `w-label`, `w-field-error` |
| Buttons | `w-btn-primary`, `w-btn-primary-sm` (indigo), `w-btn-secondary`, `w-btn-secondary-sm` (outlined), `w-btn-danger`, `w-btn-danger-sm` (red), `w-btn-close`, `w-spinner` |
| Cards | `w-card`, `w-card-section` |
| Dialogs | `w-dialog-backdrop`, `w-dialog-panel` (+ `w-dialog-panel--lg` 38rem, `w-dialog-panel--md`), `w-dialog-header`, `w-dialog-title`, `w-dialog-body`, `w-dialog-footer` |
| Text | `w-section-title`, `w-section-subtitle`, `w-body-list`, `w-micro-label`, `w-link` |
| Badges, misc | `w-badge`, `w-badge-green`, `w-divider`, `w-avatar`, `w-icon-box`, `w-search-icon` |
| Navigation | `w-nav-tab`, `w-nav-item` |
| Checkboxes | `w-checkbox-group`, `w-checkbox-row`, `w-checkbox` |

Dialog skeleton (keep the ARIA attributes):

```html
<div class="w-dialog-backdrop" (click)="close()" aria-hidden="true"></div>
<div role="dialog" aria-modal="true" aria-labelledby="dlg-title" class="w-dialog-panel">
  <div class="w-dialog-header"><h2 id="dlg-title" class="w-dialog-title">Title</h2><button class="w-btn-close" aria-label="Close">…</button></div>
  <div class="w-dialog-body">…</div>
  <div class="w-dialog-footer"><button class="w-btn-secondary">Cancel</button><button class="w-btn-primary">Save</button></div>
</div>
<!-- destructive confirm: role="alertdialog" + aria-describedby, w-btn-danger -->
```

Templates still contain about 180 raw `dark:` utilities next to the `w-*` classes. They work (same `.dark` variant), so mixing is fine; prefer a `w-*` class when one fits.

### Adding a `w-*` class

1. Add it to the right section of `widget-ui.scss` with `@apply`.
2. Add a `.dark & { ... }` block.
3. Do not `@apply group`: `group` is a marker class, not a utility. Put it on the element in the template.
4. For a tinted dark background, follow the file's pattern and write native CSS instead of an opacity modifier, for example `background-color: rgb(127 29 29 / 0.2);` (red-900/20) in `w-btn-danger-sm`. The old widget doc says opacity modifiers fail inside `@apply`, but the same file does `@apply bg-black/50` and `ring-gray-900/5` and those compile, so treat the native-CSS form as the house style rather than a hard limit.
5. Replace the long Tailwind strings in templates with the new class.

> [!TODO] Needs a human: does `@apply` with an opacity modifier inside a `.dark &` block actually fail on the current Tailwind 4.2, or is the native `rgb()` rule a leftover from an earlier version?

## Rules

- No hex colours in templates. Dashboard: `--mat-sys-*` / `--color-common-*` / `--proxy-*`. Widget: Tailwind palette classes or `w-*`.
- Dashboard dark mode: theme by `body.dark-theme`; a Tailwind colour class needs a `dark:` partner; Material colours come from the theme.
- Widget dark mode: `[class.dark]` on the component root; never rely on host-page classes or `tailwind.config.js`.
- No Angular Material in the widget; no `MatLegacy*` anywhere.
- Every interactive widget element: `cursor-pointer`, `transition-colors duration-150`, `focus-visible:outline-indigo-500` (built into `w-btn-*`).
- Respect reduced motion: `apps/36-blocks/src/styles.scss` already shortens animations under `prefers-reduced-motion`; do not override it with `!important` animations.
