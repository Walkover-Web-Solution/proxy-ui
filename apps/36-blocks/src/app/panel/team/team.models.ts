/**
 * Operator team & access models.
 *
 * "Operators" are the people who sign in to this dashboard (the `User`/`ClientUser`/`Role` records of the
 * backend). They are NOT the end users of a connected application (see People) and the roles here are NOT
 * the per-block end-user roles. Keep that distinction visible in every label.
 */

/** Seeded dashboard role ids. The backend refuses to assign Super admin through invite / role change / API keys. */
export const SUPER_ADMIN_ROLE_ID = 1;
/** Invitation links expire after this many minutes (backend `InviteRequest::INVITE_EXPIRY_MINUTES`). */
export const INVITE_EXPIRY_MINUTES = 15;
export const TEAM_PAGE_SIZE = 25;

export const API_KEY_NAME_MIN = 3;
export const API_KEY_NAME_MAX = 50;
/** Mirrors the server rule so mistakes are caught before a round trip. The server stays authoritative. */
export const API_KEY_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_]+$/;

export const WORKSPACE_NAME_MIN = 3;
export const WORKSPACE_NAME_MAX = 50;
export const WORKSPACE_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_\s]+$/;

export interface OperatorRolePermission {
    permission: string;
}

export interface OperatorRole {
    id: number;
    role_name: string;
    permissions: OperatorRolePermission[];
}

export type InviteStatus = 'pending' | 'accepted' | 'rejected';
export type MembershipStatus = 'enabled' | 'disabled';

export interface TeamMember {
    id: number;
    email: string;
    fname: string | null;
    lname: string | null;
    mobile: string | null;
    is_registered: boolean;
    stage: string | null;
    created_at: string;
    client_user?: {
        id: number;
        status: MembershipStatus;
        invite_status: InviteStatus;
        created_at: string;
        updated_at: string;
        role?: { id: number; role_name: string } | null;
    } | null;
}

export type ApiKeyStatus = 'active' | 'inactive';

export interface ApiKeyActor {
    id: number;
    name: string | null;
    email: string | null;
}

export interface ApiKey {
    id: number;
    name: string;
    /** The backend returns the full secret on every read; treat it as sensitive. */
    authkey: string;
    role_id: number;
    status: ApiKeyStatus;
    created_at: string;
    updated_at: string;
    created_by?: ApiKeyActor | null;
    updated_by?: ApiKeyActor | null;
}

export interface InviteMemberRequest {
    email: string;
    role_id: number;
}

export interface UpdateMemberRoleRequest {
    user_id: number;
    role_id: number;
}

export interface CreateApiKeyRequest {
    name: string;
    role_id: number;
}

export interface UpdateApiKeyRequest {
    name?: string;
    role_id?: number;
    status?: ApiKeyStatus;
}

export interface CreateWorkspaceRequest {
    name: string;
}

export function memberDisplayName(member: Pick<TeamMember, 'fname' | 'lname' | 'email'>): string {
    const name = [member.fname, member.lname]
        .map((part) => (part ?? '').trim())
        .filter(Boolean)
        .join(' ');
    return name || member.email;
}

export type MemberStatusKey = 'active' | 'disabled' | 'invited' | 'invite-expired' | 'declined' | 'unknown';

export interface MemberStatus {
    key: MemberStatusKey;
    label: string;
    /** True when the invitation can be sent again (declined or expired). */
    canResend: boolean;
}

/**
 * Collapses the membership `status` + `invite_status` pair (plus invite age) into one label.
 * A pending invite older than the expiry window is shown as expired because the accept link no longer works.
 */
export function memberStatus(member: TeamMember, now: number = Date.now()): MemberStatus {
    const membership = member.client_user;
    if (!membership) return { key: 'unknown', label: 'Unknown', canResend: false };
    if (membership.invite_status === 'rejected') {
        return { key: 'declined', label: 'Invitation declined', canResend: true };
    }
    if (membership.invite_status === 'pending') {
        const sentAt = Date.parse(membership.updated_at);
        const expired = Number.isFinite(sentAt) && now - sentAt > INVITE_EXPIRY_MINUTES * 60_000;
        return expired
            ? { key: 'invite-expired', label: 'Invitation expired', canResend: true }
            : { key: 'invited', label: 'Invitation pending', canResend: false };
    }
    return membership.status === 'enabled'
        ? { key: 'active', label: 'Active', canResend: false }
        : { key: 'disabled', label: 'Disabled', canResend: false };
}

/** Roles an operator may be given through invite, role change or an API key (Super admin is excluded server-side). */
export function assignableRoles(roles: OperatorRole[]): OperatorRole[] {
    return roles.filter((role) => role.id !== SUPER_ADMIN_ROLE_ID).sort((a, b) => a.id - b.id);
}

export interface PermissionMatrixRow {
    permission: string;
    grants: Record<number, boolean>;
}

export interface PermissionMatrix {
    roles: OperatorRole[];
    rows: PermissionMatrixRow[];
}

/** One row per permission, one column per role (lowest id first), so "what can this role do" reads across. */
export function buildPermissionMatrix(roles: OperatorRole[]): PermissionMatrix {
    const ordered = [...roles].sort((a, b) => a.id - b.id);
    const names = new Set<string>();
    for (const role of ordered) {
        for (const item of role.permissions ?? []) names.add(item.permission);
    }
    const rows = [...names]
        .sort((a, b) => a.localeCompare(b))
        .map((permission) => ({
            permission,
            grants: Object.fromEntries(
                ordered.map((role) => [
                    role.id,
                    (role.permissions ?? []).some((item) => item.permission === permission),
                ])
            ) as Record<number, boolean>,
        }));
    return { roles: ordered, rows };
}

/** Shows only the end of a secret. The value is never logged or stored by the UI. */
export function maskSecret(value: string, visible = 4): string {
    if (!value) return '';
    return `••••••••••••${value.length > visible * 2 ? value.slice(-visible) : ''}`;
}

/** The shared interceptor uses errorCode; direct HttpClient failures retain status. */
export function isForbidden(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        (('status' in error && error.status === 403) || ('errorCode' in error && error.errorCode === 403))
    );
}

function collectMessages(value: unknown, out: string[], depth = 0): void {
    if (depth > 4 || value === null || value === undefined) return;
    if (typeof value === 'string') {
        if (value.trim()) out.push(value.trim());
    } else if (Array.isArray(value)) {
        value.forEach((item) => collectMessages(item, out, depth + 1));
    } else if (typeof value === 'object') {
        Object.values(value as Record<string, unknown>).forEach((item) => collectMessages(item, out, depth + 1));
    }
}

/**
 * Pulls readable validation/denial messages out of the several error envelopes the API and the shared
 * interceptor produce (`{errors}`, `{errors: {field: [..]}}`, `{data: {message}}`, plain strings).
 */
export function errorMessages(error: unknown, fallback: string): string {
    const messages: string[] = [];
    if (typeof error === 'string') {
        collectMessages(error, messages);
    } else if (typeof error === 'object' && error !== null) {
        const body = error as Record<string, unknown>;
        collectMessages(body['errors'], messages);
        if (!messages.length)
            collectMessages((body['data'] as Record<string, unknown> | undefined)?.['message'], messages);
        if (!messages.length) collectMessages(body['message'], messages);
    }
    return [...new Set(messages)].join(' ') || fallback;
}
