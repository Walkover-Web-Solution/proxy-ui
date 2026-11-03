export type AuditOutcome = 'started' | 'succeeded' | 'denied' | 'failed';

export interface AuditContext {
    actor_user_id?: number;
    target_user_id?: number;
    target_company_id?: number;
    feature_configuration_id?: number;
    reason?: string;
    source_ip?: string;
    outcome?: AuditOutcome;
    failure_code?: string;
}

export interface ActivityOperation {
    id: number;
    session_id: number | null;
    operation: string;
    created_at: string;
    user?: { user_id: number; name: string; email: string } | null;
    audit_context?: AuditContext | null;
}

export interface ActivityFilters {
    operation: string;
    name: string;
    outcome: AuditOutcome | '';
    target_user_id: string;
    feature_configuration_id: string;
    startDate: string;
    endDate: string;
}

export function emptyActivityFilters(): ActivityFilters {
    return {
        operation: '',
        name: '',
        outcome: '',
        target_user_id: '',
        feature_configuration_id: '',
        startDate: '',
        endDate: '',
    };
}

export function activityParams(filters: ActivityFilters, pageNo: number): Record<string, string | number> {
    const params: Record<string, string | number> = { pageNo, itemsPerPage: 25 };
    for (const [key, value] of Object.entries(filters)) {
        if (value.trim()) params[key] = value.trim();
    }
    return params;
}

/** Only explicit web redirects may carry the issued credentials to a connected application. */
export function safeLoginRedirect(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    try {
        const url = new URL(value);
        if (url.username || url.password) return null;
        if (
            url.protocol === 'https:' ||
            (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
        ) {
            return url.href;
        }
    } catch {
        return null;
    }
    return null;
}

/** The shared interceptor uses errorCode; direct HttpClient failures retain status. */
export function isActivityForbidden(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        (('status' in error && error.status === 403) || ('errorCode' in error && error.errorCode === 403))
    );
}
