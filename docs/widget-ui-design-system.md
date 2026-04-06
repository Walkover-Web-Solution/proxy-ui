# Widget UI Design System — Usage Guide

> **Created:** Mar 23, 2026  
> **Scope:** `apps/36-blocks-widget` — shared Tailwind utility classes, design tokens, and HTML patterns  
> **File:** `apps/36-blocks-widget/src/assets/scss/widget-ui.scss`

---

## Table of Contents

1. [Overview](#overview)
2. [Why This Exists](#why-this-exists)
3. [Quick Reference — All Classes](#quick-reference)
4. [Inputs & Form Controls](#inputs--form-controls)
5. [Buttons](#buttons)
6. [Cards](#cards)
7. [Dialogs](#dialogs)
8. [Badges & Avatars](#badges--avatars)
9. [Navigation](#navigation)
10. [Typography Helpers](#typography-helpers)
11. [Misc Helpers](#misc-helpers)
12. [Dark Mode](#dark-mode)
13. [Rules for New Developers](#rules-for-new-developers)

---

## Overview

All widget components (`login`, `register`, `send-otp-center`, `user-management`, `user-profile`, `organization-details`) share a single design system defined in `widget-ui.scss`.

Every shared class is **prefixed with `w-`** to avoid collision with Tailwind's built-in utilities.

---

## Why This Exists

Without shared classes, each developer would write verbose inline Tailwind strings like:

```html
<!-- ❌ BEFORE — 200+ chars, easy to get wrong, impossible to audit -->
<input class="block w-full rounded-lg border border-gray-200 dark:border-gray-600
              bg-white dark:bg-gray-800 px-3.5 py-2 text-sm text-gray-900 dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />

<!-- ✅ AFTER — instantly readable, consistent, dark mode included -->
<input class="w-input" />
```

Benefits:
- **Consistency** — one source of truth for each UI pattern
- **Dark mode** — baked into every `w-*` class, no `dark:` prefixes needed in templates
- **Accessibility** — focus rings, cursor styles, disabled states are standardised
- **Maintainability** — change the design of all inputs in one place

---

## Quick Reference

| Class | Element | Description |
|---|---|---|
| `w-input` | `<input>` | Standard text/email/tel input |
| `w-input-sm` | `<input>` | Smaller horizontal padding (px-3) |
| `w-input-otp` | `<input>` | Square OTP single-character box |
| `w-input-search` | `<input type="search">` | Left-padded for icon |
| `w-input-readonly` | `<input readonly>` | Dimmed, not interactive |
| `w-textarea` | `<textarea>` | Multi-line input |
| `w-select` | `<select>` | Custom-caret select |
| `w-label` | `<label>` | Form field label |
| `w-field-error` | `<p role="alert">` | Inline validation error |
| `w-btn-primary` | `<button>` | Indigo filled, md size |
| `w-btn-primary-sm` | `<button>` | Indigo filled, xs size |
| `w-btn-secondary` | `<button>` | Outlined, md size |
| `w-btn-secondary-sm` | `<button>` | Outlined, xs size |
| `w-btn-danger` | `<button>` | Red filled, md size |
| `w-btn-danger-sm` | `<button>` | Red outlined, xs size |
| `w-btn-close` | `<button>` | Icon-only dismiss (dialog X) |
| `w-link` | `<button>` / `<span>` | Indigo inline text link |
| `w-card` | `<div>` | Standard list card |
| `w-card-section` | `<div>` | Feature card with shadow |
| `w-dialog-backdrop` | `<div>` | Semi-transparent overlay |
| `w-dialog-panel` | `<div role="dialog">` | Centred modal panel |
| `w-dialog-header` | `<div>` | Dialog title bar |
| `w-dialog-title` | `<h2>` / `<h3>` | Dialog heading text |
| `w-dialog-body` | `<div>` | Scrollable dialog content |
| `w-dialog-footer` | `<div>` | Dialog action buttons row |
| `w-badge` | `<span>` | Neutral grey badge |
| `w-badge-green` | `<span>` | Green status badge |
| `w-avatar` | `<div>` | Round initials avatar |
| `w-icon-box` | `<div>` | Square icon container |
| `w-section-title` | `<h2>` | Page/tab section heading |
| `w-section-subtitle` | `<p>` | Page/tab section description |
| `w-micro-label` | `<p>` / `<span>` | 10px uppercase field meta label |
| `w-divider` | `<hr>` / `<div>` | Horizontal rule |
| `w-spinner` | `<svg>` | Animated loading spinner |
| `w-nav-tab` | `<button>` | Horizontal tab bar button |
| `w-nav-item` | `<button>` | Vertical sidebar nav button |
| `w-checkbox-group` | `<div role="group">` | Scrollable checkbox list |
| `w-checkbox-row` | `<label>` | Clickable checkbox row |
| `w-checkbox` | `<input type="checkbox">` | Styled checkbox |
| `w-search-icon` | `<svg>` | Absolute-positioned search icon |

---

## Inputs & Form Controls

### Standard Input — `w-input`

Use for any `text`, `email`, `tel`, `url` input with standard padding.

```html
<label for="name" class="w-label">Full name</label>
<input id="name" type="text" class="w-input" placeholder="Jane Smith" />
<p role="alert" class="w-field-error">Name is required.</p>
```

**Modifiers** (append extra Tailwind classes as needed):
```html
<!-- With right-side icon padding (password toggle, select caret) -->
<input class="w-input pr-10" />

<!-- Read-only / pre-filled -->
<input class="w-input" readonly [attr.aria-readonly]="true" />
```

### Compact Input — `w-input-sm`

Same as `w-input` but uses `px-3` instead of `px-3.5`. Used in login and register flows.

```html
<input type="email" class="w-input-sm" placeholder="you@example.com" />
```

### OTP Box — `w-input-otp`

Fixed 36×36 px square used for single-digit OTP entry.

```html
<div class="flex gap-2">
  <input type="text" maxlength="1" class="w-input-otp" />
  <input type="text" maxlength="1" class="w-input-otp" />
  <input type="text" maxlength="1" class="w-input-otp" />
  <input type="text" maxlength="1" class="w-input-otp" />
</div>
```

### Search Input — `w-input-search`

Always pair with a `.w-search-icon` SVG positioned absolutely inside a `relative` wrapper.

```html
<div class="relative">
  <svg class="w-search-icon" aria-hidden="true"><!-- magnifier icon --></svg>
  <input type="search" class="w-input-search" placeholder="Search users…" />
</div>
```

### Textarea — `w-textarea`

```html
<label for="bio" class="w-label">Bio</label>
<textarea id="bio" rows="3" class="w-textarea" placeholder="Tell us about yourself"></textarea>
```

### Select — `w-select`

Always wrap in `div.relative` and add a caret SVG overlay.

```html
<div class="relative">
  <select class="w-select">
    <option>Option A</option>
    <option>Option B</option>
  </select>
  <!-- Custom caret -->
  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
    <svg class="size-4 text-gray-400 dark:text-gray-500" aria-hidden="true"><!-- chevron-down --></svg>
  </div>
</div>
```

### Form Label — `w-label`

```html
<label for="email" class="w-label">Email address</label>
```

Default includes `mb-1.5`. To remove the margin: `class="w-label mb-0"`.

### Validation Error — `w-field-error`

Always add `role="alert"` and link via `aria-describedby` on the input.

```html
<input id="email" aria-describedby="email-error" class="w-input" />
<p id="email-error" role="alert" class="w-field-error">Invalid email address.</p>
```

---

## Buttons

### Primary — `w-btn-primary`

Indigo filled, medium size. Used for dialog save actions and main CTAs.

```html
<button type="button" class="w-btn-primary">
  Save changes
</button>

<!-- With leading icon -->
<button type="button" class="w-btn-primary">
  <svg class="size-4" aria-hidden="true"><!-- plus --></svg>
  Add user
</button>

<!-- Full-width (login/register submit) -->
<button type="submit" class="w-btn-primary w-full justify-center">
  Sign in
</button>
```

### Primary Small — `w-btn-primary-sm`

xs size, used inside card/section headers.

```html
<button type="button" class="w-btn-primary-sm">
  <svg class="size-3.5" aria-hidden="true"><!-- plus --></svg>
  Invite member
</button>
```

### Secondary / Cancel — `w-btn-secondary`

Outlined ring style, medium size. Used as cancel/back actions in dialogs.

```html
<button type="button" class="w-btn-secondary">Cancel</button>
```

### Secondary Small — `w-btn-secondary-sm`

Outlined, xs size. Used as Edit/View actions on list card rows.

```html
<button type="button" class="w-btn-secondary-sm">Edit</button>
```

**Modifiers:**
```html
<!-- Compact (px-2.5 py-1) when space is very tight -->
<button type="button" class="w-btn-secondary-sm px-2.5 py-1">View</button>
```

### Danger — `w-btn-danger`

Red filled, used in confirm/destructive dialogs.

```html
<button type="button" class="w-btn-danger">Delete account</button>
```

### Danger Small — `w-btn-danger-sm`

Red outlined, used for Remove/Leave actions in card rows.

```html
<button type="button" class="w-btn-danger-sm">Remove</button>
```

### Close Button — `w-btn-close`

Icon-only dismiss button for dialog headers.

```html
<button type="button" class="w-btn-close" aria-label="Close dialog" (click)="closeDialog()">
  <svg class="size-5" aria-hidden="true"><!-- X icon --></svg>
</button>
```

### Inline Link — `w-link`

Looks like a text hyperlink, used for "Forgot password?", "Resend OTP", etc.

```html
<button type="button" class="w-link">Forgot password?</button>

<!-- With positioning modifiers -->
<button type="button" class="w-link self-start" [disabled]="resendDisabled">Resend OTP</button>
```

---

## Cards

### List Card — `w-card`

Base card without padding — add layout classes directly.

```html
<div class="w-card px-5 py-4 flex items-center justify-between gap-4">
  <!-- avatar + name + actions -->
</div>
```

### Section Card — `w-card-section`

Card with `overflow-hidden` and `shadow-sm`, used to wrap profile/org detail sections.

```html
<div class="w-card-section">
  <!-- card header bar -->
  <div class="w-dialog-header px-5 py-4">
    <h2 class="w-dialog-title">Personal details</h2>
    <button class="w-btn-secondary-sm inline-flex items-center gap-1.5">
      <svg class="size-3" aria-hidden="true"><!-- pencil --></svg>
      Edit
    </button>
  </div>
  <!-- card body -->
  <div class="px-5 py-4">...</div>
</div>
```

---

## Dialogs

### Standard Modal

```html
<!-- Backdrop -->
<div class="w-dialog-backdrop" (click)="closeDialog()" aria-hidden="true"></div>

<!-- Panel -->
<div role="dialog" aria-labelledby="dialog-title" aria-modal="true"
     class="w-dialog-panel">

  <!-- Header -->
  <div class="w-dialog-header">
    <h2 id="dialog-title" class="w-dialog-title">Edit profile</h2>
    <button type="button" class="w-btn-close" aria-label="Close dialog" (click)="closeDialog()">
      <svg class="size-5" aria-hidden="true"><!-- X --></svg>
    </button>
  </div>

  <!-- Scrollable body -->
  <div class="w-dialog-body space-y-5">
    <div>
      <label for="name" class="w-label">Full name</label>
      <input id="name" type="text" class="w-input" />
    </div>
  </div>

  <!-- Footer -->
  <div class="w-dialog-footer">
    <button type="button" class="w-btn-secondary" (click)="closeDialog()">Cancel</button>
    <button type="button" class="w-btn-primary" [disabled]="saving">Save</button>
  </div>

</div>
```

### Confirm / Destructive Dialog

Use `role="alertdialog"` with both `aria-labelledby` and `aria-describedby`.

```html
<div class="w-dialog-backdrop" aria-hidden="true"></div>

<div role="alertdialog"
     aria-labelledby="confirm-title"
     aria-describedby="confirm-desc"
     aria-modal="true"
     class="w-dialog-panel sm:max-w-md p-6">

  <div class="flex items-start gap-4">
    <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
         aria-hidden="true">
      <svg class="size-5 text-red-600 dark:text-red-400" aria-hidden="true"><!-- trash --></svg>
    </div>
    <div class="min-w-0 flex-1">
      <h3 id="confirm-title" class="w-dialog-title">Remove member?</h3>
      <p id="confirm-desc" class="w-section-subtitle mt-1">This cannot be undone.</p>
    </div>
  </div>

  <div class="mt-5 flex justify-end gap-3">
    <button type="button" class="w-btn-secondary">Cancel</button>
    <button type="button" class="w-btn-danger">Remove</button>
  </div>

</div>
```

---

## Badges & Avatars

### Neutral Badge — `w-badge`

```html
<span class="w-badge">Default</span>
<span class="w-badge">Admin</span>
```

### Green Status Badge — `w-badge-green`

Hidden on mobile by default (`hidden sm:inline-flex`). Override if needed.

```html
<!-- Hidden on mobile (default) -->
<span class="w-badge-green">Active</span>

<!-- Always visible -->
<span class="w-badge-green inline-flex">Active</span>
```

### Avatar — `w-avatar`

Default `size-10`. Override size and text-size for variants.

```html
<!-- Standard (40px) -->
<div class="w-avatar">DK</div>

<!-- Large (56px) for profile headers -->
<div class="w-avatar size-14 text-lg">DK</div>

<!-- Small (36px) -->
<div class="w-avatar size-9">DK</div>
```

### Icon Box — `w-icon-box`

Square container for SVG icons in card/section headers. Default is indigo tint.

```html
<!-- Default indigo -->
<div class="w-icon-box">
  <svg aria-hidden="true"><!-- icon --></svg>
</div>

<!-- Teal tint (override bg) -->
<div class="w-icon-box bg-teal-100 dark:bg-teal-900/50">
  <svg class="text-teal-600 dark:text-teal-400" aria-hidden="true"><!-- icon --></svg>
</div>
```

---

## Navigation

### Tab Bar — `w-nav-tab`

Horizontal tabs. Always add `group` as a separate class alongside `w-nav-tab` so Angular can use group-based hover styling.

```html
<div class="flex border-b border-gray-200 dark:border-gray-700">
  <button type="button"
          class="group w-nav-tab"
          [class.border-indigo-600]="activeTab === 'users'"
          [class.text-indigo-600]="activeTab === 'users'"
          [class.border-transparent]="activeTab !== 'users'"
          [class.text-gray-500]="activeTab !== 'users'"
          [attr.aria-current]="activeTab === 'users' ? 'page' : null"
          (click)="activeTab = 'users'">
    <svg class="size-4 group-[aria-current=page]:text-indigo-600" aria-hidden="true">...</svg>
    Users
  </button>
</div>
```

### Sidebar Nav Item — `w-nav-item`

Vertical sidebar navigation. Add `group` separately.

```html
<nav class="flex flex-col gap-1">
  <button type="button"
          class="group w-nav-item"
          [class.bg-indigo-50]="activeTab === 'profile'"
          [class.text-indigo-600]="activeTab === 'profile'"
          [class.dark:bg-indigo-900/30]="activeTab === 'profile'"
          [attr.aria-current]="activeTab === 'profile' ? 'page' : null"
          (click)="activeTab = 'profile'">
    <svg class="size-5 shrink-0" aria-hidden="true">...</svg>
    Profile
  </button>
</nav>
```

---

## Checkbox Group

Use for multi-select lists inside dialogs (e.g. assign roles/permissions).

```html
<label id="roles-label" class="w-label">Assign roles</label>
<div role="group" aria-labelledby="roles-label" class="w-checkbox-group">
  @for (role of roles; track role.id) {
    <label class="w-checkbox-row">
      <input type="checkbox" class="w-checkbox"
             [checked]="selectedRoles.includes(role.id)"
             (change)="toggleRole(role.id)" />
      <span class="text-sm text-gray-900 dark:text-white">{{ role.name }}</span>
    </label>
  }
</div>
```

---

## Typography Helpers

### Section Title — `w-section-title`

```html
<h2 class="w-section-title">Team members</h2>
```

### Section Subtitle — `w-section-subtitle`

```html
<p class="w-section-subtitle">Manage who has access to this workspace.</p>
```

### Micro Label — `w-micro-label`

10px uppercase tracking label for field metadata in detail views.

```html
<p class="w-micro-label">Email address</p>
<p class="text-sm text-gray-900 dark:text-white">jane@example.com</p>
```

---

## Misc Helpers

### Spinner — `w-spinner`

```html
<button class="w-btn-primary" [disabled]="saving">
  @if (saving) {
    <svg class="w-spinner" aria-hidden="true"><!-- spinner path --></svg>
  }
  Save
</button>
```

### Divider — `w-divider`

```html
<hr class="w-divider" />
<!-- or on a div -->
<div class="w-divider"></div>
```

---

## Dark Mode

Dark mode is **not** controlled by Tailwind's `darkMode` config. Instead it uses a class strategy:

```html
<!-- Root element of each widget component -->
<div [class.dark]="isDark()" class="...">
```

Every `w-*` class includes its own dark variant via `.dark & { ... }` nesting in SCSS — **you never need to add `dark:` prefixes in templates** when using `w-*` classes.

---

## Rules for New Developers

> **Before writing any Tailwind class in a widget HTML file, check this list first.**

### ✅ DO

- Use `w-*` classes for all standard UI elements
- Add `w-*` classes to `widget-ui.scss` if you need a new repeating pattern
- Follow the ARIA patterns: `role="dialog"` + `aria-labelledby`, `role="alert"` on errors
- Use `cursor-pointer` + `transition-colors duration-150` on all interactive elements
- Use `focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500` on all focusable elements (already included in `w-btn-*` classes)
- Use only Tailwind color tokens — **no hardcoded hex values**

### ❌ DON'T

- Write long inline Tailwind strings for patterns already in `widget-ui.scss`
- Add `dark:` prefixes in templates for elements already using `w-*` classes
- Use `darkMode: 'media'` or `darkMode: 'class'` in `tailwind.config.js` — the widget uses `[class.dark]` on the root element
- Introduce Angular Material legacy components (`MatLegacy*`)
- Add new colors to templates — extend `_custom-palette.scss` and reference via `var(--proxy-*)` tokens

### Adding a New Utility Class

1. Open `apps/36-blocks-widget/src/assets/scss/widget-ui.scss`
2. Add your class under the relevant section with `@apply`
3. Include a `.dark & { }` block for dark mode variants
4. **Do not use `group` or opacity-modifier classes (e.g. `bg-red-900/20`) inside `@apply`** — these are not supported by Tailwind's `@apply`. Use native CSS `background-color: rgb(... / 0.x)` instead.
5. Replace all instances in HTML files with the new class

```scss
// Example: adding a new warning badge
.w-badge-yellow {
    @apply inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium
           bg-yellow-50 text-yellow-700;

    .dark & {
        @apply text-yellow-400;
        background-color: rgb(113 63 18 / 0.3); // yellow-900/30 — native CSS
    }
}
```

---

## File Locations

| File | Purpose |
|---|---|
| `apps/36-blocks-widget/src/assets/scss/widget-ui.scss` | All `w-*` utility class definitions |
| `apps/36-blocks-widget/src/styles.scss` | Imports `widget-ui.scss` globally |
| `apps/36-blocks-widget/src/otp-global.scss` | Legacy global styles (being phased out) |
| `.windsurf/rules/widget-design.md` | Enforced design rules for AI pair programming |
