---
covers: ["libs/ui/**", "libs/directives/**", "libs/pipes/**", "apps/36-blocks-widget/src/app/otp/ui/**"]
verified_at: 76f26ae5
verified_on: 2026-10-14
---
# Components

Reusable UI for the dashboard lives in Nx libs under `libs/ui/`, `libs/directives/` and `libs/pipes/`, one lib per component, imported through the `@proxy/*` path aliases in `tsconfig.base.json` (for example `@proxy/ui/search`). All are standalone; import the class into the component's `imports`. The widget does not use these libs (except `BaseComponent` and constants): it has its own small set in `apps/36-blocks-widget/src/app/otp/ui/` and the `w-*` CSS classes described in [design-system](design-system.md#widget-w--classes).

Reuse before you build: search this table, then the `libs/ui` folder. Create a new lib only when a second page needs the component; page-only components stay next to the page.

## UI libraries in use

| Library | Version (package.json) | Used for | Where |
|---|---|---|---|
| Angular Material (MDC, M3 theme) | `@angular/material` 21.2.2 | All dashboard form fields, buttons, dialogs (`MatDialog`), tables, paginator, menus, tabs, stepper, sidenav, chips, icons | dashboard + `libs/ui/**` only. The widget imports no Material module. |
| Angular CDK | `@angular/cdk` 21.2.2 | clipboard (`CopyButtonComponent`), scrolling (`CDKScrollComponent`), a11y, `BreakpointObserver`; widget uses `@angular/cdk/portal` for dialogs | both |
| PrimeNG | `primeng` 14.2.2 | Toasts only: `PrimeNgToastComponent` wraps `p-toast`. CSS from primeng/resources/primeng.min.css in node_modules, listed in the dashboard `project.json` styles | dashboard |
| ECharts | `echarts` ^6 | Dashboard time-series and breakdown charts | `apps/36-blocks/src/app/panel/dashboard/` |
| ngx-markdown + Prism | `ngx-markdown` 21.1.0 | Rendering code snippets (create-feature, widget preview); Prism scripts/theme in dashboard `project.json` | dashboard |
| Material Icons font | Google Fonts link in `apps/36-blocks/src/index.html` | `<mat-icon>` ligatures (`material-icons-outlined` class for the outlined set) | dashboard |
| intl-tel-input | 17.0.19 | Phone input in the widget register form (CSS via `widget.component.scss`, overrides in `apps/shared/assets/utils/intl-tel-input-custom.scss`) | widget |
| ng-hcaptcha | ^2.6.0 | Captcha in the widget login | widget |

Installed but imported nowhere: highcharts, highcharts-angular, chart.js, ngx-bootstrap, @angular/material-moment-adapter. Do not reach for them; use ECharts and Material.

## Dashboard components (`libs/ui/**`)

