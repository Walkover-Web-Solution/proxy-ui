import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { WidgetEvent } from '@proxy/constant';
import { AddUserDialogComponent } from '../user-management/add-user-dialog.component';
import { WidgetDialogRef, WidgetDialogService } from './widget-dialog.service';
import { WidgetThemeService } from './widget-theme.service';

export interface OpenAddUserConfig {
    authToken: string;
    theme?: string;
}

/**
 * Bridges the global WidgetEvent.OpenInviteMemberDialog window event to the widget.
 *
 * Two cases:
 *   A) UserManagementComponent IS mounted → delivers via openAddUser$ subject.
 *   B) UserManagementComponent is NOT mounted → opens AddUserDialogComponent
 *      standalone via WidgetDialogService (fully CSS-isolated shadow DOM host).
 *
 * WidgetDialogService is the single standard place for all window-event-driven
 * dialogs. To add a new global dialog:
 *   1. Add a new value to the WidgetEvent enum in libs/constant/src/widget-events.ts.
 *   2. Create the dialog component (no static open() needed).
 *   3. Register its window event in a service similar to this one, calling
 *      WidgetDialogService.open(MyDialogComponent, { theme, setup }).
 *
 * Event usage from client page:
 *   window.dispatchEvent(new CustomEvent(WidgetEvent.OpenInviteMemberDialog, {
 *     detail: { authToken: 'xxx', theme: 'dark' }
 *   }));
 */
@Injectable({ providedIn: 'root' })
export class UserManagementBridgeService {
    /** Emits when the event fires while UserManagementComponent IS mounted. */
    readonly openAddUser$ = new Subject<OpenAddUserConfig>();

    private readonly _dialogService = inject(WidgetDialogService);
    private readonly _themeService = inject(WidgetThemeService);

    /** Prevents multiple simultaneous standalone dialogs. */
    private _activeRef: WidgetDialogRef<AddUserDialogComponent> | null = null;

    constructor() {
        if (typeof window === 'undefined') return;

        // Drain events buffered before Angular bootstrapped.
        // Always open standalone — UserManagementComponent was NOT mounted when
        // they fired, so never route buffered events through openAddUser$ even if
        // the component has subscribed by the time we drain here.
        // Take only the LAST buffered event — discard duplicate rapid fires.
        const pending: Event[] = (window as any).__proxyAuth?.pendingDialogEvents ?? [];
        if (pending.length) {
            (window as any).__proxyAuth.pendingDialogEvents = [];
            this._openStandaloneDialog(this._extractConfig(pending[pending.length - 1]));
        }

        window.addEventListener(WidgetEvent.OpenInviteMemberDialog, (e: Event) => this._handleEvent(e));
    }

    private _handleEvent(e: Event): void {
        const config = this._extractConfig(e);
        if (this.openAddUser$.observed) {
            // UserManagementComponent is mounted — let it handle the dialog
            // so it can refresh its table after a member is added.
            this.openAddUser$.next(config);
        } else {
            this._openStandaloneDialog(config);
        }
    }

    private _extractConfig(e: Event): OpenAddUserConfig {
        const detail = (e as CustomEvent).detail ?? {};
        return {
            authToken: detail.authToken ?? '',
            theme: detail.theme ?? this._themeService.resolvedTheme() ?? undefined,
        };
    }

    private _openStandaloneDialog(config: OpenAddUserConfig): void {
        // Guard: don't open a second dialog while one is already visible.
        if (this._activeRef) return;

        const ref = this._dialogService.open(AddUserDialogComponent, {
            theme: config.theme,
            setup: (instance, dialogRef) => {
                instance.authToken = config.authToken;
                instance.theme = config.theme ?? '';
                instance.dialogRef = dialogRef;
            },
        });

        this._activeRef = ref;

        // Wrap close() so the guard resets when the dialog is dismissed.
        const originalClose = ref.close.bind(ref);
        ref.close = () => {
            this._activeRef = null;
            originalClose();
        };
    }
}
