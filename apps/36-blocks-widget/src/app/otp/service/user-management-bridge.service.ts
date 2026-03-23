import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Bridges the global `openAddUserDialog` window event to the
 * UserManagementComponent regardless of whether the component is
 * currently mounted.
 *
 * The service is root-provided so it lives for the entire lifetime of
 * the Angular app.  It registers the window listener once on
 * construction and buffers a pending-open flag so the component can
 * consume it when it eventually renders, even if the event was
 * dispatched before the component was instantiated.
 */
@Injectable({ providedIn: 'root' })
export class UserManagementBridgeService {
    /** Emits every time `openAddUserDialog` fires while the component IS mounted. */
    readonly openAddUser$ = new Subject<void>();

    /** True when the event fired but the component was not yet mounted. */
    private _pendingOpen = false;

    constructor() {
        if (typeof window === 'undefined') return;
        window.addEventListener('openAddUserDialog', () => {
            if (this.openAddUser$.observed) {
                // Component is subscribed — deliver immediately
                this.openAddUser$.next();
            } else {
                // Component not mounted yet — buffer for later
                this._pendingOpen = true;
            }
        });
    }

    /**
     * Called by the component in ngOnInit.
     * Flushes any buffered open request immediately and returns the
     * pending flag so the component knows to open on first render.
     */
    consumePending(): boolean {
        const had = this._pendingOpen;
        this._pendingOpen = false;
        return had;
    }
}
