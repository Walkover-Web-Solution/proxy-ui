# Widget DOM Refactor — Imperative → Component-Based

> **Created:** Apr 6, 2026  
> **Scope:** `apps/36-blocks-widget/src/app/otp/widget/`  
> **Author:** Refactored from imperative Renderer2 DOM code to Angular components

---

## Table of Contents

1. [What Was the Problem](#1-what-was-the-problem)
2. [What Changed](#2-what-changed)
3. [New Files Created](#3-new-files-created)
4. [Constants — theme.constants.ts](#4-constants--themeconstantsts)
5. [Component Architecture](#5-component-architecture)
6. [Current Flow — How It Works](#6-current-flow--how-it-works)
7. [Layout Order Rules](#7-layout-order-rules)
8. [Theme Reactivity](#8-theme-reactivity)
9. [Benefits Summary](#9-benefits-summary)
10. [Adding a New Auth Button Type](#10-adding-a-new-auth-button-type)

---

## 1. What Was the Problem

`widget.component.ts` originally contained **~2007 lines** of imperative DOM code using Angular's `Renderer2` API to build every UI element by hand:

```typescript
// ❌ BEFORE — everything built manually
private appendButton(element, buttonsData): void {
    const button = this.renderer.createElement('button');
    button.style.cssText = `height:44px;width:316px;padding:0 16px;...`;
    button.addEventListener('click', () => { ... });
    const image = this.renderer.createElement('img');
    image.style.cssText = `height:20px;width:20px;...`;
    button.appendChild(image);
    element.appendChild(button);
}

private appendPasswordAuthenticationButtonV2(element, buttonsData, totalButtons): void {
    // 200+ lines building inputs, password toggle, hCaptcha, submit button...
}

private appendCreateAccountText(element): void {
    // 80+ lines building footer paragraph and SVG logo...
}
```

**Problems with this approach:**
- No HTML templates — all markup was scattered across method chains
- No SCSS — all styles were inline `cssText` strings duplicated everywhere
- Hardcoded magic numbers (`316px`, `44px`, `8px`, `Inter`, etc.) in many places
- Theme changes required DOM traversal + property mutation; no reactivity
- Impossible to unit test individual UI pieces
- Any designer change required hunting through TS code, not HTML/CSS

---

## 2. What Changed

| Area | Before | After |
|------|--------|-------|
| `widget.component.ts` size | ~2007 lines | ~1086 lines (~46% reduction) |
| Social/OTP button rendering | `appendButton()` — Renderer2 DOM build | `AuthButtonsComponent` via `createComponent` |
| Password login form | `appendPasswordAuthenticationButtonV2()` — 200+ line Renderer2 build | `InlineLoginComponent` via `createComponent` |
| Footer (create account + powered by) | `appendCreateAccountText()` — Renderer2 DOM build | `AuthFooterComponent` via `createComponent` |
| Theme colors | Hardcoded hex strings throughout | `THEME_COLORS` constant in `theme.constants.ts` |
| Layout dimensions | `316px`, `44px`, `8px` duplicated everywhere | `WIDGET_LAYOUT` constant in `theme.constants.ts` |
| Theme reactivity | Manual DOM node traversal + style mutation on theme change | Angular `isDark` signal — components re-render automatically |
| Dead code removed | `handlePasswordAuthenticationLogin`, `buildLoginFields`, `showForgotPasswordForm`, `showChangePasswordForm`, `restoreLoginForm`, `buildLoginFormContent`, `ensureHCaptchaScriptLoaded`, `shouldInvertIcon` | All removed (~750 lines) |

---

## 3. New Files Created

```
apps/36-blocks-widget/src/app/otp/widget/
├── theme.constants.ts              ← Centralized design tokens (NEW)
├── auth-buttons/
│   ├── auth-buttons.component.ts   ← Social/OTP button logic (NEW)
│   ├── auth-buttons.component.html ← Button template (NEW)
│   └── auth-buttons.component.scss ← :host { display: contents } (NEW)
├── auth-footer/
│   ├── auth-footer.component.ts    ← Footer logic (NEW)
│   ├── auth-footer.component.html  ← Footer template (NEW)
│   └── auth-footer.component.scss  ← :host { display: contents } (NEW)
└── inline-login/
    ├── inline-login.component.ts   ← Password login form logic (NEW)
    ├── inline-login.component.html ← Form template (NEW)
    └── inline-login.component.scss ← :host { display: contents } (NEW)
```

---

## 4. Constants — theme.constants.ts

Single source of truth for all design tokens used across the widget.

```typescript
// apps/36-blocks-widget/src/app/otp/widget/theme.constants.ts

export const WIDGET_LAYOUT = {
    widthV2:       '316px',   // container width for v2 widget
    widthV1:       '260px',   // container width for v1 widget
    gutterH:       '8px',     // standard horizontal gutter/margin
    fontFamily:    "'Inter', sans-serif",
    buttonHeight:  '44px',    // all auth buttons
    buttonFontSize:'14px',    // all button/input text
    buttonMargin:  '8px 8px 16px 8px',  // spacing below each button
    iconSizeLarge: '24px',    // icon-only mode icons
    iconSizeSmall: '20px',    // full-text button icons
    iconOnlyGap:   '35px',    // gap between icon-only buttons
    inputHeight:   '44px',    // username/password inputs
    formGap:       '8px',     // gap between form fields
} as const;

export const THEME_COLORS = {
    dark: {
        buttonText:           '#ffffff',
        buttonBorder:         '1px solid #ffffff',
        buttonBorderIconOnly: '1px solid #ffffff',
        poweredByLabel:       '#9ca3af',
        logoText:             '#F8F8F8',
        primaryColorFallback: '#FFFFFF',
    },
    light: {
        buttonText:           '#111827',
        buttonBorder:         '1px solid #000000',
        buttonBorderIconOnly: '1px solid #d1d5db',
        poweredByLabel:       '#6b7280',
        logoText:             '#1a1a1a',
        primaryColorFallback: '#000000',
    },
} as const;
```

**Usage in components:**

```typescript
import { THEME_COLORS, WIDGET_LAYOUT } from '../theme.constants';

// Expose to template
readonly layout = WIDGET_LAYOUT;

// Use in computed styles
get buttonWidth(): string {
    return this.useDiv ? WIDGET_LAYOUT.widthV2 : WIDGET_LAYOUT.widthV1;
}
```

```html
<!-- Use in template -->
[style.width]="layout.widthV2"
[style.height]="layout.buttonHeight"
[style.margin]="layout.buttonMargin"
```

---

## 5. Component Architecture

### AuthButtonsComponent (`proxy-auth-buttons`)

**Purpose:** Renders social login and OTP buttons.

**Inputs:**
| Input | Type | Description |
|-------|------|-------------|
| `buttons` | `any[]` | Array of button config objects from widget data |
| `version` | `string` | `'v1'` or `'v2'` — controls layout style |
| `inputFields` | `string` | `'top'` or `'bottom'` |
| `showIconsOnly` | `boolean` | Render icon row instead of full text buttons |
| `borderRadius` | `string` | CSS border-radius value |
| `otpButtonVisible` | `boolean` | Controls visibility of OTP button (hidden while script loads) |

**Outputs:**
| Output | Payload | Description |
|--------|---------|-------------|
| `buttonClicked` | `any` (button data) | Emits when user clicks any button |

**Modes:**
- **Icon-only** (`showIconsOnly=true`): All buttons rendered as a horizontal icon row. All buttons that share `showIconsOnly=true` are consolidated into **one component instance** via `iconOnlyButtonsRef` in `widget.component.ts` — avoids multiple separate icon rows.
- **Full text** (`showIconsOnly=false`): Each button is a full-width row with icon + label.

**Icon inversion:** Apple and password buttons automatically invert their icons in dark mode via `shouldInvertIcon()`.

---

### InlineLoginComponent (`proxy-inline-login`)

**Purpose:** Inline email/password login form embedded directly in the widget (no dialog).

**Inputs:**
| Input | Type | Description |
|-------|------|-------------|
| `buttonsData` | `any` | Service config for the password auth button |
| `loginWidgetData` | `any` | Registration state data |
| `version` | `string` | Widget version |
| `borderRadius` | `string` | CSS border-radius |
| `primaryColor` | `string` | Link/accent color |
| `buttonColor` | `string` | Sign-in button background |
| `buttonHoverColor` | `string` | Sign-in button hover background |
| `buttonTextColor` | `string` | Sign-in button text color |
| `totalButtons` | `number` | Total button count (controls divider rendering) |
| `inputFieldsPosition` | `string` | `'top'` or `'bottom'` |

**Outputs:**
| Output | Payload | Description |
|--------|---------|-------------|
| `forgotPasswordClicked` | `string` (email) | Opens existing `<proxy-login>` dialog via `setShowLogin(true)` |
| `loginSuccess` | `any` | Login API success response |
| `loginFailure` | `any` | Login API error |
| `registrationRequired` | `string` (username) | Triggers registration flow |

**Features:**
- Show/hide password toggle
- hCaptcha integration (loads script on init, destroys on destroy)
- Enter key submits form
- AES-encrypted password before API call

---

### AuthFooterComponent (`proxy-auth-footer`)

**Purpose:** "Are you a new user? Create an account" link and "Powered by 36Blocks" footer.

**Inputs:**
| Input | Type | Description |
|-------|------|-------------|
| `version` | `string` | Controls container width (v1=260px, v2=316px) |
| `primaryColor` | `string` | Color of "Are you a new user?" text |
| `signUpButtonText` | `string` | Label of the create account link |
| `showCreateAccount` | `boolean` | Whether to show the create account row |

**Outputs:**
| Output | Payload | Description |
|--------|---------|-------------|
| `createAccount` | `void` | User clicked the create account link |

---

## 6. Current Flow — How It Works

### Initialization sequence in `widget.component.ts`

```
ngOnInit()
  └── store.select(widgetTheme)
        └── addButtonsToReferenceElement(element)
              │
              ├── 1. Remove skeleton loader
              │
              ├── 2. prependLogoAndTitle(element)        ← if hasPasswordAuth && v2
              │         renders <img> + <div> for logo and title at container TOP
              │
              ├── 3. Sort widgetDataArray by input_fields
              │         input_fields='top'    → PasswordAuth FIRST
              │         input_fields='bottom' → PasswordAuth LAST
              │
              ├── 4. Loop: for each button in sortedDataArray
              │     ├── if Msg91OtpService → appendButton() (with 4s timeout / script-ready)
              │     ├── if PasswordAuthentication (v2) → appendPasswordAuthenticationButtonV2()
              │     └── else → appendButton()
              │
              └── 5. checkAndAppendCreateAccountText()
                        └── appendCreateAccountText()    ← mounts AuthFooterComponent
```

### DOM order produced

**`input_fields='bottom'`** (social at top, form below — most common):
```
[Logo]
[Title]
[Continue with Apple]        ← AuthButtonsComponent
[Continue with Google]       ← AuthButtonsComponent
[Login With OTP]             ← AuthButtonsComponent
──── Or continue with ────   ← createOrDivider()
[Email or Mobile]            ┐
[Password]          [👁]     │ InlineLoginComponent
[Forgot Password?]           │
[hCaptcha]                   │
[Sign in]                    ┘
Are you a new user? Create an account   ┐ AuthFooterComponent
Powered by 🔷 36Blocks                  ┘
```

**`input_fields='top'`** (form at top, social below):
```
[Logo]
[Title]
[Email or Mobile]            ┐
[Password]          [👁]     │ InlineLoginComponent
[Forgot Password?]           │
[hCaptcha]                   │
[Sign in]                    ┘
──── Or continue with ────
[Continue with Apple]
[Continue with Google]
[Login With OTP]
Are you a new user? Create an account
Powered by 🔷 36Blocks
```

### Dynamic component mounting

All three components are mounted outside Angular's normal component tree using:

```typescript
const ref = createComponent(AuthButtonsComponent, {
    environmentInjector: this.envInjector,
});
ref.setInput('buttons', buttonsData);
ref.instance.buttonClicked.subscribe((btn) => this.onButtonClick(btn));
this.appRef.attachView(ref.hostView);
this.mountedComponentRefs.push(ref);  // tracked for cleanup
const domNode = (ref.hostView as any).rootNodes[0] as HTMLElement;
element.appendChild(domNode);
ref.changeDetectorRef.detectChanges();
```

All refs are destroyed in `ngOnDestroy`:
```typescript
this.mountedComponentRefs.forEach((ref) => ref.destroy());
this.mountedComponentRefs.length = 0;
this.iconOnlyButtonsRef = null;
```

### Icon-only row consolidation

When `show_social_login_icons=true`, all buttons share **one** `AuthButtonsComponent` instance:

```typescript
// First button → creates the component
this.iconOnlyButtonsRef = ref;
element.appendChild(domNode);

// Subsequent buttons → add to existing component's array
const current = this.iconOnlyButtonsRef.instance.buttons ?? [];
this.iconOnlyButtonsRef.setInput('buttons', [...current, buttonsData]);
```

This ensures all icons appear in a **single row**, not separate rows.

---

## 7. Layout Order Rules

The sort logic in `addButtonsToReferenceElement` guarantees correct order:

```typescript
const sortedDataArray = hasPasswordAuth
    ? [...widgetDataArray].sort((a, b) => {
          const aPw = a?.service_id === FeatureServiceIds.PasswordAuthentication;
          const bPw = b?.service_id === FeatureServiceIds.PasswordAuthentication;
          if (aPw === bPw) return 0;
          return isInputFieldsTop ? (aPw ? -1 : 1) : (aPw ? 1 : -1);
      })
    : widgetDataArray;
```

| `input_fields` | PasswordAuth position in sort | Resulting DOM order |
|---------------|-------------------------------|---------------------|
| `'top'`       | First (-1)                    | Logo → Title → Form → Divider → Social buttons |
| `'bottom'`    | Last (+1)                     | Logo → Title → Social buttons → Divider → Form |

The divider (`createOrDivider`) is always placed **between** the form and the social buttons:
- `input_fields='top'`: divider inserted **after** form (`domNode.nextSibling`)
- `input_fields='bottom'`: divider inserted **before** form (`insertBefore(divider, domNode)`)

Social buttons in `appendButton` find the divider via `element.querySelector('[data-or-divider]')` and insert before it — ensuring they land on the correct side.

---

## 8. Theme Reactivity

All components use Angular's `computed` signal from `WidgetThemeService`:

```typescript
// In each component
readonly isDark = computed(() => this.themeService.isDark$());

// Reactive getter
get buttonBorder(): string {
    return this.isDark() ? THEME_COLORS.dark.buttonBorder : THEME_COLORS.light.buttonBorder;
}
```

```html
<!-- Template reacts automatically -->
[style.color]="isDark() ? '#ffffff' : '#111827'"
[style.border]="buttonBorder"
```

When the OS theme changes, `WidgetThemeService.isDark$` signal updates → Angular re-evaluates all `computed()` values → components re-render automatically **without page reload**.

`reapplyInjectedButtonTheme()` in `widget.component.ts` calls `markForCheck()` on all mounted refs to ensure they pick up theme changes even though they run outside the normal change detection tree:

```typescript
private reapplyInjectedButtonTheme(_dark: boolean): void {
    this.mountedComponentRefs.forEach((ref) => ref.changeDetectorRef.markForCheck());
}
```

---

## 9. Benefits Summary

### Code reduction
- `widget.component.ts`: **2007 → 1086 lines** (−46%)
- ~750 lines of dead imperative helpers deleted
- Each concern now lives in its own focused file

### Maintainability
| Task | Before | After |
|------|--------|-------|
| Change button style | Find correct `.style.cssText` assignment in TS | Edit `auth-buttons.component.html` or `WIDGET_LAYOUT` |
| Change button height | Search for `44px` across TS file | Change `WIDGET_LAYOUT.buttonHeight` in one place |
| Change primary font | Search for `Inter` across TS files | Change `WIDGET_LAYOUT.fontFamily` in one place |
| Add a new field to login form | Reverse-engineer 200-line Renderer2 chain | Edit `inline-login.component.html` |
| Debug login API flow | No breakpoints possible in template strings | Normal Angular debugging in component TS |

### Design token consistency
Before: `316px` appeared **6+ times** across different TS/template files with no connection.  
After: Single `WIDGET_LAYOUT.widthV2 = '316px'` — change once, applies everywhere.

### Testability
Each component now has a clean `@Input`/`@Output` interface:
- Unit test `AuthButtonsComponent` in isolation by passing mock `buttons[]`
- Unit test `InlineLoginComponent` by providing `loginWidgetData`
- No need to simulate the full orchestration

### Theme reactivity — no reload required
Before: Theme change required re-calling `reapplyInjectedButtonTheme()` which did manual DOM style mutations.  
After: Angular signal system handles it automatically for all three components.

---

## 10. Adding a New Auth Button Type

If a new service (e.g. GitHub SSO) is added:

1. **No component changes needed** — `AuthButtonsComponent` receives `buttons: any[]` generically. The button renders automatically if the server returns it in `widgetDataArray`.

2. **Handle click** in `widget.component.ts` `onButtonClick()`:
   ```typescript
   private onButtonClick(btn: any): void {
       if (btn?.urlLink) {
           window.open(btn.urlLink, this.target);  // OAuth redirect
       } else if (btn?.service_id === FeatureServiceIds.Msg91OtpService) {
           this.otpWidgetService.openWidget();
       } else if (btn?.service_id === FeatureServiceIds.PasswordAuthentication) {
           this.setShowLogin(true);
       }
       // New type: add else-if here
   }
   ```

3. **Icon inversion** for dark mode — update `shouldInvertIcon()` in `AuthButtonsComponent` if the new button needs icon color correction.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `widget/theme.constants.ts` | All design tokens — colors + layout dimensions |
| `widget/widget.component.ts` | Orchestration — mounts components, handles events, manages layout order |
| `widget/auth-buttons/` | Social/OTP button component |
| `widget/auth-footer/` | "Create account" + "Powered by" footer component |
| `widget/inline-login/` | Email/password login form component |
| `service/widget-theme.service.ts` | Reactive dark/light mode detection via signal |
| `service/proxy-auth-dom-builder.service.ts` | Remaining imperative helpers: skeleton loader, `createOrDivider` |
