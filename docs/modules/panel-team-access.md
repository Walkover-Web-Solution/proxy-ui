---
covers: ["apps/36-blocks/src/app/panel/team/**", "apps/36-blocks/src/app/oauth/connections/**", "apps/36-blocks/src/app/panel/layout/create-workspace-dialog/**", "tools/tests/team-access.test.cjs"]
verified_at: b7d51dad
verified_on: 2026-11-22
---
# Team & access and operator activity

Operator-facing workspace administration beyond end-user **People** (`/app/users`): team members, operator roles, API keys, connected AI tools, and the **Operator activity** audit view.

| Route | Section | Component |
|---|---|---|
| `/app/team` | shell + tabs | `TeamComponent` |
| `/app/team/members` | invite and list operators | `MembersComponent` |
| `/app/team/roles` | global operator roles / permissions | `RolesComponent` |
| `/app/team/api-keys` | workspace API keys | `ApiKeysComponent` |
| `/app/team/ai-tools` | MCP OAuth connections | `AiToolsComponent` (`oauth/connections/`) |
| `/app/activity` | audit log + Login as | `ActivityComponent` |

Nav labels and header titles: [ui/routes.md](../ui/routes.md). Shell layout and client switching: [panel-ops](./panel-ops.md).

## Team & access (`TeamService`)

`TeamService` (`apps/36-blocks/src/app/panel/team/team.service.ts`) uses `HttpWrapperService` and paths from `team.urls.ts` on `environment.baseUrl`:

| UI area | HTTP | Path |
|---|---|---|
| Members list | GET | `users` (paginated; `pageNo`, `itemsPerPage`, optional `name`) |
| Invite member | POST | `invite` |
| Change member role | PUT | `updateUserRole` |
| Roles catalog | GET | `rolePermissions` (`itemsPerPage: 100`; cached per visit via `shareReplay`) |
| API keys list | GET | `authentications` |
| Create / update / revoke key | POST / PUT / DELETE | `authentications`, `authentications/:id` |

Operator **roles** are global, not per workspace (`getRoles` comment). Member management is scoped to the current client by the session token (same rule as other dashboard calls: no `client_id` in the body).

`errorMessages` and `isForbidden` in `team.models.ts` map backend failures to UI copy. 403 on members shows a forbidden state rather than an empty table.

### Connected AI tools

The **ai-tools** tab lists MCP connections from `GET operator/oauth/connections` (`OAuthService` in `apps/36-blocks/src/app/oauth/oauth.service.ts`). Revoke calls `POST operator/oauth/connections/:id/revoke`. The consent flow that creates connections is documented in [panel-ai-setup](./panel-ai-setup.md).

### Create workspace

`CreateWorkspaceDialogComponent` (opened from layout header or OAuth consent when no workspace) posts through the root store / `RootService` patterns described in [panel-ops](./panel-ops.md). After creation, lists and guards refresh on navigation or full reload.

## Operator activity (`ActivityService`)

`/app/activity` is for **operators** auditing actions and (where permitted) starting a **Login as** session for an end user.

| Call | Method | Path | Purpose |
|---|---|---|---|
| List operations | GET | `operations` | Paginated `ActivityOperation` rows; filters in `activity.models.ts` |
| Login as | POST | `loginAs` | Body `{ user_id, company_id?, reason }` → may return `redirect_url` or tokens |

Query param `target_user_id` (positive integer) pre-fills Login as when the URL is safe. `activityActor` labels rows (human vs system vs impersonation). Forbidden responses use `isActivityForbidden`; the UI prompts for login when the session cannot view activity.

Impersonation and investigation flows are covered by `tools/tests/panel-investigation.test.cjs`.

## Distinction from `/app/users`

| | `/app/users` (People) | `/app/team` (Team & access) |
|---|---|---|
| Audience | End users of customer blocks | Operators of the 36Blocks workspace |
| APIs | `UsersService`, `/:referenceId/cRoles`, … | `TeamService`, `users` / `invite` / `authentications`, … |
| Doc | [panel-ops](./panel-ops.md#users) | this file |

## Verification

```bash
npm run test:v0
```

Includes `tools/tests/team-access.test.cjs` (models and components without a full Angular harness).

## Changing it safely

- New team tab: add a child under `team.routes.ts`, a nav tab in `team.component.html`, and an entry in `LayoutComponent`'s `currentArea` map.
- New operator endpoint: extend `TeamUrls` / `TeamService` and document the path in [api.md](../api.md#dashboard-operator-team-mcp-oauth-and-activity).
- Activity filters: keep query param building in `activityParams` so pagination and "Apply" stay in sync.