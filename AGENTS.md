# Working on proxy-ui

Owns the Angular public website, operator dashboard and embeddable authentication widget. Backend APIs, persistence and session policy belong to sibling `user-proxy`; connected applications own business authorization.

Start with the canonical [work state](../user-proxy/docs/WORK-STATE.md), [architecture](../user-proxy/docs/ARCHITECTURE.md), [capabilities](../user-proxy/docs/CAPABILITIES.md), [development](../user-proxy/docs/DEVELOPMENT.md), [security](../user-proxy/docs/SECURITY-OPERATIONS.md) and [design](../user-proxy/docs/DESIGN.md). Preserve existing README contribution rules and DESIGNGUIDE.md. Read widget integration/event guides before changing the custom element contract.

- Branch workflow: use `production` as the frontend base and PR target. Before pushing a feature branch or opening its PR, fetch and merge the latest `origin/production` into that feature branch. Keep release branches unchanged until PR review.
- Inspect status/diff; preserve unrelated changes. New application code uses TypeScript and existing standalone Angular patterns. Use Angular CLI scaffolding when practical; never change architecture solely to satisfy scaffolding.
- Install from lock using `npm ci --ignore-scripts --legacy-peer-deps`; generate ignored env modules with `node tools/set-env`. Review environment base URLs before starting: local config defaults to a remote test API.
- Run `node --test tools/tests/*.test.cjs`, affected builds and `git diff --check`. Existing Nx/Jest targets have known gaps: report exact commands and limitations in canonical work state.
- Keep error, denied, empty and loading states distinct; provide retry. Never render request data as HTML or log/store tokens. Client visibility does not replace server authorization.
- Update the single backend-owned capability matrix and work state alongside changes. Product/architecture guidance is linked, not duplicated here. Public claims require evidence; do not invent SLAs, guarantees or future functional controls.
