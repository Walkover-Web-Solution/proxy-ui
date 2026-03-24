import { ApplicationRef, EnvironmentInjector, Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';

export interface OpenAddUserConfig {
    authToken: string;
    theme?: string;
}

/**
 * Bridges the global `openAddUserDialog` window event to the
 * UserManagementComponent regardless of whether the component is
 * currently mounted.
 *
 * If UserManagementComponent IS mounted it delegates directly to it.
 * If it is NOT mounted, a standalone AddUserDialogComponent is created
 * dynamically and appended directly to document.body — no parent
 * component required, no z-index issues.
 *
 * Event usage from client page:
 *   window.dispatchEvent(new CustomEvent('openAddUserDialog', {
 *     detail: { authToken: 'xxx', theme: 'dark' }
 *   }));
 */
@Injectable({ providedIn: 'root' })
export class UserManagementBridgeService {
    /** Emits every time `openAddUserDialog` fires while UserManagementComponent IS mounted. */
    readonly openAddUser$ = new Subject<void>();

    /** Buffered config when event fires before component mounts. */
    private _pendingConfig: OpenAddUserConfig | null = null;

    private readonly _appRef = inject(ApplicationRef);
    private readonly _injector = inject(EnvironmentInjector);

    constructor() {
        if (typeof window === 'undefined') return;
        window.addEventListener('openAddUserDialog', (e: Event) => {
            const config: OpenAddUserConfig = {
                authToken: (e as CustomEvent).detail?.authToken ?? '',
                theme: (e as CustomEvent).detail?.theme ?? '',
            };

            if (this.openAddUser$.observed) {
                // UserManagementComponent is subscribed — deliver to it directly
                this.openAddUser$.next();
            } else {
                // Component not mounted — open standalone dialog immediately
                this._openStandaloneDialog(config);
            }
        });
    }

    /**
     * Called by UserManagementComponent in its constructor.
     * Returns any buffered config so the component can open the dialog on first render.
     */
    consumePending(): OpenAddUserConfig | null {
        const cfg = this._pendingConfig;
        this._pendingConfig = null;
        return cfg;
    }

    private _openStandaloneDialog(config: OpenAddUserConfig): void {
        // Lazy import to avoid circular deps and keep the chunk separate
        import('../user-management/add-user-dialog.component').then(({ AddUserDialogComponent }) => {
            AddUserDialogComponent.open(this._appRef, this._injector, {
                authToken: config.authToken,
                theme: config.theme ?? '',
            });
        });
    }
}