| Component | Selector | File | Use it for | Key inputs / outputs |
|---|---|---|---|---|
| `PrimeNgToastComponent` + `PrimeNgToastService` | `proxy-prime-ng-toast` | `libs/ui/prime-ng-toast/src/lib/prime-ng-toast/prime-ng-toast.component.ts` | The app's only toast host, mounted once in `apps/36-blocks/src/app/app.component.html`. Show toasts by calling the service. | Service: `success(msg)`, `error(msg)`, `warn(msg)`, `info(msg)`, `action(msg, options, buttonContent)`, `clearActionToast()`. Default life 3000 ms. Output `undoMail`. |
| `ConfirmDialogComponent` | `proxy-confirm-dialog` | `libs/ui/confirm-dialog/src/lib/confirm-dialog/confirm-dialog.component.ts` | Yes/no confirmation opened with `MatDialog.open`; closes with `'yes'` or `'no'` | Signal inputs set via `dialogRef.componentRef.setInput(...)`: `title`, `confirmationMessage`, `confirmButtonText`, `cancelButtonText`, `confirmButtonColor` (default `warn`), `showConfirmButton`, `showCancelButton`, `confirmButtonClass`, `cancelButtonClass` |
| `SearchComponent` | `proxy-lib-search` | `libs/ui/search/src/lib/search/search.component.ts` | Debounced search box (`DEBOUNCE_TIME` = 700 ms from `@proxy/constant`) above list tables | `placeholder`, `value`, `validators`, `formErrors`, `matFormFieldClass`, `hideCloseIcon`, `emitOnEnter`, `isRemoveChar` + `charactersToRemove`; output `inputChanges` |
| `MatPaginatorGotoComponent` | `mat-paginator-goto` | `libs/ui/mat-paginator-goto/src/lib/mat-paginator-goto/mat-paginator-goto.component.ts` | `mat-paginator` plus a "go to page" select | `pageIndex`, `length`, `pageSize` (aliased inputs), `pageSizeOptions`, `hidePageSize`, `showFirstLastButtons`, `disabled`; output `page` (`PageEvent`) |
| `NoRecordFoundComponent` | `proxy-no-record-found` | `libs/ui/no-record-found/src/lib/no-record-found.component.ts` | Empty state ("There are no {title} to show") | `title`, `showBtn` (renders a hardcoded "Create a new Chat" button with no output; leave `false`) |
| `LoaderComponent` | `proxy-loader` | `libs/ui/loader/src/lib/loader.component.ts` | Full-area loading indicator | `message` (default `Loading...`) |
| `CopyButtonComponent` | `proxy-copy-button` | `libs/ui/copy-button/src/lib/copy-button.component.ts` | Icon button that copies a value (CDK clipboard) and flips to a check icon | `copyData`, `tooltip`, `btnClass`, `iconClass`, `iconChangeDelay` (ms, default 1000) |
| `ServiceListComponent` | `proxy-service-list` | `libs/ui/service-list/src/lib/service-list.component.ts` | Left-hand section list in create-feature, OAuth config, management; shows an error icon for invalid sections | `services` (required, `ServiceListItem { name; icon? }[]`), `selectedIndex`, `getFormAt(i)` (form getter for the invalid marker), `classList`, `iconClass`; output `serviceSelect` (index) |
| `DateRangePickerComponent` | `date-range-picker` | `libs/ui/date-range-picker/src/lib/date-range-picker/date-range-picker.component.ts` (alias `@proxy/date-range-picker`, without the usual ui segment) | Preset + custom date range menu (logs, users) | model `selectedRangeValue`; inputs `selectedDefaultDateRange` (`SelectDateRange`), `minDate`, `placeholder`, `customOptionActive`, `openMenu`, `cssClass`; output `menuClosedEvent` |
| `CDKScrollComponent` | `proxy-cdk-scroll` | `libs/ui/virtual-scroll/src/lib/cdk-scroll/cdk-scroll.component.ts` | Infinite-scroll wrapper (logs) | `scrollableElementId` (unique per page if used twice); output `fetchNextPage` |
| `BaseComponent` | (abstract, no selector) | `libs/ui/base-component/src/lib/base-component/base.component.ts` | Base class for most components in both apps: `destroy$` for `takeUntil`, `makeFormDirty`, `onlyNumber`, `getValueFromObservable`, `goBackToHistory` | extend it and call `super()` |
| `PlayerComponent` | `proxy-lib-audio-player` | `libs/ui/player/src/lib/player/player.component.ts` | Audio player. Not used in either app. | `filename`, `getBuffer`, `playDirect`, ...; outputs `play`, `pause`, `remove`, `seek` |
| `MentionDirective` / `MentionListComponent` | `[mention]`, `[mentionConfig]` / `mention-list` | `libs/ui/angular-mentions/src/lib/mention.directive.ts` | Vendored `@`-mention autocomplete (`standalone: false`). Not used. | `mention`, `mentionConfig`; outputs `searchTerm`, `itemSelected`, `opened`, `closed` |
| `getHostNameDetail` (function) | – | `libs/ui/handle-domain/src/lib/handle-domain/handle-domain.ts` | Domain/TLD parsing helper, not a component; re-exported from `libs/utils/src/index.ts` | – |

## Directives (`libs/directives/**`)

| Directive | Selector | File | Use it for | Inputs / outputs | Used? |
|---|---|---|---|---|---|
| `SkeletonDirective` | `*skeleton` | `libs/directives/skeleton/src/lib/skeleton/skeleton.directive.ts` | Structural loading placeholder: renders `skeleton-rect` blocks while loading, the template after | `skeleton` (isLoading), `skeletonRepeat`, `skeletonWidth`, `skeletonHeight`, `skeletonClassName`. Example: `*skeleton="isLoading; repeat: 3; height: '20px'"` | features, users, billing |
| `RemoveCharacterDirective` | `[proxyRemoveCharacter]` | `libs/directives/remove-character-directive/src/lib/directives-remove-character-directive.module.ts` | Blocks typing given characters in number inputs | `charactersToRemove` (default `['e', '+', '-']`) | logs, `SearchComponent` |
| `AutoSelectDropDownDirective` | `[proxyAutoSelectDropDown]` | `libs/directives/auto-select-dropdown/src/lib/auto-select-dropdown-directive.ts` | When a `mat-select` or `mat-autocomplete` has exactly one option, selects it (sets the form control if empty) | `disableAutoSelectDirective`; output `setControlValue` | no |
| `MarkAllAsTouchedDirective` | `[proxyMarkAllAsTouched]` | `libs/directives/mark-all-as-touched/src/lib/directives-mark-all-as-touched.module.ts` | Put on a `[formGroup]`: marks every control touched on submit (or on click of `buttonRef`), emits `valid` when the form is valid | `buttonRef`; output `valid` | no |

> [!WARNING]
> `remove-character-directive`, `mark-all-as-touched` and `chart-date-add` each contain two files defining the same class (`remove-character.directive.ts`, `mark-all-as-touched.directive.ts`, `chart-date-add.pipe.ts` next to `directives-remove-character-directive.module.ts`, `directives-mark-all-as-touched.module.ts`, `pipes-chart-date-add.module.ts`). The lib's `index.ts` exports the module-named file; the other one is dead. Edit the module-named file.

## Pipes (`libs/pipes/**`)

