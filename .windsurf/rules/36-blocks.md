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