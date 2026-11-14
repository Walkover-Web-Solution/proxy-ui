import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiKey, isForbidden } from '../panel/team/team.models';
import { TeamService } from '../panel/team/team.service';
import { PermissionGate, SETUP_KEY_NAME, findOwnerRole, permissionGate, planSetupKey } from './setup-key';

export type PermissionState = 'idle' | 'loading' | 'allowed' | 'denied' | 'error';
export type ProvisionState = 'idle' | 'working' | 'ready' | 'denied' | 'failed';
export type RevokeState = 'idle' | 'working' | 'done' | 'failed';
/** Why creating or finding the key failed. The message never contains the key. */
export type ProvisionFailure = 'role' | 'keys' | 'create' | 'incomplete';

const KEY_LIST_PAGE_LIMIT = 20;

export const PROVISION_FAILURE_TEXT: Record<ProvisionFailure, string> = {
    role: 'We couldn’t find the Owner role in this workspace, so no key was created. Try again, or set up manually.',
    keys: 'Your workspace’s API keys couldn’t be checked, so no key was created. Try again in a moment.',
    create: 'The API key couldn’t be created. Nothing was changed. Try again in a moment, or set up manually.',
    incomplete:
        'This workspace has too many API keys to check for an existing setup key. Remove unused keys under Team & access, or set up manually.',
};

/**
 * Finds or creates the dedicated "AI_setup" key (Owner role) and can revoke it again.
 *
 * Deliberately NOT `providedIn: 'root'`: it is provided by the component that needs it (the wizard page, the block
 * dialog), so the key value lives only as long as that component and is dropped with it. The key is held in a private
 * field, never in `localStorage`/`sessionStorage`, a URL, a log or an error message. Failure texts are fixed strings.
 */
@Injectable()
export class SetupKeyService implements OnDestroy {
    private readonly team = inject(TeamService);

    readonly permissions = signal<PermissionState>('idle');
    readonly canRevoke = signal(false);
    readonly provision = signal<ProvisionState>('idle');
    readonly failure = signal<ProvisionFailure | null>(null);
    readonly revoke = signal<RevokeState>('idle');
    /** Name of the key in use (not secret). */
    readonly keyName = signal<string | null>(null);
    /** True when an existing active key was reused instead of creating one. */
    readonly reused = signal(false);

    private key: string | null = null;
    private keyId: number | null = null;
    private destroyed = false;

    /** The key, for building a prompt. Held in memory only. */
    authKey(): string | null {
        return this.key;
    }

    ngOnDestroy(): void {
        this.destroyed = true;
        this.key = null;
        this.keyId = null;
    }

    async loadPermissions(): Promise<void> {
        if (this.permissions() === 'loading') return;
        this.permissions.set('loading');
        try {
            const response = await firstValueFrom(this.team.getMyPermissions());
            if (this.destroyed) return;
            if (response.hasError || !Array.isArray(response.data)) {
                this.permissions.set('error');
                return;
            }
            const gate: PermissionGate = permissionGate(response.data);
            this.canRevoke.set(gate.canRevokeKey);
            this.permissions.set(gate.canCreateKey ? 'allowed' : 'denied');
        } catch {
            if (!this.destroyed) this.permissions.set('error');
        }
    }

    /**
     * Checks permissions (once), then reuses or creates the key. Only ever called from an explicit user action:
     * nothing is created before a click.
     */
    async prepare(): Promise<void> {
        if (this.provision() === 'working') return;
        if (this.permissions() !== 'allowed') {
            await this.loadPermissions();
            if (this.destroyed || this.permissions() !== 'allowed') return;
        }
        await this.provisionKey();
    }

    private async provisionKey(): Promise<void> {
        this.provision.set('working');
        this.failure.set(null);
        this.revoke.set('idle');
        const fail = (failure: ProvisionFailure) => {
            if (this.destroyed) return;
            this.failure.set(failure);
            this.provision.set('failed');
        };
        const deny = () => {
            if (this.destroyed) return;
            this.permissions.set('denied');
            this.provision.set('denied');
        };

        // 1. The Owner role, looked up by name.
        let ownerRoleId: number;
        try {
            const roles = await firstValueFrom(this.team.getRoles());
            const owner = roles.hasError ? null : findOwnerRole(roles.data?.data);
            if (!owner) return fail('role');
            ownerRoleId = owner.id;
        } catch {
            return fail('role');
        }

        // 2. Every existing key (so an active AI_setup key is reused and a taken name is never reused for a new key).
        const keys: ApiKey[] = [];
        try {
            for (let page = 1; page <= KEY_LIST_PAGE_LIMIT; page++) {
                const response = await firstValueFrom(this.team.getApiKeys(page));
                if (response.hasError || !Array.isArray(response.data?.data)) return fail('keys');
                keys.push(...response.data.data);
                const totalPages = response.data.totalPageCount ?? 1;
                if (page >= totalPages) break;
                if (page === KEY_LIST_PAGE_LIMIT) return fail('incomplete');
            }
        } catch (error) {
            return isForbidden(error) ? deny() : fail('keys');
        }
        if (this.destroyed) return;

        // 3. Reuse or create.
        const plan = planSetupKey(keys, ownerRoleId);
        if (plan.action === 'reuse') {
            this.adopt(plan.key, true);
            return;
        }
        try {
            const created = await firstValueFrom(this.team.createApiKey({ name: plan.name, role_id: ownerRoleId }));
            const key = created.data as ApiKey | undefined;
            if (created.hasError || !key || typeof key.authkey !== 'string' || !key.authkey) return fail('create');
            this.adopt(key, false);
        } catch (error) {
            // A 403 from the create call lands in the same state as a missing permission.
            return isForbidden(error) ? deny() : fail('create');
        }
    }

    private adopt(key: ApiKey, reused: boolean): void {
        if (this.destroyed) return;
        this.key = key.authkey;
        this.keyId = key.id;
        this.keyName.set(key.name || SETUP_KEY_NAME);
        this.reused.set(reused);
        this.provision.set('ready');
    }

    /** Deactivates (does not delete) the key. On success the key is also dropped from memory. */
    async revokeKey(): Promise<void> {
        if (this.keyId === null || this.revoke() === 'working') return;
        this.revoke.set('working');
        try {
            const response = await firstValueFrom(this.team.updateApiKey(this.keyId, { status: 'inactive' }));
            if (this.destroyed) return;
            if (response.hasError) {
                this.revoke.set('failed');
                return;
            }
            this.key = null;
            this.keyId = null;
            this.revoke.set('done');
            this.provision.set('idle');
        } catch {
            if (!this.destroyed) this.revoke.set('failed');
        }
    }
}
