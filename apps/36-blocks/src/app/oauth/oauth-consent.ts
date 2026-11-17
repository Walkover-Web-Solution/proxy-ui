/**
 * Pure logic for the AI-tool authorization page: reading the authorize request out of the page URL, building the API
 * requests and classifying the API outcomes into the page's distinct states. Dependency-free (no Angular) so it can be
 * unit tested. Nothing here logs or stores anything: the request carries a PKCE challenge and the decision response
 * carries an authorization code, both of which must stay in memory only.
 */

export const AUTHORIZE_QUERY_KEYS = [
    'client_id',
    'redirect_uri',
    'response_type',
    'state',
    'scope',
    'code_challenge',
    'code_challenge_method',
] as const;

const REQUIRED_KEYS = ['client_id', 'redirect_uri', 'response_type'] as const;
/** PKCE is optional (the application may be registered without it) but the two values travel together. */
const PKCE_KEYS = ['code_challenge', 'code_challenge_method'] as const;
const MAX_PARAM_LENGTH = 2048;
const MAX_SCOPES = 20;

export interface AuthorizeParams {
    client_id: string;
    redirect_uri: string;
    response_type: string;
    /** Optional (PKCE); '' when absent. Both are present or both are absent. */
    code_challenge: string;
    code_challenge_method: string;
    /** Optional in the request; '' when absent. */
    state: string;
    /** Optional in the request; '' when absent. */
    scope: string;
}

export type ParsedAuthorizeRequest =
    | { ok: true; params: AuthorizeParams }
    | { ok: false; reason: 'missing' | 'unsupported' | 'malformed'; fields: string[] };

/**
 * Reads the authorize request from the page URL. Only checks that it is complete and well-formed enough to ask the
 * server about; the server is the authority on whether the client, redirect URI and challenge are valid.
 */
export function parseAuthorizeRequest(get: (key: string) => string | null | undefined): ParsedAuthorizeRequest {
    const read = (key: string): string | null => {
        const value = get(key);
        return typeof value === 'string' ? value : null;
    };
    const malformed = AUTHORIZE_QUERY_KEYS.filter((key) => {
        const value = read(key);
        // eslint-disable-next-line no-control-regex
        return value !== null && (value.length > MAX_PARAM_LENGTH || /[\u0000-\u001f\u007f]/.test(value));
    });
    if (malformed.length) return { ok: false, reason: 'malformed', fields: [...malformed] };

    const missing: string[] = REQUIRED_KEYS.filter((key) => !read(key)?.trim());
    const pkcePresent = PKCE_KEYS.filter((key) => !!read(key)?.trim());
    if (pkcePresent.length === 1) missing.push(...PKCE_KEYS.filter((key) => !read(key)?.trim()));
    if (missing.length) return { ok: false, reason: 'missing', fields: [...missing] };
    if (read('response_type') !== 'code') return { ok: false, reason: 'unsupported', fields: ['response_type'] };

    return {
        ok: true,
        params: {
            client_id: read('client_id')!,
            redirect_uri: read('redirect_uri')!,
            response_type: 'code',
            code_challenge: read('code_challenge') ?? '',
            code_challenge_method: read('code_challenge_method') ?? '',
            state: read('state') ?? '',
            scope: read('scope') ?? '',
        },
    };
}

export function invalidRequestMessage(
    reason: 'missing' | 'unsupported' | 'malformed',
    fields: readonly string[]
): string {
    switch (reason) {
        case 'missing':
            return `This authorization link is incomplete (missing ${fields.join(', ')}). Start the connection again from your AI tool.`;
        case 'unsupported':
            return 'This authorization link asks for a response type 36Blocks does not support. Start the connection again from your AI tool.';
        default:
            return 'This authorization link is not valid. Start the connection again from your AI tool.';
    }
}

/** Query parameters for `GET operator/oauth/authorize`: the request forwarded verbatim, empty optionals left out. */
export function buildAuthorizeQuery(params: AuthorizeParams): Record<string, string> {
    const query: Record<string, string> = {
        client_id: params.client_id,
        redirect_uri: params.redirect_uri,
        response_type: params.response_type,
    };
    if (params.code_challenge) query['code_challenge'] = params.code_challenge;
    if (params.code_challenge_method) query['code_challenge_method'] = params.code_challenge_method;
    if (params.state) query['state'] = params.state;
    if (params.scope) query['scope'] = params.scope;
    return query;
}

/** Body for `POST operator/oauth/decision`. Absent optionals are sent as empty strings. */
export function buildDecisionRequest(
    params: AuthorizeParams,
    action: 'approve' | 'deny'
): {
    client_id: string;
    redirect_uri: string;
    state: string;
    scope: string;
    code_challenge: string;
    code_challenge_method: string;
    action: 'approve' | 'deny';
} {
    return {
        client_id: params.client_id,
        redirect_uri: params.redirect_uri,
        state: params.state,
        scope: params.scope,
        code_challenge: params.code_challenge,
        code_challenge_method: params.code_challenge_method,
        action,
    };
}

