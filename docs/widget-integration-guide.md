# Proxy Auth Widget — Client Integration Guide

> **Created:** Mar 25, 2026  
> **Scope:** `apps/36-blocks-widget` — `initVerification` usage examples for all widget types  
> **Script output:** `dist/apps/36-blocks/assets/proxy-auth/proxy-auth.js`

---

## Table of Contents

1. [How It Works](#how-it-works)
2. [Base Script Loader](#base-script-loader)
3. [Example 1 — Authorization (Login)](#example-1--authorization-login)
4. [Example 2 — User Profile](#example-2--user-profile)
5. [Example 3 — User Management](#example-3--user-management)
6. [Example 4 — Organization Details](#example-4--organization-details)
7. [Example 5 — Subscription](#example-5--subscription)
8. [Example 6 — Authorization (Advanced)](#example-6--authorization-advanced)
9. [All Config Properties](#all-config-properties)
10. [Notes & Rules](#notes--rules)

---

## How It Works

1. A `<div id="YOUR_REFERENCE_ID">` acts as the mount point for the widget.
2. The `proxy-auth.js` script registers a global `window.initVerification(config)` function.
3. Calling `initVerification` creates and appends a `<proxy-auth>` custom element inside the container div.
4. The widget fetches its configuration from the API using `referenceId`, renders buttons, and handles the full auth flow.

---

## Base Script Loader

Add this **once** per page. Replace `SCRIPT_URL` with the actual hosted path of `proxy-auth.js`.

```html
<script type="text/javascript">
  var scriptElement = document.createElement('script');
  scriptElement.src = 'SCRIPT_URL'; // e.g. https://yourdomain.com/assets/proxy-auth/proxy-auth.js
  scriptElement.onload = function () {
    initVerification(configuration);
  };
  document.body.appendChild(scriptElement);
</script>
```

---

## Example 1 — Authorization (Login)

Default widget type. Shows OTP, social login, and/or password login buttons based on your dashboard configuration.

```html
<!-- Container — id must exactly match referenceId -->
<div id="YOUR_REFERENCE_ID"></div>

<script type="text/javascript">
  var configuration = {
    referenceId: 'YOUR_REFERENCE_ID',   // required
    theme: 'system',                     // 'system' | 'light' | 'dark'
    target: '_self',                     // '_self' | '_blank'
    // loginRedirectUrl: 'https://example.com/dashboard',
    success: function (data) {
      // data contains the verified auth token
      console.log('Login success', data);
    },
    failure: function (error) {
      console.error('Login failed', error);
    },
  };
</script>

<!-- Base script loader -->
<script type="text/javascript">
  var scriptElement = document.createElement('script');
  scriptElement.src = 'SCRIPT_URL';
  scriptElement.onload = function () { initVerification(configuration); };
  document.body.appendChild(scriptElement);
</script>
```

---

## Example 2 — User Profile

Displays the authenticated user's profile. Requires an `authToken` obtained from a previous login success callback.

```html
<div id="YOUR_REFERENCE_ID"></div>

<script type="text/javascript">
  var configuration = {
    referenceId: 'YOUR_REFERENCE_ID',
    authToken: 'ENCRYPTED_AUTH_TOKEN',  // from login success callback
    type: 'user-profile',
    theme: 'system',
    target: '_self',
    success: function (data) {
      console.log('Profile action success', data);
    },
    failure: function (error) {
      console.error('Profile error', error);
    },
  };
</script>

<script type="text/javascript">
  var scriptElement = document.createElement('script');
  scriptElement.src = 'SCRIPT_URL';
  scriptElement.onload = function () { initVerification(configuration); };
  document.body.appendChild(scriptElement);
</script>
```

---

## Example 3 — User Management

Shows a role & user management panel. Requires an `authToken`. Use `isRolePermission`, `include_role_ids`, and `exclude_role_ids` to control visibility.

```html
<div id="YOUR_REFERENCE_ID"></div>

<script type="text/javascript">
  var configuration = {
    referenceId: 'YOUR_REFERENCE_ID',
    authToken: 'ENCRYPTED_AUTH_TOKEN',
    type: 'user-management',
    theme: 'system',
    isRolePermission: true,             // show role-based permission UI
    isHidden: false,                    // set true to mount widget hidden initially
    // exclude_role_ids: [1, 2],        // role IDs to hide
    // include_role_ids: [3, 4],        // role IDs to show
    target: '_self',
    success: function (data) {
      console.log('User management success', data);
    },
    failure: function (error) {
      console.error('User management error', error);
    },
  };
</script>

<script type="text/javascript">
  var scriptElement = document.createElement('script');
  scriptElement.src = 'SCRIPT_URL';
  scriptElement.onload = function () { initVerification(configuration); };
  document.body.appendChild(scriptElement);
</script>
```

---

## Example 4 — Organization Details

Renders the organization details view. Use `showCompanyDetails` to include the company info section.

```html
<div id="YOUR_REFERENCE_ID"></div>

<script type="text/javascript">
  var configuration = {
    referenceId: 'YOUR_REFERENCE_ID',
    authToken: 'ENCRYPTED_AUTH_TOKEN',
    type: 'organization-details',
    showCompanyDetails: true,           // include company details section
    theme: 'system',
    target: '_self',
    success: function (data) {
      console.log('Org details success', data);
    },
    failure: function (error) {
      console.error('Org details error', error);
    },
  };
</script>

<script type="text/javascript">
  var scriptElement = document.createElement('script');
  scriptElement.src = 'SCRIPT_URL';
  scriptElement.onload = function () { initVerification(configuration); };
  document.body.appendChild(scriptElement);
</script>
```

---

## Example 5 — Subscription

Shows subscription plans. Set `isLogin: true` to display a login flow alongside the plans.

```html
<div id="YOUR_REFERENCE_ID"></div>

<script type="text/javascript">
  var configuration = {
    referenceId: 'YOUR_REFERENCE_ID',
    type: 'subscription',
    theme: 'system',
    isPreview: false,                   // true = preview mode, no real purchases
    isLogin: true,                      // true = show login UI alongside plans
    // loginRedirectUrl: 'https://example.com/dashboard',
    target: '_self',
    success: function (data) {
      console.log('Subscription success', data);
    },
    failure: function (error) {
      console.error('Subscription error', error);
    },
  };
</script>

<script type="text/javascript">
  var scriptElement = document.createElement('script');
  scriptElement.src = 'SCRIPT_URL';
  scriptElement.onload = function () { initVerification(configuration); };
  document.body.appendChild(scriptElement);
</script>
```

---

## Example 6 — Authorization (Advanced)

Uses `version: 'v2'` UI, icon-only social buttons, custom input field position, and registration-only mode. URL query parameters can also pre-fill registration fields.

```html
<div id="YOUR_REFERENCE_ID"></div>

<script type="text/javascript">
  var configuration = {
    referenceId: 'YOUR_REFERENCE_ID',
    theme: 'dark',
    version: 'v2',                      // 'v1' (default) | 'v2' (new UI)
    input_fields: 'top',                // 'top' | 'bottom' — input position
    show_social_login_icons: true,      // icon-only social login buttons
    isRegisterFormOnly: false,          // true = show only the registration form
    target: '_blank',
    // Pre-fill registration form via URL query params:
    //   ?first_name=John&last_name=Doe&email=a@b.com&signup_service_id=6
    success: function (data) {
      console.log('Success', data);
    },
    failure: function (error) {
      console.error('Failure', error);
    },
  };
</script>

<script type="text/javascript">
  var scriptElement = document.createElement('script');
  scriptElement.src = 'SCRIPT_URL';
  scriptElement.onload = function () { initVerification(configuration); };
  document.body.appendChild(scriptElement);
</script>
```

---

## All Config Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `referenceId` | `string` | — | **Required.** Widget ID from the dashboard. Must also be the `id` of the container `<div>`. |
| `authToken` | `string` | — | Encrypted auth token for authenticated-user views (`user-profile`, `user-management`, `organization-details`). |
| `type` | `string` | `'authorization'` | Widget mode. One of: `'authorization'` · `'user-profile'` · `'user-management'` · `'organization-details'` · `'subscription'` |
| `theme` | `string` | `'system'` | Color theme. One of: `'system'` · `'light'` · `'dark'` |
| `target` | `string` | `'_self'` | Link open target. `'_self'` or `'_blank'`. |
| `version` | `string` | `'v1'` | Widget UI version. `'v1'` or `'v2'`. |
| `showCompanyDetails` | `boolean` | `false` | Show company details section in `organization-details` view. |
| `isHidden` | `boolean` | `false` | Mount widget hidden initially (useful for `user-management` dialog trigger). |
| `isRolePermission` | `boolean` | `false` | Enable role-based permission UI in `user-management`. |
| `isPreview` | `boolean` | `false` | Preview mode — no live data mutations. Useful for testing UI. |
| `isLogin` | `boolean` | `false` | Show login UI alongside subscription plans (`subscription` type). |
| `isRegisterFormOnly` | `boolean` | `false` | Show only the registration form, skipping the login/auth buttons. |
| `loginRedirectUrl` | `string` | — | URL to redirect to after a successful login. |
| `input_fields` | `string` | `'top'` | Input field position. `'top'` or `'bottom'`. |
| `show_social_login_icons` | `boolean` | `false` | Show social login as icon-only buttons instead of full-width. |
| `exclude_role_ids` | `number[]` | — | Role IDs to hide in the `user-management` view. |
| `include_role_ids` | `number[]` | — | Role IDs to show in the `user-management` view. |
| `success` | `function(data)` | — | **Required.** Callback invoked on successful action. `data` contains the verified auth token or result. |
| `failure` | `function(error)` | — | Callback invoked on failure. `error` contains the failure reason. |

---

## Notes & Rules

- The container `<div id>` **must match `referenceId` exactly**. The widget polls for the element up to 5 seconds after script load — it is safe to call `initVerification` before the DOM is fully painted.
- Calling `initVerification` a second time **replaces** the existing widget (the old `<proxy-auth>` element and any skeleton loaders are cleaned up automatically).
- `success` callback is **required** — omitting it throws `Error: success callback function missing!`.
- Any property not in the reserved list is forwarded as extra payload to the widget API (e.g. custom `otherData` fields).
- URL query parameters `first_name`, `last_name`, `email`, `signup_service_id` automatically pre-fill the registration form.
