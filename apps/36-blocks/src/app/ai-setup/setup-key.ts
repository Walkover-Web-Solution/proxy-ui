/**
 * Decisions about the dedicated "AI_setup" workspace key and who may create one. Dependency-free so it can be
 * unit tested without Angular. The server stays the authority for every one of these checks.
 */

/** The API forbids spaces in key names, so "AI setup" is sent as `AI_setup`. */
export const SETUP_KEY_NAME = 'AI_setup';
/** The role is found by name in the roles list, never by a hardcoded id. */
export const SETUP_KEY_ROLE_NAME = 'owner';
/** Roles this id can never be given to a key (Super admin). */
const SUPER_ADMIN_ROLE_ID = 1;

/** Permissions the dashboard user needs to mint (and find an existing) key. */
export const PERMISSION_CREATE_KEY = 'create_authkey';
export const PERMISSION_VIEW_KEYS = 'view_authkeys';
/** Needed only to revoke (deactivate) the key afterwards. */
export const PERMISSION_EDIT_KEY = 'edit_authkey';

export interface KeyLike {
    id: number;
    name: string;
    authkey?: string;
    role_id: number;
    status: string;
}

export interface RoleLike {
    id: number;
    role_name: string;
}

/** The Owner role, looked up by name. Null when the list has none (the caller shows an error, it never guesses an id). */
export function findOwnerRole<T extends RoleLike>(roles: readonly T[] | null | undefined): T | null {
    if (!Array.isArray(roles)) return null;
    return (
        roles.find(
            (role) =>
                role?.id !== SUPER_ADMIN_ROLE_ID &&
                typeof role?.role_name === 'string' &&
                role.role_name.trim().toLowerCase() === SETUP_KEY_ROLE_NAME
        ) ?? null
    );
}

export type KeyPlan<T extends KeyLike = KeyLike> = { action: 'reuse'; key: T } | { action: 'create'; name: string };

const SETUP_NAME_PATTERN = new RegExp(`^${SETUP_KEY_NAME}(_\\d+)?$`, 'i');

/**
 * Reuse an active key named `AI_setup` (or `AI_setup_<n>`, made by an earlier run) that carries the Owner role.
 * Otherwise create one: `AI_setup`, or the first free `AI_setup_<n>` when the name is taken (for example by an
 * inactive key, or by an active key with a different role, which must not be silently reused).
 */
export function planSetupKey<T extends KeyLike>(keys: readonly T[], ownerRoleId: number): KeyPlan<T> {
    const reusable = keys
        .filter(
            (key) =>
                key.status === 'active' &&
                key.role_id === ownerRoleId &&
                typeof key.authkey === 'string' &&
                key.authkey.length > 0 &&
                SETUP_NAME_PATTERN.test(key.name ?? '')
        )
        .sort((a, b) => a.id - b.id)[0];
    if (reusable) return { action: 'reuse', key: reusable };

    const taken = new Set(keys.map((key) => (key.name ?? '').toLowerCase()));
    if (!taken.has(SETUP_KEY_NAME.toLowerCase())) return { action: 'create', name: SETUP_KEY_NAME };
    for (let suffix = 2; ; suffix++) {
        const candidate = `${SETUP_KEY_NAME}_${suffix}`;
        if (!taken.has(candidate.toLowerCase())) return { action: 'create', name: candidate };
    }
}

export interface PermissionGate {
    /** May create (and read back) a key: the whole wizard depends on it. */
    canCreateKey: boolean;
    /** May deactivate it afterwards. */
    canRevokeKey: boolean;
    /** Permission names still missing for creating a key. */
    missing: string[];
}

/** The permission list is a flat array of names; anything else is treated as "no permissions". */
export function permissionGate(permissions: unknown): PermissionGate {
    const granted = new Set(Array.isArray(permissions) ? permissions.filter((p) => typeof p === 'string') : []);
    const missing = [PERMISSION_CREATE_KEY, PERMISSION_VIEW_KEYS].filter((name) => !granted.has(name));
    return {
        canCreateKey: missing.length === 0,
        canRevokeKey: granted.has(PERMISSION_EDIT_KEY),
        missing,
    };
}