| Pipe class | Template name | File | Does | Used? |
|---|---|---|---|---|
| `DateAddPipe` | `dateadd` | `libs/pipes/chart-date-add/src/lib/pipes-chart-date-add.module.ts` | `dayjs(value).add(7, 'day')` | no |
| `DecimalFormatterPipe` | `decimalFormatter` | `libs/pipes/decimal-formatter/src/lib/pipes-decimal-formatter.module.ts` | Formats a number with a separator system chosen by `separatorId` | no |
| `FieldValuePipe` | `fieldValuePipe` | `libs/pipes/field-value-pipe/src/lib/pipes-field-value-pipe.module.ts` | Finds an item in an array by key and returns a (deep) field of it; used inside `DecimalFormatterPipe` | indirectly |
| `ReplacePipe` | `replace` | `libs/pipes/replace/src/lib/pipes-replace.module.ts` | Replace a string or a map of strings | no |
| `SafeURLPipe` | `safeURL` | `libs/pipes/safe-urlpipe/src/lib/pipes-safe-urlpipe.module.ts` | `bypassSecurityTrustResourceUrl` (for iframe/audio `src`) | no |
| `TimeTokenPipe` | `timeToken` | `libs/pipes/time-token-pipe/src/lib/pipes-time-token-pipe.module.ts` | Formats `HH:mm:ss` strings or timestamps (AM/PM, relative to `currentTime`) | no |
| `TypeOf` | `typeof` | `libs/pipes/typeof/src/lib/pipes-typeof.module.ts` | `typeof` in templates | no |

No template in either app uses a `libs/pipes` pipe today. They are kept as a toolbox; check here before writing a new pipe.

## Widget-local UI (`apps/36-blocks-widget/src/app/otp/ui/`)

Exported from `apps/36-blocks-widget/src/app/otp/ui/index.ts`. Inline templates, Tailwind classes, dark mode through `[class.dark]`.

| Component | Selector | File | Use it for | Inputs / outputs |
|---|---|---|---|---|
| `ConfirmDialogComponent` | `proxy-confirm-dialog` | `apps/36-blocks-widget/src/app/otp/ui/confirm-dialog.component.ts` | Destructive confirm (`role="alertdialog"`), placed in the template, not opened by a service. Used by `UserProfileComponent`. | `title`, `message`, `confirmLabel`, `cancelLabel`, `isDark`; outputs `confirmed`, `cancelled` |
| `SpinnerComponent` | `proxy-spinner` | `apps/36-blocks-widget/src/app/otp/ui/spinner.component.ts` | Inline spinner | `size`: `'sm' \| 'md' \| 'lg'` (default `md`) |
| `ProgressBarComponent` | `proxy-progress-bar` | `apps/36-blocks-widget/src/app/otp/ui/progress-bar.component.ts` | Indeterminate bar at the top of the login/register dialog while an OTP call runs (`isOtpLoading()` in `widget.component.html`) | none |

The widget toast (`proxy-toast`, `apps/36-blocks-widget/src/app/otp/service/toast.component.ts` + `ToastService`) is documented in [widget-embed](../modules/widget-embed.md).

> [!WARNING]
> Two different components use the selector `proxy-confirm-dialog`: the dashboard lib (`MatDialog`-based, `confirmationMessage`, closes with `'yes'`/`'no'`) and the widget one (template-based, `message`, `confirmed`/`cancelled` outputs). They are not interchangeable; import the one for your app. The dashboard lib cannot be used in the widget because the widget has no Material.

## Rules

- Toasts in the dashboard: inject `PrimeNgToastService` and call `error`/`success`. Do not add Material snack bars or another `p-toast` host. For API errors use `errorResolver(errors)` from `@proxy/models/root-models` and toast each message, like the component stores do (see [state](state.md#component-stores-ngrxcomponent-store)).
- Confirmations in the dashboard: `MatDialog.open(ConfirmDialogComponent, { panelClass: ['mat-dialog'] })`, set inputs with `componentRef.setInput`, act on `afterClosed()` value `'yes'`. Dialog defaults (`disableClose: true`, `autoFocus: false`) come from `MAT_DIALOG_DEFAULT_OPTIONS` in `appConfig`.
- Form fields default to `appearance: 'outline'` (`MAT_FORM_FIELD_DEFAULT_OPTIONS` in `appConfig`); do not set it per field.
- Lists: `proxy-lib-search` + `mat-table` with `default-table` classes + `mat-paginator-goto` + `proxy-no-record-found` + `*skeleton`. Copy an existing list page (`FeatureComponent`) rather than starting fresh.
- New lib component: standalone, signal `input()`/`output()`, `ChangeDetectionStrategy.OnPush`, add a `@proxy/ui/<name>` path in `tsconfig.base.json`, export it from the lib's `index.ts`.
- Widget components: no Angular Material, no dashboard libs except `@proxy/ui/base-component`; use `w-*` classes and the `otp/ui` components.
- `CopyButtonComponent`'s default `btnClass` includes `icon-btn-md`, which no stylesheet defines; pass a `btnClass` if the button needs sizing.
