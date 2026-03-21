---
description: Widget design system rules for 36-blocks-widget (proxy-auth custom element)
---

# Widget Design Rules — 36-blocks-widget

These rules govern ALL styling, layout, and component decisions inside
`apps/36-blocks-widget/`. They extend the root rules in `36-blocks.md`.

---

## 1. Styling Priority Order

1. **Angular CDK primitives** (`@angular/cdk`) — overlay, focus-trap, a11y, portal
2. **Angular Material MDC components** — `mat-form-field`, `matButton`, `mat-progress-bar`, `mat-tab-group`, `mat-spinner`
3. **Tailwind utility classes** — all layout, spacing, color, typography
4. **Component SCSS** — ONLY for things that cannot be expressed in Tailwind: `@keyframes` animations, `:host` Shadow DOM constraints, `::ng-deep` Material overrides, CSS-only hover-reveal patterns

> If a Tailwind class exists for a style, use it. Never write custom SCSS for spacing, sizing, layout, or color.

---

## 2. Shadow DOM Constraints

The widget runs inside `ViewEncapsulation.ShadowDom`. This creates special requirements:

- **Tailwind classes ARE available** — `styles.scss` injects Tailwind into the shadow root via the `styleUrls` array
- **Global Angular Material theme is NOT available** — `shadow-dom-theme.scss` re-emits tokens on `:host`
- **`dark:` Tailwind variant** — controlled by adding/removing `class="dark"` on the `:host` element, driven by the `isDarkTheme()` signal
- **No `document.head` style injection** — styles injected into `document.head` do NOT penetrate the Shadow DOM; all styles must be in `styleUrls` or inline in the shadow root

### Dark mode pattern in templates:
```html
<!-- Use host class binding, not body.dark-theme -->
<div [class.dark]="isDarkTheme()" class="...">
```

### Dark mode in `tailwind.config.js`:
```js
darkMode: ['class'] // 'dark' class on :host or wrapper element
```

---

## 3. No Inline Styles — Ever

**NEVER** use `element.style.cssText = ...` or `Renderer2` to set inline styles.
**NEVER** use `[style.xxx]` bindings for anything coverable by Tailwind or a token.
**NEVER** inject stylesheets into `document.head` from a Shadow DOM component.

Use Angular template with Tailwind classes instead:
```html
<!-- ❌ Wrong -->
<div [style.color]="isDark ? '#ffffff' : '#1f2937'">

<!-- ✓ Correct -->
<div class="text-neutral-10 dark:text-neutral-100">
```

---

## 4. Color — Tokens Only

- Use Tailwind token keys: `text-neutral-10`, `bg-surface`, `border-outline`, `text-error-40`
- For Material-controlled colors (button background, form field accent), use `var(--mat-sys-primary)` or the `[style.background-color]` binding ONLY when dynamic runtime theming requires it (e.g. per-tenant brand color from API)
- **Never hardcode hex values** anywhere in templates or SCSS — use `--proxy-*` CSS custom properties

### Available semantic token keys (Tailwind):
| Tailwind key | CSS var |
|---|---|
| `text-on-surface` | `var(--proxy-color-on-surface)` |
| `bg-surface` | `var(--proxy-color-surface)` |
| `border-outline` | `var(--proxy-color-outline)` |
| `text-accent` | `var(--proxy-color-accent)` |
| `text-error-40` | `var(--proxy-error-40)` |
| `text-neutral-10` | `var(--proxy-neutral-10)` |
| `text-neutral-60` | `var(--proxy-neutral-60)` |
| `bg-neutral-95` | `var(--proxy-neutral-95)` |
| `bg-neutral-10` | `var(--proxy-neutral-10)` |

---

## 5. Component Design System — Widget Card

### Auth Dialog Card
```html
<div class="relative w-full max-w-sm bg-surface rounded-2xl shadow-2xl p-8 flex flex-col gap-5">
```

### Primary Button (full width)
```html
<button matButton="filled" class="w-full h-11">Submit</button>
```

### Outline / Social Button
```html
<button matButton="outlined" class="w-full h-11 border-outline">Continue with Google</button>
```

### Text Input (Material MDC)
```html
<mat-form-field appearance="outline" class="w-full">
  <mat-label>Email</mat-label>
  <input matInput />
</mat-form-field>
```

### Error message
```html
<p class="text-sm text-error-40 mt-1">{{ error }}</p>
```

### OR Divider
```html
<div class="flex items-center gap-3 my-2">
  <div class="flex-1 h-px bg-outline"></div>
  <span class="text-xs text-neutral-60 font-medium">Or continue with</span>
  <div class="flex-1 h-px bg-outline"></div>
</div>
```

### Close button
```html
<button matIconButton class="absolute top-3 right-3" aria-label="Close">
  <!-- svg icon -->
</button>
```

---

## 6. Responsive Design

- Default: single column, `max-w-sm` (384px) card
- Mobile `≤ 768px`: `w-[90vw]` card, `h-[80vh]` max
- Never use fixed pixel widths in templates — use `max-w-*` instead
- Use Tailwind responsive prefixes: `sm:`, `md:` — no custom `@media` in component SCSS

---

## 7. Accessibility (WCAG AA required)

