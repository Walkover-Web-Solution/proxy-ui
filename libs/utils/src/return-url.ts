/**
 * Post-login return URL handling. Dependency-free (no Angular) so it can be unit tested and shared by the route
 * guard, the login page, the onboarding page and the HTTP error interceptor.
 *
 * A return URL is only ever a same-origin, relative path that starts with a single "/". Anything else (an absolute
 * URL, a scheme, "//host", backslashes, control characters) is rejected, so a crafted link cannot turn the login page
 * into an open redirect. The value is a navigation target, not a secret, but it may carry OAuth query parameters
 * (client_id, state, code_challenge), so it is never logged or stored by this module.
 */

export const RETURN_URL_PARAM = 'returnUrl';
export const RETURN_URL_MAX_LENGTH = 4096;

/** Parts of the app that sit behind sign-in and are worth coming back to. */
const RETURNABLE_PREFIXES = ['/app', '/oauth', '/widget-preview', '/project'];
/** Never a destination after sign-in: they would loop or skip the flow they belong to. */
const NEVER_RETURN_PREFIXES = ['/login', '/register', '/onboarding'];

const PLACEHOLDER_ORIGIN = 'http://return-url.invalid';

function pathOf(url: string): string {
    return url.split(/[?#]/)[0];
}

function hasPrefix(path: string, prefix: string): boolean {
    return path === prefix || path.startsWith(`${prefix}/`);
}

/** The value itself when it is a safe same-origin relative path, otherwise null. */
export function sanitizeReturnUrl(value: unknown): string | null {
    if (typeof value !== 'string' || !value || value.length > RETURN_URL_MAX_LENGTH) return null;
    if (value[0] !== '/' || value[1] === '/' || value[1] === '\\') return null;
    // Backslashes, whitespace and control characters: browsers normalise or strip them ("/\t/evil.com" is "//evil.com").
    // eslint-disable-next-line no-control-regex
    if (/[\u0000- \u007f-\u009f\\]/.test(value)) return null;
    try {
        const parsed = new URL(value, PLACEHOLDER_ORIGIN);
        if (parsed.origin !== PLACEHOLDER_ORIGIN) return null;
    } catch {
        return null;
    }
    const path = pathOf(value);
    if (NEVER_RETURN_PREFIXES.some((prefix) => hasPrefix(path, prefix))) return null;
    return value;
}

/**
 * The URL to remember when sending someone to sign in from `currentUrl`: only protected app pages qualify, so the
 * public website (home, pricing, ...) keeps its existing behaviour.
 */
export function captureReturnUrl(currentUrl: unknown): string | null {
    const safe = sanitizeReturnUrl(currentUrl);
    if (!safe) return null;
    const path = pathOf(safe);
    return RETURNABLE_PREFIXES.some((prefix) => hasPrefix(path, prefix)) ? safe : null;
}

/** Query params for a link or navigation to the login page. Empty when there is nothing safe to return to. */
export function returnUrlQueryParams(url: unknown): Record<string, string> {
    const safe = captureReturnUrl(url);
    return safe ? { [RETURN_URL_PARAM]: safe } : {};
}

/** Where to go after sign-in: the sanitised return URL, else the fallback. */
export function resolvePostLoginTarget(returnUrl: unknown, fallback: string): string {
    return sanitizeReturnUrl(returnUrl) ?? fallback;
}

/** Reads the (already decoded) `returnUrl` value out of a router URL such as `/login?returnUrl=%2Fapp%2Fx`. */
export function readReturnUrlFromUrl(routerUrl: unknown): string | null {
    if (typeof routerUrl !== 'string') return null;
    const query = routerUrl.split('#')[0].split('?')[1];
    if (!query) return null;
    try {
        return sanitizeReturnUrl(new URLSearchParams(query).get(RETURN_URL_PARAM));
    } catch {
        return null;
    }
}
