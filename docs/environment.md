---
covers: ["tools/set-env.js", "tools/postbuild.js", ".env.example", "apps/36-blocks/src/environments/**", "apps/36-blocks-widget/src/environments/**", "apps/36-blocks/project.json", "apps/36-blocks-widget/project.json", "package.json", "nx.json", ".github/workflows/main.yml", "apps/36-blocks/src/server.ts"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# Environment

Configuration has two layers, both compiled into the browser bundles:

1. **Secrets-ish values from .env / `process.env`.** `tools/set-env.js` writes them into a generated, gitignored env-variables.ts per app.
2. **Per-environment constants** (API hosts, `production`, `env`) hard-coded in `apps/36-blocks/src/environments/` and `apps/36-blocks-widget/src/environments/`. The build picks one through `fileReplacements` in each `project.json`.

Each environment*.ts spreads `...envVariables` from `./env-variables`. There is no runtime config: changing a value means rebuilding.

> [!WARNING]
> Every value here ships in public JavaScript. That includes the four AES keys `AUTH_UI_ENCODE_KEY`, `AUTH_UI_IV_KEY`, `AUTH_API_ENCODE_KEY` and `AUTH_API_IV_KEY`, which end up in proxy-auth.js on every customer site. Anyone can read them from the bundle. Treat the AES layer as obfuscation, not secrecy, and never add a real server secret to `set-env.js`.

## Run it locally

Prerequisites: Node 20 (CI uses `node-version: "20"`; Angular 21 needs Node 20.19+). The README's "Node 14+" is stale. Use npm; CI installs with `npm ci --audit false --legacy-peer-deps`.

1. `npm ci --legacy-peer-deps` (or `npm i --legacy-peer-deps`).
2. `cp .env.example .env` and fill in the values (ask the team; never commit .env). Add `HCAPTCHA_SITE_KEY` and `SEND_OTP_AUTH_KEY` by hand: `set-env.js` reads them but `.env.example` does not list them.
3. Dashboard: `npm start`. It runs `node tools/set-env --proxy`, then `nx serve --configuration=serve --project=36-blocks` (build config `development`, which has no `fileReplacements`, so it uses `environment.ts`: API `https://apitest.msg91.com/api`, `proxyServer` `http://localhost:4200`). The dev server binds `host: 0.0.0.0` on the default port 4200.
4. Widget alone: `npm run start:proxy-auth`. It runs `node tools/set-env --auth`, then `nx serve 36-blocks-widget`. The `development` config swaps `main.ts` for `main.dev.ts` and uses `apps/36-blocks-widget/src/index.html`, where `AppComponent` calls `initVerification` with hard-coded test values. Default port is also 4200, so stop the dashboard first or pass `--port`.
5. Widget inside the dashboard (admin preview, `/register`): the dashboard loads `http://localhost:4200/assets/proxy-auth/proxy-auth.js`. Build it with `npm run build:proxy-auth`; `apps/36-blocks-widget/build-elements.js` writes the dev copy to apps/36-blocks/src/assets/proxy-auth/proxy-auth.js (gitignored). See [widget-embed](./modules/widget-embed.md).

It is up when the console shows `[set-env] Written: …/env-variables.ts` and the Nx dev server prints its local URL. A `[set-env] WARNING: env var "…" is not set` line locally means that value is `undefined` in the bundle.

### Scripts (`package.json`)
| Script | Does |
|---|---|
| `start` | set-env `--proxy`, serve dashboard (`serve` config) |
| `start:proxy-auth` | set-env `--auth`, serve widget (`development` config) |
| `build` / `build:test` / `build:stage` / `build:prod` | widget build (`build:proxy-auth:widget[:x]`) → dashboard build (`build:web[:x]`) → `build-elements.js`. The order matters: `build-elements.js` writes proxy-auth.js into `dist/apps/36-blocks/browser/assets/proxy-auth/`, so the dashboard build must run first. <!-- verify:ignore --> |
| `build:web` | set-env `--proxy`, `nx build 36-blocks --configuration=local`. No `postbuild`, so no version.json. |
| `build:web:test` / `:stage` / `:prod` | set-env `--proxy`, `nx build 36-blocks --configuration=<test\|stage\|production>`, then `node tools/postbuild --path=dist/apps/36-blocks`. `:prod` adds `--skip-nx-cache`. |
| `build:proxy-auth[:test\|:stage\|:prod]` | widget build + `build-elements.js` only |
| `build:proxy-auth:widget` | set-env `--auth`, `nx build 36-blocks-widget` with **no** `--configuration`, so the default `production` config (prod API hosts) is used. |
| `set-env`, `set-env:proxy`, `set-env:auth` | run `tools/set-env.js` for both apps / dashboard / widget |
| `test` | `nx test`: targets the default project `36-blocks`, which has no `test` target. Only some libs have `@nx/jest:jest` targets (`nx run-many -t test`). |
| `test:contract` | `nx test 36-blocks-widget …`: the widget has no `test` target, so this cannot run (see [widget-embed](./modules/widget-embed.md)). |
| `lint` | `nx workspace-lint && nx lint`. `workspace-lint` is not an Nx 21 command, so use `npx nx run-many -t lint`. |
| `format`, `format:check`, `format:code` | Nx / Prettier formatting. A husky `pre-commit` hook runs `lint-staged` (Prettier on `*.{html,scss,ts,json}`). |

> [!WARNING]
> `npm run build` (no suffix) builds the widget with the `production` environment but the dashboard with `local`. A "local" full build therefore ships a widget pointing at the production API.

## Variables (`tools/set-env.js`)

`set-env.js` loads .env from the repo root (`path.resolve(__dirname, '../.env')`) with `dotenv` and copies the parsed values over `process.env` (`Object.assign`). So .env wins over variables already in the shell or CI. Commit `5038dea0` did this because stale AWS Amplify env vars were overriding .env. Flags: `--proxy` writes only the dashboard file, `--auth` writes only the widget file, no flag writes both.

**CI detection and failure.** `isCI` is true when `CI === 'true'`, `NODE_ENV === 'production'` or `AWS_BRANCH` is set. In CI mode, a missing key is collected, and after the files are written the script logs `[set-env] FATAL: missing required env vars: …` and exits 1. Locally it only warns, and the value is written as `undefined`. `DEBUG_SET_ENV=true` (or CI mode) prints the first 8 characters of each value to the log.

> [!WARNING]
> In CI mode `set-env` prints an 8-character prefix of every key, including the AES keys, to the build log.

No key has a fallback (`get(key)` is called without a default), so every key is "required" in CI.

| Var | App / output file | Becomes | Read in | Effect if missing |
|---|---|---|---|---|
| `FIREBASE_CONFIG_API_KEY`, `FIREBASE_CONFIG_AUTH_DOMAIN`, `FIREBASE_CONFIG_PROJECT_ID`, `FIREBASE_CONFIG_STORAGE_BUCKET`, `FIREBASE_CONFIG_MESSAGING_SENDER_ID`, `FIREBASE_CONFIG_APP_ID` | dashboard (`--proxy`) → `apps/36-blocks/src/environments/env-variables.ts` <!-- verify:ignore --> | `environment.firebaseConfig.*` | `apps/36-blocks/src/app/app.config.ts` (`AngularFireModule.initializeApp`) | Google sign-in and `AuthService.getToken` fail. |
| `INTERFACE_SCRIPT_URL` | dashboard | `environment.interfaceScriptUrl` | `apps/36-blocks/src/app/panel/layout/layout.component.ts:LayoutComponent` | viaSocket chatbot script gets `src="undefined"`. |
| `AUTH_UI_ENCODE_KEY`, `AUTH_UI_IV_KEY` | widget (`--auth`) → `apps/36-blocks-widget/src/environments/env-variables.ts` <!-- verify:ignore --> | `environment.uiEncodeKey`, `environment.uiIvKey` | widget login/register password and `proxy_state` encryption ([widget-auth](./modules/widget-auth.md)) | Backend cannot decrypt passwords → login/register fail. |
| `AUTH_API_ENCODE_KEY`, `AUTH_API_IV_KEY` | widget | `environment.apiEncodeKey`, `environment.apiIvKey` | `OtpEffects.getWidgetData$` (decrypts `data.ciphered`) | Widget config cannot be decrypted → no login buttons. |
| `HCAPTCHA_SITE_KEY` | widget | `environment.hCaptchaSiteKey` | `apps/36-blocks-widget/src/main.ts` (`NgHcaptchaModule.forRoot`), widget login form | hCaptcha fails to load → password login blocked. **Not in `.env.example`.** Local `environment.ts` overrides it with hCaptcha's public test key. |
| `SEND_OTP_AUTH_KEY` | widget | `environment.sendOtpAuthKey` | nothing reads it | none today, but CI still fails without it. **Not in `.env.example`.** |
| `CI`, `NODE_ENV`, `AWS_BRANCH`, `DEBUG_SET_ENV` | — | — | `tools/set-env.js` | control CI mode / debug logging only |

The secrets must match the backend: the four `AUTH_*` keys must equal the keys the proxy backend uses to encrypt `ciphered` and decrypt passwords. The Firebase project must be the one whose ID tokens the backend accepts at `POST /googleLogin` ([api](./api.md#dashboard-auth-and-session)).

### `.env.example`
Lists `FIREBASE_CONFIG_API_KEY`, `FIREBASE_CONFIG_AUTH_DOMAIN`, `FIREBASE_CONFIG_PROJECT_ID`, `FIREBASE_CONFIG_STORAGE_BUCKET`, `FIREBASE_CONFIG_MESSAGING_SENDER_ID`, `FIREBASE_CONFIG_APP_ID`, `AUTH_UI_ENCODE_KEY`, `AUTH_UI_IV_KEY`, `AUTH_API_ENCODE_KEY`, `AUTH_API_IV_KEY`, `INTERFACE_SCRIPT_URL` and `CLIENT_BASE_URL`.

> [!WARNING]
> `CLIENT_BASE_URL` in `.env.example` is read by nothing. The string only appears as the DI token name `ProxyBaseUrls.ClientURL`, whose value comes from `environment.apiUrl + environment.msgMidProxy`. `HCAPTCHA_SITE_KEY` and `SEND_OTP_AUTH_KEY` are missing from the example although CI requires them.

## Angular environment files

`fileReplacements` swap `environment.ts` for the per-config file. Configurations without a replacement use `environment.ts`.

### Dashboard `apps/36-blocks/src/environments/`
| Build config (`36-blocks:build`) | File | `production` | `env` | `baseUrl` (API) | `proxyServer` (own origin, widget host) |
|---|---|---|---|---|---|
| `local`, `development` (serve) | `environment.ts` | false | `local` | `https://apitest.msg91.com/api` | `http://localhost:4200` |
| `test` | `environment.test.ts` | true | `test` | `https://apitest.msg91.com/api` | `https://stage.36blocks.com` |
| `stage` | `environment.stage.ts` | **false** | **`dev`** | `https://routes.msg91.com/api` | `https://36blocks.com` |
| `production` (default) | `environment.prod.ts` | true | `prod` | `https://routes.msg91.com/api` | `https://proxy.msg91.com` |

Every file also sets `googleClientId: ''` and spreads `firebaseConfig` and `interfaceScriptUrl` from env-variables.ts. `googleClientId` is empty everywhere, so `GoogleOneTapService` never initializes and login uses the Firebase popup.

Where the keys are used:
- `baseUrl` → `ProxyBaseUrls.BaseURL` and `ProxyBaseUrls.ProxyLogsUrl` (`app.config.ts`); also `${environment.baseUrl}/proxy` for the gateway URL shown in create-project.
- `proxyServer` → widget script URL (`ProxyAuthScriptUrl`, snippets in `widget-code-snippet.ts` and `create-feature.component.ts`), version.json polling, contact form `sourceUrl`.
- `env` → version polling is off when `env === 'local'`; contact form environment label.
- `production` → NgRx store devtools are on when false (so they are on in `stage`).

> [!WARNING]
> The dashboard `stage` file has `production: false` and `env: 'dev'`, unlike the widget `stage` file (`production: true`, `env: 'prod'`). The stage dashboard therefore ships NgRx devtools.
> [!TODO] Needs a human: is the dashboard stage `production: false` / `env: 'dev'` intentional?

### Widget `apps/36-blocks-widget/src/environments/`
| Build config (`36-blocks-widget:build`) | File | `production` | `env` | `apiUrl` | `baseUrl` |
|---|---|---|---|---|---|
| `development` (serve) | `environment.ts` (+ `main.dev.ts`) | false | `local` | `https://apitest.msg91.com/api` | `http://localhost:4200` |
| `test` | `environment.test.ts` | true | `test` | `https://apitest.msg91.com/api` | `https://stage.36blocks.com` |
| `stage` | `environment.stage.ts` | true | `prod` | `https://routes.msg91.com/api` | `https://36blocks.com` |
| `production` (default) | `environment.prod.ts` | true | `prod` | `https://routes.msg91.com/api` | `https://proxy.msg91.com` |

All set `msgMidProxy: ''`. `apiUrl + msgMidProxy` is the widget's API base (`ProxyBaseUrls.BaseURL` and `ClientURL` in `apps/36-blocks-widget/src/main.ts`). `env` → `ProxyBaseUrls.Env`. `baseUrl` is not read by widget code. There is no `local` configuration for the widget.

## Other runtime config
- `PORT` — read only in `apps/36-blocks/src/server.ts` (`process.env['PORT'] || 4000`). That Express SSR server is dead code: it is not built and its packages are not installed. See [app-shell](./modules/app-shell.md).
- `apps/36-blocks-widget/webpack.config.js` would inject `process.env` with `DefinePlugin`, but no build target uses it.

## Post-build: `tools/postbuild.js`
Run by `build:web:test`, `build:web:stage` and `build:web:prod` with `--path=dist/apps/36-blocks` (it switches to the browser/ subfolder when present).
1. Reads `version` from `package.json`.
2. Finds the main bundle with `/^main.?([a-z0-9]*)?.js$/` and takes the hash.
3. Writes version.json (`{"version", "hash"}`) to the dist folder.
4. Replaces the `{{POST_BUILD_ENTERS_HASH_HERE}}` placeholder in the main bundle with the hash. `VersionCheckService` compares that against version.json (polled from `proxyServer`) and shows the "new version available" banner. <!-- verify:ignore -->

Errors are only logged; the build never fails here.
> [!TODO] Needs a human: Angular's application builder names bundles `main-<HASH>.js` with upper-case hashes, which the lower-case regex may not match (then the hash is empty and version checks never fire). Confirm against a real `dist/apps/36-blocks/browser/` listing. <!-- verify:ignore -->

## CI: `.github/workflows/main.yml` ("Build check")
- Triggers: `pull_request` to `development`, `main` or `production`, and manual `workflow_dispatch`. **Not** `stage`, although `origin/stage` exists, and not on push.
- Steps: checkout the PR head, Node 20, `npm ci --audit false --legacy-peer-deps` (rolling cache), then `npx nx affected --target=build --base='origin/<base branch>' --configuration=local`.
- Bundle-size step (`if: always()`): fails if `apps/36-blocks/src/assets/proxy-auth/proxy-auth.js` is over 3 MB (3145728 bytes). It is skipped silently when the file is absent, and the workflow never runs `build-elements.js`, so in practice it checks nothing. <!-- verify:ignore -->

> [!WARNING]
> CI never runs `tools/set-env.js`, and env-variables.ts is gitignored. The Nx `set-env` targets in both `project.json` files are not dependencies (dependsOn) of `build`. Any affected build therefore compiles without `./env-variables`, which looks like it would fail. The widget also has no `local` configuration.
> [!TODO] Needs a human: does the "Build check" job pass today? If so, how does env-variables.ts exist on the runner?

Deployment is not in this repo. `set-env.js` comments and `AWS_BRANCH` point to AWS Amplify, where .env is written before the build.
> [!TODO] Needs a human: which Amplify app/branch maps to which build script (`build:test` / `build:stage` / `build:prod`)?