- Every interactive element MUST have an accessible label: `aria-label` or visible text
- Dialog containers: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- Use CDK `FocusTrap` (`cdkTrapFocus`) on modal dialogs
- Focus rings: never suppress outline; use `focus-visible:ring-2 focus-visible:ring-primary-40`
- Color contrast: all text/background pairs must meet 4.5:1 (AA)
- Form fields: `mat-label` provides accessible label; always include it

---

## 8. DOM Injection — Forbidden

**Never** use `Renderer2` + `createElement` to build UI that should be an Angular component.
**Never** use `MutationObserver` to patch CDK/Material overlay class names at runtime.

The only acceptable `Renderer2` usage in `widget.component.ts` is:
- Reading/querying the host `referenceId` element in the **consumer's** DOM (outside shadow root)
- Appending the `<proxy-auth>` custom element itself to a reference container

All widget UI (login form, subscription cards, social buttons, skeleton loader) MUST be Angular template components.

---

## 9. Subscription Renderer — No Bootstrap CSS Injection

`SubscriptionRendererService` must NOT inject Bootstrap-like utility classes or raw `<style>` tags into `document.head`. Use the Angular `<proxy-subscription-center>` component with Tailwind classes instead.

---

## 10. File Conventions

- Templates: `.html` — Tailwind classes, Material MDC directives, CDK directives
- Styles: `.scss` — only `@keyframes`, `::ng-deep` Material overrides, `:host` Shadow DOM constraints, CSS-only hover-reveal; **target: ≤ 120 lines**
- Global widget styles: `otp-global.scss` — only structural/overlay styles; no raw hex
- Dark mode: driven by `isDarkTheme()` computed signal → `[class.dark]` on host/container

### SCSS allowed content (exhaustive list):
1. `@keyframes` animations (e.g. shimmer skeleton)
2. Skeleton `.skeleton-*` classes that reference the animation
3. CSS-only hover-reveal (`.table-row:hover .hover-actions { opacity: 1 }`)
4. `::ng-deep` overrides for Material overlays/tooltips that cannot be scoped otherwise
5. Angular Material table/cell dimension resets (`th`, `td`, column width `!important`)
6. `:host` encapsulation constraints

---

## 11. Angular v21 Component Pattern

All new and migrated components MUST follow this pattern — **no exceptions**:

### Inputs & view queries — signals only
```typescript
// ✓ Inputs
readonly userToken = input<string>();
readonly theme = input<string>();

// ✓ Internal mutable state — signal, not @Input
readonly isHidden = signal(false);

// ✓ View queries
readonly paginator = viewChild<MatPaginator>(MatPaginator);
readonly dialogTpl = viewChild.required<TemplateRef<any>>('myDialog');
```

### Lifecycle — no class interfaces
```typescript
// ✓ Destroy — DestroyRef, not OnDestroy / BaseComponent
private readonly destroyRef = inject(DestroyRef);

constructor() {
    // Store subscriptions here, NOT in ngOnInit
    this.store.pipe(select(mySelector), takeUntilDestroyed(this.destroyRef))
        .subscribe(res => { ... });

    // Observable form controls here too
    this.myForm.get('role')?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(val => this.onRoleChange(val));

    // Window listeners — register + clean up in one place
    const handler = () => this.isHidden.set(false);
    window.addEventListener('showWidget', handler);
    this.destroyRef.onDestroy(() => window.removeEventListener('showWidget', handler));

    // Post-render DOM wiring (replaces ngAfterViewInit)
    afterNextRender(() => {
        this.dataSource.sort = this.sort() ?? null;
        this.dataSource.paginator = this.paginator() ?? null;
    });
}
```

### No BaseComponent
- **Do NOT** extend `BaseComponent` — it provides `destroy$` (Subject-based) which is superseded by `takeUntilDestroyed(this.destroyRef)`
- **Do NOT** implement `OnInit`, `AfterViewInit`, `OnDestroy` — move all logic to `constructor()`

### Computed / derived state
```typescript
// ✓ Derived state
readonly isDarkTheme = computed(() => this.theme() === PublicScriptTheme.Dark);

// ✓ Async state from store as signal
readonly isLoading = toSignal(
    this.store.pipe(select(selectLoading)),
    { initialValue: false }
);
```

### Dialog helper — deduplicate theme logic
```typescript
// ✓ Single helper — never repeat panelClass + afterClosed body-class logic
private openDialogWithTheme(tpl: TemplateRef<any>): MatDialogRef<any> {
    const ref = this.dialog.open(tpl, {
        width: '500px',
        panelClass: this.theme() === PublicScriptTheme.Dark ? ['dark-dialog'] : [],
    });
    if (this.theme() === PublicScriptTheme.Dark) {
        document.body.classList.add('dark-dialog-open');
        ref.afterClosed().subscribe(() => document.body.classList.remove('dark-dialog-open'));
    }
    return ref;
}
```

---

## 12. Angular Signals — Derived State Pattern

```typescript
// ✓ Use computed signals for derived UI state
readonly isDarkTheme = computed(() => this.theme() === PublicScriptTheme.Dark);
readonly viewMode = computed<ViewMode>(() => { ... });

// ✓ Use toSignal() for store observables where a synchronous value is needed in template
readonly isLoading = toSignal(this.store.pipe(select(selectLoading)), { initialValue: false });

// ✓ Use takeUntilDestroyed for side-effect subscriptions (store dispatch, refresh, etc.)
this.store.pipe(select(mySelector), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
    .subscribe(res => { if (res) this.refresh(); });
```
