# Widget Design Structure

## Stack
- **Tailwind CSS v4** — default color palette only (`gray-*`, `blue-*`, `red-*`, etc.). No custom token mapping.
- **Angular Material v21** — MDC components for forms, dialogs, tables, tabs only. No custom Material theming applied to templates.
- **No inline `style=` attributes** in templates.
- **No custom SCSS** in component files — only `:host` display/layout overrides if strictly necessary.

---

## Color Conventions (Tailwind defaults)

| Role | Light | Dark |
|---|---|---|
| Page background | `bg-white` | `dark:bg-gray-900` |
| Card background | `bg-white` | `dark:bg-gray-800` |
| Card border | `border-gray-200` | `dark:border-gray-700` |
| Primary text | `text-gray-900` | `dark:text-gray-100` |
| Secondary / muted text | `text-gray-500` | `dark:text-gray-400` |
| Label / caption text | `text-gray-400` | `dark:text-gray-500` |
| Primary action (buttons) | `bg-blue-600 text-white` | same |
| Primary action hover | `hover:bg-blue-700` | same |
| Danger | `text-red-600` / `bg-red-600` | same |
| Success | `text-green-600` | same |
| Input border | `border-gray-300` | `dark:border-gray-600` |
| Input background | `bg-white` | `dark:bg-gray-800` |
| Divider | `border-gray-100` | `dark:border-gray-700` |

> Dark mode is toggled via `[class.dark]` on the root widget `<div>` using Tailwind's `darkMode: ['class']` config.

---

## Typography Conventions

| Use | Class |
|---|---|
| Page / card title | `text-lg font-semibold text-gray-900` |
| Section heading | `text-sm font-semibold text-gray-700` |
| Body text | `text-sm text-gray-700` |
| Muted / caption | `text-xs text-gray-500` |
| Label above field | `text-xs font-medium text-gray-500 uppercase tracking-wide` |
| Error message | `text-xs text-red-600` |

---

## Spacing Conventions

| Element | Class |
|---|---|
| Card padding | `p-6` |
| Section gap | `gap-6` |
| Form field gap | `gap-4` |
| Button gap in row | `gap-3` |
| Input height | Angular Material `appearance="outline"` handles this |

---

## Component Map

### 1. `widget-shell` — `widget.component.html`
The outer wrapper rendered by the Angular Element. Contains:
- Header bar (logo, title, close button)
- Router outlet for inner views
- Overlay/modal container

### 2. `send-otp-center` — `send-otp-center.component.html`
First screen: enter phone number or email to receive OTP.
- Input field + send button
- Social login buttons (optional)
- "Already have an account" link

### 3. `login` — `login.component.html`
Email + password form.
- Input fields (email, password with show/hide toggle)
- "Forgot password" link
- Submit button
- Switch to OTP/register

### 4. `register` — `register.component.html`
Multi-step registration:
- Step 1: name, email, phone
- Step 2: OTP verification (4 boxes)
- Step 3: password setup

### 5. `subscription-center` — `subscription-center.component.html`
Plan selection:
- Plan cards (title, price, features list)
- CTA button per card
- Current plan highlight

### 6. `user-profile` — `user-profile.component.html`
Authenticated user view/edit:
- Avatar + name + email banner
- View mode: read-only field rows
- Edit mode: form fields
- Organizations list / table

### 7. `user-management` — `user-management.component.html`
Admin panel:
- Members tab: search, user rows, edit/remove buttons
- Roles tab: roles table with permissions
- Permissions tab

### 8. `organization-details` — `organization-details.component.html`
Org settings form:
- Name, timezone, logo upload
- Save/cancel buttons

---

## Migration Order (tell me which to start)
1. `send-otp-center`
2. `login`
3. `register`
4. `subscription-center`
5. `user-profile`
6. `user-management`
7. `organization-details`
8. `widget-shell` (last — depends on inner views)

---

## Files Reference

| File | Purpose |
|---|---|
| `src/tailwind-blocks.html` | Paste paid Tailwind UI blocks here |
| `src/styles.scss` | Global styles — minimal |
| `src/otp-global.scss` | Widget-specific global overrides |
| `src/shadow-dom-theme.scss` | Material theme for Shadow DOM components |
| `apps/shared/scss/global.scss` | Tailwind import + shared utilities |
| `tailwind.config.js` (root) | Tailwind config — content globs + darkMode |
