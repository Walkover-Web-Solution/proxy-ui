/**
 * Decision logic for sending a workspace that has no blocks to the "Set up with AI" wizard (`/app/setup`).
 * Dependency-free so it can be tested without Angular. The decision runs in a route guard before any dashboard page
 * renders. Loading, empty, error and denied stay distinct: only a successfully loaded, empty list qualifies, so a failed
 * or slow request never sends anyone anywhere.
 */

export const SETUP_ROUTE = '/app/setup';
export const MANUAL_CREATE_ROUTE = '/app/features/create';

export type BlockListStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'denied';

export interface SetupRedirectInput {
    clientId: number | null;
    status: BlockListStatus;
    /** Total blocks reported by the list API; null until a load succeeds. */
    total: number | null;
    /** The URL being navigated to. */
    url: string;
    /** The user chose "Skip, I'll set up manually" for this workspace in this tab. */
    skipped: boolean;
}

/**
 * The entry pages of the dashboard: where a user lands after sign-in, after switching workspace or from the logo.
 * Anything else (the wizard, the manual create/manage flows, team, billing, logs, activity, ...) is never redirected,
 * so a workspace without blocks can still reach them and the manual path cannot bounce back to the wizard.
 */
export function isRedirectableRoute(url: string): boolean {
    const path = (url ?? '').split(/[?#]/)[0].replace(/\/+$/, '');
    return path === '/app' || path === '/app/dashboard' || path === '/app/features';
}

/** True only for a loaded, empty block list on an entry page, when the user has not skipped the wizard here. */
export function shouldRedirectToSetup(input: SetupRedirectInput): boolean {
    return (
        input.clientId !== null &&
        input.status === 'loaded' &&
        input.total === 0 &&
        !input.skipped &&
        isRedirectableRoute(input.url)
    );
}

const SKIP_KEY_PREFIX = 'ai_setup_skipped_';

export function skipKey(clientId: number | string): string {
    return `${SKIP_KEY_PREFIX}${clientId}`;
}

function storage(): Storage | null {
    try {
        return typeof sessionStorage === 'undefined' ? null : sessionStorage;
    } catch {
        return null;
    }
}

/** False when storage is unavailable, so the redirect may happen again rather than crash. */
export function readSkipped(clientId: number | string): boolean {
    try {
        return storage()?.getItem(skipKey(clientId)) === '1';
    } catch {
        return false;
    }
}

/**
 * Remembers "Skip, I'll set up manually" for this workspace, for this browser tab only (sessionStorage), so a new
 * session asks again. Only this flag is ever stored: never a block name, a prompt or an identifier of the user.
 */
export function writeSkipped(clientId: number | string): void {
    try {
        storage()?.setItem(skipKey(clientId), '1');
    } catch {
        // Storage unavailable or full: the redirect may happen again, which is acceptable.
    }
}

/**
 * Forgets every "Skip, I'll set up manually" choice. Called on sign-in and sign-out: the choice belongs to one signed-in
 * session, so it must not survive into the next one in the same tab (a logout reloads the page but keeps sessionStorage).
 * Only this feature's keys are removed.
 */
export function clearAllSkipped(): void {
    try {
        const store = storage();
        if (!store) return;
        const stale: string[] = [];
        for (let i = 0; i < store.length; i++) {
            const key = store.key(i);
            if (key?.startsWith(SKIP_KEY_PREFIX)) stale.push(key);
        }
        stale.forEach((key) => store.removeItem(key));
    } catch {
        // Storage unavailable: nothing was remembered, so nothing to forget.
    }
}
