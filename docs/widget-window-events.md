# 36Blocks Widget — Window Events

Trigger widget actions from anywhere in your client app by dispatching standard browser `CustomEvent`s on `window`.

---

## Available Events

| Event name | Constant | Description |
|---|---|---|
| `openInviteMemberDialogAt36Blocks` | `WidgetEvent.OpenInviteMemberDialog` | Opens the Invite Member dialog |

---

## `openInviteMemberDialogAt36Blocks`

Opens the **Invite Member** (Add User) dialog. Works whether or not the User Management widget is currently visible on the page.

### Payload (`detail`)

| Field | Type | Required | Description |
|---|---|---|---|
| `authToken` | `string` | Yes | Your organisation auth token |
| `theme` | `'dark' \| 'light'` | No | Forces dark or light mode. If omitted, the dialog auto-detects from the client page: checks for `.dark` class or `data-theme="dark"` on `<html>`/`<body>`, then falls back to OS `prefers-color-scheme`. |

### Usage

```js
window.dispatchEvent(
  new CustomEvent('openInviteMemberDialogAt36Blocks', {
    detail: {
      authToken: 'YOUR_AUTH_TOKEN',
      theme: 'dark', // optional
    },
  })
);
```

### React / Next.js example

```tsx
function InviteButton() {
  const openInviteDialog = () => {
    window.dispatchEvent(
      new CustomEvent('openInviteMemberDialogAt36Blocks', {
        detail: { authToken: 'YOUR_AUTH_TOKEN' },
      })
    );
  };

  return <button onClick={openInviteDialog}>Invite Member</button>;
}
```

### Timing

The event can be dispatched **at any time** — before or after the widget script has finished bootstrapping. Events fired early are buffered and replayed automatically once the widget is ready.

---

## Adding a new event (for widget developers)

1. Add a new value to `WidgetEvent` in `libs/constant/src/widget-events.ts`:
   ```ts
   export enum WidgetEvent {
     OpenInviteMemberDialog = 'openInviteMemberDialogAt36Blocks',
     OpenMyNewDialog        = 'openMyNewDialogAt36Blocks', // ← add here
   }
   ```

2. Create your dialog component (plain Angular component, no special base class needed).

3. Create a bridge service that listens on the new event and calls `WidgetDialogService.open()`:
   ```ts
   window.addEventListener(WidgetEvent.OpenMyNewDialog, (e: Event) => {
     this._dialogService.open(MyNewDialogComponent, {
       theme: (e as CustomEvent).detail?.theme,
       setup: (instance, ref) => {
         instance.dialogRef = ref;
         // set any other inputs here
       },
     });
   });
   ```

4. Register the early buffer listener in `init-verification.ts` (same pattern as `OpenInviteMemberDialog`).

5. Update this doc.
