---
trigger: always_on
---

You are an expert in TypeScript, Angular, Nx monorepos, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular v21 and Nx best practices.

## TypeScript Best Practices
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Use `moduleResolution: "bundler"` in tsconfig (required for Angular v21+ CDK package exports)

## Angular Best Practices
- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.
- Always add `provideZoneChangeDetection({ eventCoalescing: true })` to root `AppModule` providers or `bootstrapApplication` (required in Angular v21+)
- Use `afterEveryRender` instead of the removed `afterRender` lifecycle hook
- `ResourceStatus` is no longer an enum — use constant string values instead

## Accessibility Requirements
- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Design Tokens — Single Source of Truth

**The ONLY file you ever edit to change colors or palette values is:**
`apps/proxy/src/assets/scss/theme/_custom-palette.scss`

This file defines the Material color palettes and exposes an `emit-design-tokens()` Sass mixin. A single palette change there propagates automatically to all three consumers:

| Consumer | File | How it consumes |
|---|---|---|
| Global Material theme | `apps/proxy/src/assets/scss/theme/_default-theme.scss` | `@include theme.emit-design-tokens()` in `html {}` |
| Shadow DOM Material theme | `apps/proxy-auth/src/shadow-dom-theme.scss` | `@include theme.emit-design-tokens()` in `:host {}` |
| Tailwind utilities | `tailwind.config.js` (root) | `theme.extend.colors` references `var(--proxy-*)` CSS vars |

**Rules:**
- **Never hardcode hex color values** in templates, component SCSS, or `tailwind.config.js` — always reference a `var(--proxy-*)` token or a Tailwind color key backed by one.
- **Never duplicate** palette values between `_custom-palette.scss` and `tailwind.config.js` — Tailwind tokens must always point to `var(--proxy-*)` CSS vars, not raw hex.
- When adding a new color or tone, add it to `_custom-palette.scss` `$_palettes` map AND expose it via `emit-design-tokens()`, then add the matching `var()` reference to `tailwind.config.js`.
- The CSS custom property naming convention is `--proxy-{palette}-{tone}` (e.g. `--proxy-primary-80`, `--proxy-neutral-40`).
- Semantic aliases (`--proxy-color-accent`, `--proxy-color-surface`, etc.) are defined once in `emit-design-tokens()` and should be preferred over raw tone vars in templates when the intent is semantic.

## Styling — Tailwind CSS
- **Always use Tailwind utility classes** for styling. Never use Bootstrap utility classes (e.g. `d-flex`, `mb-3`, `col-*`) or custom local utility classes.
- Do NOT write component-scoped CSS/SCSS for spacing, sizing, layout, typography, or color when an equivalent Tailwind class exists — prefer the Tailwind class directly in the template.
- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) for breakpoint-specific styles instead of custom media queries.
- Use Tailwind's state variants (`hover:`, `focus:`, `active:`, `disabled:`, `group-hover:`) instead of writing pseudo-class CSS rules.
- Use Tailwind's dark mode variant (`dark:`) for dark theme styles where applicable.
- Compose utility classes directly on elements — avoid creating wrapper `.container` or `.card` classes that just repeat Tailwind utilities.
- When a combination of utilities is reused across many components, extract it into a Tailwind `@layer components` block inside the shared `styles.scss`, NOT into a new Angular component SCSS file.
- Never mix Tailwind utilities with inline `[style]` bindings for the same property — pick one.
- Use `@apply` sparingly and only inside `@layer components` or `@layer utilities` blocks; never use `@apply` inside component-scoped SCSS files.
- Avoid arbitrary values (e.g. `w-[347px]`) unless there is no standard scale equivalent; prefer design tokens from `tailwind.config` instead.
- Keep `tailwind.config` content globs up to date so purging works correctly across all `apps/` and `libs/` paths — always include both `.html` and `.ts` files:
  ```js
  content: ['./apps/**/*.{html,ts}', './libs/**/*.{html,ts}']
  ```
- Define the project's color palette, spacing scale, and typography in `tailwind.config` `theme.extend` to maintain a consistent design system — never hardcode raw color values or pixel sizes in templates.
- For complex interactive components (dropdowns, modals, overlays), use Angular CDK primitives styled entirely with Tailwind — do NOT reach for opinionated UI libraries that conflict with Tailwind's utility classes.
- When a component template accumulates many repeated utility class strings, encapsulate it into a dedicated Angular component rather than duplicating the class list — this keeps templates readable without resorting to `@apply`.

## Components
- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of `@Input()` and `@Output()` decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.
- Remove the `moduleId` property from `@Component` decorators — no longer supported in Angular v21
- Remove the `interpolation` property from `@Component` decorators — only `{{` and `}}` are supported

## State Management
- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
- Use `toSignal()` to convert Observables to signals where appropriate

## Templates
- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the `async` pipe to handle observables in templates
- Do not assume globals like (`new Date()`) are available.
- In templates, parentheses are always respected — be careful with nullish coalescing inside parentheses (e.g. `(foo?.bar).baz` will throw if `foo` is nullish)

## Services
- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Nx Monorepo Best Practices
- Use Nx project boundaries and tags to enforce dependency rules (`@nx/enforce-module-boundaries`)
- Define `tags` in every `project.json` for scope and type (e.g. `scope:proxy`, `type:feature`, `type:ui`, `type:util`)
- Use Nx `dependsOn` in `project.json` targets to express correct task ordering (e.g. `set-env` before `build`)
- Never import across app boundaries — shared code must live in libs
- Keep libs small and focused: prefer many small libs over a few large ones
- Use path aliases (`@proxy/*`) defined in `tsconfig.base.json` — never use relative paths to cross lib boundaries
- Add new targets using `executor: "nx:run-commands"` for simple shell tasks
- Use `nx:run-commands` with `parallel: false` when order matters between commands
- Cache build outputs by specifying `outputs` in `project.json` targets to benefit from Nx computation caching
- Run `nx affected` commands in CI to only rebuild/test what changed
- Use `nx graph` to visualize and audit inter-library dependencies
- Keep `nx.json` `targetDefaults` for shared target configuration (caching, `dependsOn`) to avoid repetition across `project.json` files
- Prefer `@nx/angular:library` generator for new Angular libs (sets up proper tsconfig paths automatically)