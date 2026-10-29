---
covers: ["apps/36-blocks/src/main.ts", "apps/36-blocks/src/main.server.ts", "apps/36-blocks/src/server.ts", "apps/36-blocks/src/index.html", "apps/36-blocks/src/app/app.*.ts", "apps/36-blocks/src/app/core/**", "apps/36-blocks/src/app/website/**", "apps/36-blocks/src/environments/**", "apps/36-blocks/project.json"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# App shell (36-blocks dashboard app)

The `36-blocks` Nx app is one Angular SPA that serves both the public marketing site (`/`, `/pricing`, `/login`, ...) and the logged-in dashboard (`/app/**`). This doc covers how it boots, the root routes and guards, where the auth token lives, the root NgRx store, the website pages with their login/registration store, and how each build picks an environment file. Dashboard pages under `/app` are in [panel-ops](./panel-ops.md) and [panel-features](./panel-features.md); the shared HTTP/auth services are in [shared-libs](./shared-libs.md).

| File | Role |
|---|---|
| `apps/36-blocks/src/main.ts` | Browser entry: `bootstrapApplication(AppComponent, appConfig)`. The only entry the build uses. |
| `apps/36-blocks/src/main.server.ts` | Leftover SSR entry (merges `appConfig` with `app.config.server.ts`). Not built. |
| `apps/36-blocks/src/server.ts` | Leftover Express SSR server (`AngularNodeAppEngine`). Not built; its packages are no longer installed. |
| `apps/36-blocks/src/index.html` | Shell HTML: `<proxy-root>`, SEO meta, fonts, and the `#app-splash-screen` spinner. |
| `apps/36-blocks/src/app/app.config.ts` | `appConfig`: router, HttpClient, root store + `auth`/`registration` feature states, effects, `ErrorInterceptor`, `APP_INITIALIZER`, Firebase, `ProxyBaseUrls` injection tokens, Material defaults. |
| `apps/36-blocks/src/app/app.config.browser.ts` | `browserConfig` (Firebase providers). Not imported anywhere; `appConfig` already provides Firebase. |
| `apps/36-blocks/src/app/app.config.server.ts` | SSR-only `config` that sets Firebase auth `PERSISTENCE` to `'none'`. Only used by the dead `main.server.ts`. |
| `apps/36-blocks/src/app/app.routes.ts` | `appRoutes`: top-level routes and the catch-all redirect. |
| `apps/36-blocks/src/app/app.routes.server.ts` | `serverRoutes`: every path `RenderMode.Client`. Leftover from SSR. |
| `apps/36-blocks/src/app/app.component.ts` | `AppComponent` (`proxy-root`): fires `getUserAction`, hides splash, sets header title, redirects logged-in users off website pages, version-check reload. |
| `apps/36-blocks/src/app/core/auth-initializer.service.ts` | `AuthInitializerService`: copies the `authToken` cookie into `AuthService` memory before first navigation. |
| `apps/36-blocks/src/app/core/ngrx/` | Root store: `root` slice (`IRootState`), `RootEffects`, `clearStateMetaReducer`. |
| `apps/36-blocks/src/app/core/registration/registration.component.ts` | `/client/registration`: loads the widget script and calls `window.initVerification` in register-only mode. |
| `apps/36-blocks/src/app/website/website.routes.ts` | `websiteRoutes`: marketing pages under `WebsiteLayoutComponent`. |
| `apps/36-blocks/src/app/website/home/authguard/index.ts` | `CanActivateRouteGuard`: protects dashboard routes. |
| `apps/36-blocks/src/app/website/home/authguard/logged-in.guard.ts` | `LoggedInGuard`: sends logged-in users from `/` to `/app/dashboard`. |
| `apps/36-blocks/src/app/website/home/ngrx/` | `auth` (login) and `registration` feature store: actions, reducers, selectors, `LogInEffects`, `RegistrationEffects`. |
| `apps/36-blocks/src/app/website/login/login-page.component.ts` | `/login`: email/password and Google login. |
| `apps/36-blocks/src/app/website/login/google-one-tap.service.ts` | `GoogleOneTapService`: Google Identity Services (One Tap). Off until `googleClientId` is set. |
| `apps/36-blocks/src/app/website/register/register-page.component.ts` | `/register`: email + password sign-up. |
| `apps/36-blocks/src/app/website/layout/website-layout.component.ts` | Website header/footer; "Login" button dispatches Google `logInAction`. |
| `apps/36-blocks/src/app/website/home/home.component.ts` | Landing page: SEO meta, JSON-LD, widget theme demo. |
| `apps/36-blocks/src/app/website/contact/contact.component.ts` | Contact form, posts to a viaSocket webhook (`CONTACT_WEBHOOK_URL`). |
| `apps/36-blocks/src/app/website/{about,pricing,privacy,security,terms}/` | Static marketing pages (set `Title`/`Meta` only). |
| `apps/36-blocks/src/environments/` | `environment.ts` (local) plus `.test`, `.stage`, `.prod`; all spread the generated `env-variables.ts`. | <!-- verify:ignore -->
| `apps/36-blocks/project.json` | Nx targets; build configurations choose the environment file. |

## How it works

### Boot sequence (browser only)

1. `main.ts` boots `AppComponent` with `appConfig`.
2. `APP_INITIALIZER` runs `AuthInitializerService.initialize`: if the `authToken` cookie exists, `AuthService.setTokenSync(cookie)` puts it in memory and refreshes the cookie for another 30 days.
3. The router does a blocking first navigation (`withEnabledBlockingInitialNavigation`), so guards run before anything renders.
4. The `AppComponent` constructor dispatches `getUserAction`. `LogInEffects.getUserAction$` reads `AngularFireAuth.authState` once. A Firebase user leads to `authenticatedAction` (with `IFirebaseUserModel`); no user leads to `NotAuthenticatedAction`.
5. On `authenticatedAction`, `AppComponent` redirects to `/app/dashboard` if the current URL is `/` or a website route (`/pricing`, `/about`, `/contact`, `/security`, `/privacy`, `/terms`, `/register`, `/login`), but never from `/onboarding`.
6. On the first `NavigationEnd`, the `#app-splash-screen` element from `index.html` gets `splash-hidden` and is removed 300 ms later.
7. On every `NavigationEnd`, the deepest primary route's `data.title` goes to `rootActions.headerTitleAction`.
8. When `environment.env !== 'local'`, `VersionCheckService.initVersionCheck` polls `environment.proxyServer + '/version.json'` (written by `tools/postbuild.js`). Once a new version is seen, the next `NavigationStart` does `window.location.reload()`. In current builds a new version is never seen: the hash in version.json is empty and the placeholder is never replaced ([environment.md](../environment.md#post-build-toolspostbuildjs)).

### Routes and guards

```
''                         websiteRoutes → WebsiteLayoutComponent
  ''          (exact)      HomeComponent           canActivate: LoggedInGuard
  pricing | security | privacy | terms | about | contact | register | login   (no guard)
'onboarding'               OnboardingComponent     (no guard; token comes in the query string)
'app'                      panelRoutes → LayoutComponent   canActivate: CanActivateRouteGuard
'widget-preview/:referenceId'  WidgetPreviewComponent      canActivate: CanActivateRouteGuard
'project'                  CreateProjectComponent          canActivate: CanActivateRouteGuard
'client/registration'      RegistrationComponent   (no guard)
'**'                       inline guard → '/app/dashboard' if logged in, else ''
```

The full route table is in [docs/ui/routes.md](../ui/routes.md).

| Guard | Logged in when | Otherwise |
|---|---|---|
| `CanActivateRouteGuard` (`apps/36-blocks/src/app/website/home/authguard/index.ts`) | `authToken` cookie (also copied into memory), or `AuthService.getTokenSync()`, or a Firebase `authState` user | `UrlTree` to `''` |
| `LoggedInGuard` | cookie or memory token | lets `/` render; when logged in, `UrlTree` to `/app/dashboard` |
| `**` inline guard in `appRoutes` | cookie or memory token | `''` |

### Where the auth token lives

The dashboard's backend session token is the proxy JWT (not the Firebase ID token). It is kept in two places, both written by `AuthService` in `libs/services/proxy/auth/src/lib/services-proxy-auth.module.ts`:

- **Cookie `authToken`** (path `/`, 30-day expiry, set with `CookieService`). This survives reloads and is the source of truth at boot.
- **Memory**: `IToken.proxyJWTToken` on the singleton object provided as `ProxyBaseUrls.IToken` in `appConfig` (initial value `{ token: null, companyId: null }`).

| Method | Effect |
|---|---|
| `setTokenSync(token)` | writes cookie and memory |
| `getTokenSync()` | reads memory only |
| `clearTokenSync()` | deletes cookie and clears memory |
| `getToken()` | Firebase ID token from `afAuth.authState` (used only to call `/googleLogin`) |

`HttpWrapperService.prepareOptions` (`libs/services/http-wrapper/src/lib/services-http-wrapper.module.ts`) sends `getTokenSync()` as the raw `Authorization` header (no `Bearer` prefix). `ErrorInterceptor` (`libs/services/interceptor/error-interceptor/`) reads the cookie, not memory.

Writers of the token: `LogInEffects.emailLogin$`, `LogInEffects.authenticatedAction$` (Google), `AuthInitializerService`, `CanActivateRouteGuard`, and `OnboardingComponent` (panel-ops). Only `LogInEffects.logoutActionComplete$` clears it on purpose; `ErrorInterceptor` deletes the cookie on any 401.

### Login flows (store `auth`)

The step-by-step trace is in [dashboard-login](../flows/dashboard-login.md). In short:

- **Email/password** (`LoginPageComponent.submitLogin`): `emailLoginAction` → `UsersService.emailLogin` (`UsersUrl.emailLogin`, no-auth HTTP wrapper). If `is_onboarding_pending` and a token are in the response → `emailLoginOnboardingPending({ pendingJwtToken })` → the page navigates to `/onboarding`. Otherwise `setTokenSync(token)` → `emailLoginSuccess` → the page dispatches `getUserAction`.
- **Google popup** (`logInAction`, dispatched from the home page, the website header and the login page): `AuthService.loginViaGoogle` (Firebase `signInWithPopup`) → `logInActionComplete` → `authenticatedAction$` effect gets the Firebase ID token, calls `LoginService.googleLogin(idToken)` (`POST {baseUrl}/googleLogin` with the ID token as `Authorization`), stores `res.data.auth` with `setTokenSync`, then dispatches `getUserAction`.
- **Google One Tap** (`googleOneTapCredential({ idToken })`): `GoogleAuthProvider.credential(idToken)` → `afAuth.signInWithCredential` → `logInActionComplete` → same backend chain as the popup. The GIS script (`https://accounts.google.com/gsi/client`) is lazy-loaded only on `/login`. `GoogleOneTapService.isAvailable` is false while `environment.googleClientId` is `''`, which it is in every environment file, so One Tap and the rendered GIS button are off and the Firebase popup is used.
- **Logout** (`logoutAction`, dispatched from the panel layout and widget preview): `clearStateMetaReducer` empties the whole store, `afAuth.signOut()`, then `logoutActionComplete$` calls `clearTokenSync()`, sets `window.location.href = '/'` and calls `LoginService.logout()` (`DELETE {baseUrl}/logout`).

### Registration (store `registration`)

`RegisterPageComponent` dispatches `registrationSubmitAction({ payload: { email, password } })` → `UsersService.register` → `registrationSubmitComplete({ registeredEmail })`, which makes the page show a "check your email" state. The page resets the slice on init and destroy; `WebsiteLayoutComponent.onRegisterCtaClick` also resets it when the user clicks "Register" while already on `/register` (a `routerLink` to the same URL does not re-create the component).

`/client/registration` is a different thing: `RegistrationComponent` reads `reference_id`, `first_name`, `last_name`, `signup_service_id`, `email` from the query string, loads `ProxyAuthScriptUrl(environment.proxyServer, timestamp)` (the built widget script) and calls `window.initVerification({ type: 'authorization', isRegisterFormOnly: true, ... })`. See [widget-embed](./widget-embed.md).

## Contracts

### Root store

`provideStore(reducers, { metaReducers: [clearStateMetaReducer] })` plus two feature states registered at the root in `appConfig`:

```ts
// IAppState & feature slices
{
  root: {                       // IRootState, core/ngrx/store/reducer/root.reducer.ts
    errors: string[];           // never written by any reducer
    headerTitle: string;        // from route data.title (AppComponent)
    clientSettings: IClientSettings;  clientSettingsInProcess: boolean;
    clients: IPaginatedResponse<IClient[]>;  clientsInProcess: boolean;  // pageNo > 1 appends data
    switchClientSuccess: boolean;
    allProjects: IPaginatedResponse<IProjects[]>;  projectInProcess: boolean;
  },
  auth: {                       // ILogInState, website/home/ngrx/store/login.reducer.ts
    errors: string[];  logInData: IFirebaseUserModel;  // { uid, displayName, email, phoneNumber, photoURL, emailVerified, jwtToken(Firebase ID token) }
    logInInProcess: boolean;  logInSuccess: boolean;  logOutInProcess: boolean;  logOutSuccess: boolean;
  },
  registration: {               // IRegistrationState
    registrationInProgress: boolean;  registrationSuccess: boolean;
    registeredEmail: string | null;   registrationErrors: string[];
  }
}
```

`RootEffects` calls `RootService` (`libs/services/proxy/root/`): `getClientSettings` → `RootUrls.getClientSettings`, `getAllClients` → `RootUrls.getClients`, `switchClient` → `RootUrls.switchClient`, `getAllProject` → `RootUrls.getProject`. Errors are shown as toasts with `errorResolver`. Dispatchers live in panel code (`LayoutComponent`, `CreateProjectComponent`). Full endpoint list: [api.md](../api.md). Store conventions: [docs/ui/state.md](../ui/state.md).

### Injection tokens provided by `appConfig`

| Token | Value |
|---|---|
| `ProxyBaseUrls.BaseURL` | `environment.baseUrl` |
| `ProxyBaseUrls.ProxyLogsUrl` | `environment.baseUrl` |
| `ProxyBaseUrls.FirebaseConfig` | `environment.firebaseConfig` |
| `ProxyBaseUrls.IToken` | mutable `{ token, companyId }` object, gets `proxyJWTToken` |

### Environment selection

Each environment file exports `environment = { production, env, googleClientId, proxyServer, baseUrl, ...envVariables }`. `envVariables` comes from `apps/36-blocks/src/environments/env-variables.ts`, which is git-ignored and generated by `node tools/set-env --proxy` from `.env` / `process.env` (Firebase config and the viaSocket interface script URL). Variable names and meaning: [environment.md](../environment.md). <!-- verify:ignore -->

| npm script | Nx configuration | File used | `production` | `env` |
|---|---|---|---|---|
| `start` | `serve` → `build:development` | `environment.ts` | false | `local` |
| `build` / `build:web` | `local` | `environment.ts` | false | `local` |
| `build:test` / `build:web:test` | `test` | `environment.test.ts` | true | `test` |
| `build:stage` / `build:web:stage` | `stage` | `environment.stage.ts` | false | `dev` |
| `build:prod` / `build:web:prod` | `production` (also the Nx default) | `environment.prod.ts` | true | `prod` |

The swap is done by `fileReplacements` in `apps/36-blocks/project.json`; `local` and `development` have none. `production` controls only the NgRx devtools (`provideStoreDevtools`); `env !== 'local'` turns on the version check. The test, stage and prod scripts also run `tools/postbuild.js` to write `version.json`. <!-- verify:ignore -->

## Gotchas

> [!WARNING]
> `ErrorInterceptor` returns `EMPTY` (the request is never sent, the observable completes with no value and no error) unless the `authToken` **cookie** exists or the URL contains `api/register`, `api/googleLogin`, `api/login`, `api/onboarding` or `flow.sokt.io`. A new public endpoint called before login must be added to that list in `libs/services/interceptor/error-interceptor/`, or it silently does nothing. A memory-only token does not count.

> [!WARNING]
> `LogInEffects.logoutActionComplete$` calls `clearTokenSync()` before `LoginService.logout()`. With the cookie gone, `ErrorInterceptor` drops the `DELETE /logout` request (see above), and `window.location.href = '/'` has already started the page unload. The backend logout call most likely never reaches the server.

> [!WARNING]
> `LoginPageComponent` navigates to `/onboarding` with query param `token`, but `OnboardingComponent` reads `onboarding_token` (`queryParamMap.get('onboarding_token')`). An email login with `is_onboarding_pending` lands on onboarding without its token. Pick one name and change both files together.

> [!WARNING]
> `CanActivateRouteGuard` also admits a user who only has a Firebase session (no proxy JWT). The dashboard then renders, but `HttpWrapperService` sends no `Authorization` header and `ErrorInterceptor` drops most requests because there is no cookie.

> [!WARNING]
> `clearStateMetaReducer` fires on `logoutAction` (not on `...Complete`) and replaces the whole state with `{}`, so every reducer falls back to its initial state, including `auth` and `registration`. Selectors that read nested fields of a slice without `?.` (for example `selectLogInDataInProcess`) are safe only because each reducer re-creates its initial state.

> [!WARNING]
> `main.server.ts`, `server.ts`, `app.config.server.ts`, `app.routes.server.ts` and `app.config.browser.ts` are dead. `@angular/ssr`, `@angular/platform-server` and `express` are not in `package.json`, and `apps/36-blocks/tsconfig.app.json` compiles only `apps/36-blocks/src/main.ts`. Do not import from these files; adding them to the build fails on missing packages.

> [!WARNING]
> `HomeComponent` imports `WidgetThemeService` straight from `apps/36-blocks-widget/src/app/otp/service/widget-theme.service.ts` (a cross-app path import, not a lib). Moving that file in the widget app breaks the dashboard build.

- `environment.stage.ts` has `env: 'dev'` and `production: false`, so stage builds ship NgRx devtools and the contact form labels the environment as `dev` (`ENVIRONMENT_LABEL_MAP` has no `dev` key).
- `npm run build` builds the dashboard with the `local` configuration (localhost `proxyServer`), not production. Use `build:prod` for production.
- The `isPlatformBrowser` checks in `AppComponent` and `LogInEffects` are SSR leftovers. They are harmless now, but `LogInEffects.getUserAction$` returning `NotAuthenticatedAction` on the server path is never hit.
- `AuthService.getToken()` subscribes to `authState` and calls `p.getIdToken`; with no Firebase user it throws (caught as `logInActionError`).

## Why it is built this way

- **No SSR.** The app was server-rendered with prerendering of `/` for SEO (commits `38b1930d`, `fc318f5b`, `b58f9d86`: the `isPlatformBrowser` guards and `PERSISTENCE: 'none'` were added so Firebase and `window` did not run on the server). Commit `64b28e3c` "chore: remove SSR/prerender, switch to pure CSR" (PR #621 "Remove unused ssr related changes") removed the `server`/`prerender`/`ssr` build options and the SSR packages, and set every server route to `RenderMode.Client`. It left the source files in place. The commit body gives no reason beyond "unused".
  > [!TODO] Needs a human: why was SSR dropped (hosting on Amplify/S3 as static files, Firebase on the server, or something else), and can the leftover SSR files be deleted?
- **Static hosting.** `tools/postbuild.js` once copied `index.csr.html` to `app/index.html` so static hosts could serve `/app/*` a clean shell instead of the prerendered home page; that copy was removed in `fec1290b` after SSR went away. <!-- verify:ignore -->
- **Cookie plus memory token.** `AuthInitializerService` and the splash screen were added together (`c07d8b5a`) so the token from the cookie is in memory before guards and HTTP calls run. The Firebase `authState` fallback in `CanActivateRouteGuard` came in `9bf13277`, after `AngularFireAuthGuard` was replaced by the custom guard (`cc2504a4`). <!-- verify:ignore -->
- **Root-level `auth` and `registration` features.** They are registered in `appConfig` rather than in lazy routes because `AppComponent`, the website layout and panel components all dispatch and select login actions.
- **One Tap is scaffolded but off.** `googleClientId` was added as `''` to every environment in `b96c3516` "for future Google authentication integration"; the code comments say it activates once the client ID is configured.
- **Version check reload.** `AppComponent` reloads on the next navigation after a deploy so users do not keep an old bundle whose lazy chunks no longer exist. (It does not fire today; see [environment.md](../environment.md#post-build-toolspostbuildjs).)

## Changing it safely

- **New top-level route:** add it in `apps/36-blocks/src/app/app.routes.ts` with `canActivate: [CanActivateRouteGuard]` if it needs a login. If it is a website page, also add its path to the `websiteRoutes` list inside `AppComponent.ngOnInit`, or logged-in users will not be bounced to the dashboard from it.
- **New backend call before login:** call it through the no-auth wrapper like `UsersService.register` does, and add its URL fragment to the allow-list in `ErrorInterceptor`.
- **Touching the token:** always go through `AuthService.setTokenSync` / `clearTokenSync` so the cookie and memory stay in sync; the guards, `AuthInitializerService` and `ErrorInterceptor` each read a different one of them.
- **New environment value:** add the key to all four files in `apps/36-blocks/src/environments/`; secrets go through `tools/set-env.js` and `.env`, never into the committed files. <!-- verify:ignore -->
- **New build configuration:** add it under `build.configurations` in `apps/36-blocks/project.json` with a `fileReplacements` entry, and an npm script that runs `node tools/set-env --proxy` first (the Nx target no longer depends on `set-env`, commit `2fddd1eb`).
- Check: `npx nx build 36-blocks --configuration=production`, then load `/`, `/login`, log in, reload on `/app/dashboard` (cookie path) and log out.
