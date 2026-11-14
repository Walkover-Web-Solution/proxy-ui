/**
 * Decision logic for the one-time redirect to the "Set up with AI" wizard (`/app/setup`). Dependency-free so it can be
 * tested without Angular. Loading, empty, error and denied stay distinct: only a successfully loaded, empty list
 * qualifies, so a failed or slow request never sends anyone anywhere.
 */

export const SETUP_ROUTE = '/app/setup';

export type BlockListStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'denied';

export interface SetupRedirectInput {
    clientId: number | null;
    status: BlockListStatus;
    /** Total blocks reported by the list API; null until a load succeeds. */
    total: number | null;
    /** Current router URL. */
    url: string;
    dismissed: boolean;
    /** A dialog is currently open: never navigate away from under it. */
    anotherDialogOpen: boolean;
    /** The redirect already happened for this workspace in this tab. */
    alreadyRedirected: boolean;
}

/**
 * Dashboard pages only. Excludes the wizard itself and the manual create/manage flows, where the user is already
 * setting a block up.
 */
export function isRedirectableRoute(url: string): boolean {
    const path = (url ?? '').split(/[?#]/)[0];
    if (!path.startsWith('/app/') && path !== '/app') return false;
    if (/^\/app\/setup(\/|$)/.test(path)) return false;
    return !/^\/app\/features\/(create|manage)(\/|$)/.test(path);
}

export function shouldRedirectToSetup(input: SetupRedirectInput): boolean {
    return (
        input.clientId !== null &&
        input.status === 'loaded' &&
        input.total === 0 &&
        !input.dismissed &&
        !input.anotherDialogOpen &&
        !input.alreadyRedirected &&
        isRedirectableRoute(input.url)
    );
}

export function dismissalKey(clientId: number | string): string {
    return `ai_setup_dismissed_${clientId}`;
}

function storage(): Storage | null {
    try {
        return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
        return null;
    }
}

/** False when storage is unavailable, so the redirect may happen again rather than crash. */
export function readDismissed(clientId: number | string): boolean {
    try {
        return storage()?.getItem(dismissalKey(clientId)) === '1';
    } catch {
        return false;
    }
}

/** Only this flag is ever stored: never a key, a prompt or a block name. */
export function writeDismissed(clientId: number | string): void {
    try {
        storage()?.setItem(dismissalKey(clientId), '1');
    } catch {
        // Storage unavailable or full: the redirect may happen again, which is acceptable.
    }
}
