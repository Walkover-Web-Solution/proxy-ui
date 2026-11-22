---
covers: ["apps/36-blocks/src/app/ai-setup/**", "apps/36-blocks/src/app/oauth/**", "tools/tests/setup-with-ai.test.cjs", "tools/tests/oauth-consent.test.cjs"]
verified_at: b7d51dad
verified_on: 2026-11-22
---
# AI setup wizard and operator MCP OAuth

Two related areas help operators connect AI tools to 36Blocks: the **Set up with AI** wizard (`/app/setup`) and the **MCP OAuth consent** page (`/oauth/authorize`). Neither path puts credentials into copy-paste prompts; the agent is expected to use the published MCP server and browser sign-in.

| Area | Route | Main code |
|---|---|---|
| Setup wizard | `/app/setup` | `apps/36-blocks/src/app/ai-setup/setup-wizard/setup-wizard.component.ts`, `ai-setup.service.ts` |
| Zero-blocks redirect | child guard on `/app` | `apps/36-blocks/src/app/ai-setup/zero-blocks.guard.ts`, `setup-redirect.ts` |
| Homepage / wizard prompts | copied text, no secrets | `apps/36-blocks/src/app/ai-setup/ai-prompts.ts` |
| MCP connection snippets | dialog on blocks / homepage | `apps/36-blocks/src/app/ai-setup/ai-setup-panel/ai-setup-panel.component.ts` |
| Operator OAuth consent | `/oauth/authorize` | `apps/36-blocks/src/app/oauth/authorize/oauth-authorize.component.ts`, `oauth.service.ts` |
| Connected AI tools tab | `/app/team/ai-tools` | `apps/36-blocks/src/app/oauth/connections/ai-tools.component.ts` |

Published constants in `ai-prompts.ts`: MCP server `https://mcp.docstar.io/connector/36blocks_user_api`, CLI fallback `npx docstar-cli init 36blocks_user_api`. The homepage hero and wizard prompts prefer MCP, then CLI; they never include JWTs or API keys.

## Zero-blocks guard

`panelRoutes` mounts `canActivateChild: [zeroBlocksGuard]` on the `LayoutComponent` parent (`apps/36-blocks/src/app/panel/panel.routes.ts`).

1. Runs only in the browser and only for **entry** URLs: `/app`, `/app/dashboard`, `/app/features` (`isRedirectableRoute` in `setup-redirect.ts`). Deep links (team, billing, `/app/setup`, `/app/features/create`, …) are never intercepted.
2. `AiSetupService.resolveWorkspace()` loads the active client id and whether the workspace has blocks (`FeaturesService.getFeature` with one row).
3. If status is `loaded`, `total === 0`, the user has not chosen **Skip, I'll set up manually** for this workspace in this tab (`sessionStorage` key `ai_setup_skipped_<clientId>`), and the URL is redirectable → navigate to `SETUP_ROUTE` (`/app/setup`).
4. On load error or `denied`, the guard returns `true` (no redirect).

Signing out clears wizard skip state (`AiSetupService`); switching workspace reloads the page, so the guard runs again for the new client.

## Setup wizard (`/app/setup`)

`SetupWizardComponent` walks the operator through connecting MCP (or CLI), browser authorization, creating a first block, and pasting the widget snippet. **Skip** writes the per-tab skip flag and sends the user to `/app/features/create`. The wizard is also reachable from the **Set up with AI** entry points without going through the guard when already on non-entry routes.

`AiSetupService.openSetupDialog()` lazy-loads `SetupWithAiDialogComponent` for in-context prompts (e.g. from the blocks area).

## Operator MCP OAuth (`/oauth/authorize`)

Separate from the **widget** OAuth consent flow in [widget-verification](../flows/widget-verification.md) (end-user `auth2` on customer sites).

1. An AI tool opens `/oauth/authorize` with standard OAuth query params. `CanActivateRouteGuard` requires a signed-in operator; unsigned visitors go to login with a safe return URL (`apps/36-blocks/src/app/app.component.ts` `resolvePostLoginTarget`).
2. `parseAuthorizeRequest` validates the query. Invalid requests show an inline error; the browser is **not** sent to the client's `redirect_uri`.
3. `OAuthService` calls `GET operator/oauth/authorize` on `environment.baseUrl` (see [api.md](../api.md#dashboard-operator-team-mcp-oauth-and-activity)).
4. **Ready** consent shows client name, scopes, workspace switcher, and Approve / Deny. `POST operator/oauth/decision` returns `redirect_to`; navigation uses `safeRedirectTarget` (http(s) only). Authorization codes in URLs are not logged or stored.
5. **PKCE** (`code_challenge` / `code_challenge_method`) is optional on the consent payload (server validates when present).
6. **No workspace**: operator can open `CreateWorkspaceDialogComponent` or pick another client before consenting.

Revoking a connected tool: **Team & access → Connected AI tools** (`AiToolsComponent`) → `POST operator/oauth/connections/:id/revoke`. Details in [panel-team-access](./panel-team-access.md).

## Layout interaction

`LayoutComponent` uses `shouldCollapseSidebarForEmptyWorkspace` (`sidebar-default.ts`) to collapse the sidebar when the workspace has no blocks (in addition to the first-block hide on `/features/create`). Workspace creation is available from the header via `CreateWorkspaceDialogComponent`.

## Verification

Focused behavior tests (no Angular test runner required):

```bash
npm run test:v0
```

Relevant files: `tools/tests/setup-with-ai.test.cjs`, `tools/tests/oauth-consent.test.cjs`, `tools/tests/panel-investigation.test.cjs`. CI job **V0 behavior checks** (`.github/workflows/v0-behavior.yml`) runs this on pull requests.

## Changing it safely

- **Redirect rules:** change `setup-redirect.ts` and extend `tools/tests/setup-with-ai.test.cjs` in the same PR.
- **Prompt text:** edit `ai-prompts.ts`; do not embed tokens. Update tests if exported strings change.
- **New OAuth query params:** update `oauth-consent.ts`, `OAuthAuthorizeComponent`, and `tools/tests/oauth-consent.test.cjs`.
- **Never** weaken `safeRedirectTarget` or log `redirect_to` URLs that may contain codes.