/** The URL the browser may be sent to after a decision: an absolute http(s) URL, otherwise null. */
export function safeRedirectTarget(value: unknown): string | null {
    if (typeof value !== 'string' || !value || value.length > 8192) return null;
    // eslint-disable-next-line no-control-regex
    if (/[\u0000-\u001f\u007f\\]/.test(value)) return null;
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
    } catch {
        return null;
    }
}

/** Host (with port) of a redirect URI for display, or null when it is not an http(s) URL. */
export function redirectHost(value: unknown): string | null {
    const safe = safeRedirectTarget(value);
    return safe ? new URL(safe).host : null;
}

export interface ConsentScope {
    key: string;
    label: string;
}

export interface ReadyConsent {
    clientName: string;
    redirectHost: string | null;
    scopes: ConsentScope[];
    workspace: { id: number; name: string };
}

export type AuthorizeOutcome =
    | { kind: 'ready'; consent: ReadyConsent }
    | { kind: 'no-workspace'; clientName: string }
    | { kind: 'invalid'; message: string }
    | { kind: 'error'; message: string };

const FALLBACK_INVALID =
    'The 36Blocks server did not accept this authorization request. Start again from your AI tool.';
const FALLBACK_ERROR = 'The authorization request could not be loaded. Check your connection and try again.';

function text(value: unknown, max: number): string {
    return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** First readable message of an envelope's `errors` (string, string[] or { field: string[] }), else the fallback. */
export function firstErrorMessage(errors: unknown, fallback: string): string {
    const found: string[] = [];
    const walk = (value: unknown, depth: number): void => {
        if (depth > 4 || found.length) return;
        if (typeof value === 'string') {
            if (value.trim()) found.push(value.trim().slice(0, 300));
        } else if (Array.isArray(value)) {
            value.forEach((item) => walk(item, depth + 1));
        } else if (value && typeof value === 'object') {
            Object.values(value).forEach((item) => walk(item, depth + 1));
        }
    };
    walk(errors, 0);
    return found[0] ?? fallback;
}

/** Turns a successful HTTP response of `GET operator/oauth/authorize` into a page state. */
export function classifyAuthorizeResponse(res: any): AuthorizeOutcome {
    if (res?.hasError) return { kind: 'invalid', message: firstErrorMessage(res?.errors, FALLBACK_INVALID) };
    const data = res?.data;
    const clientName = text(data?.client_name, 120);
    if (!data || typeof data !== 'object' || !clientName) return { kind: 'error', message: FALLBACK_ERROR };

    const workspace = data.workspace;
    if (workspace === null || workspace === undefined) return { kind: 'no-workspace', clientName };
    const workspaceName = text(workspace?.name, 120);
    const workspaceId = Number(workspace?.id);
    if (!workspaceName || !Number.isFinite(workspaceId)) return { kind: 'error', message: FALLBACK_ERROR };

    const seen = new Set<string>();
    const scopes: ConsentScope[] = [];
    for (const scope of Array.isArray(data.scopes) ? data.scopes.slice(0, MAX_SCOPES) : []) {
        const key = text(scope?.key, 80);
        const label = text(scope?.label, 200) || key;
        if (key && !seen.has(key)) {
            seen.add(key);
            scopes.push({ key, label });
        }
    }
    return {
        kind: 'ready',
        consent: {
            clientName,
            redirectHost: redirectHost(data.redirect_uri),
            scopes,
            workspace: { id: workspaceId, name: workspaceName },
        },
    };
}

export type RequestFailure =
    | { kind: 'denied' }
    | { kind: 'invalid'; message: string }
    | { kind: 'error'; message: string };

/**
 * Classifies a failed request. The shared HTTP interceptor reshapes errors: 403 becomes `{errorCode: 403}`, 400 becomes
 * `{errorCode: 400}`, 404 and 422 keep the response envelope (`status: 'fail'`), 500 becomes `{errors, hasError}`
 * without a status, and a dropped connection stays an `HttpErrorResponse`. A rejected request (400, 404, 422) means the
 * link itself is bad, so retrying is pointless; anything else may work on a retry.
 */
export function classifyRequestFailure(error: any, invalidFallback = FALLBACK_INVALID): RequestFailure {
    const code = error?.errorCode ?? error?.status;
    if (code === 403) return { kind: 'denied' };
    if (code === 400 || code === 404 || code === 422 || (error?.hasError === true && error?.status === 'fail')) {
        return { kind: 'invalid', message: firstErrorMessage(error?.errors ?? error?.error?.errors, invalidFallback) };
    }
    return { kind: 'error', message: FALLBACK_ERROR };
}
