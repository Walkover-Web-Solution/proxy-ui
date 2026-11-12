import { DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    computed,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent } from '@proxy/ui/confirm-dialog';
import { CopyButtonComponent } from '@proxy/ui/copy-button';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { Observable, Subscription } from 'rxjs';
import {
    API_KEY_NAME_MAX,
    API_KEY_NAME_MIN,
    API_KEY_NAME_PATTERN,
    ApiKey,
    OperatorRole,
    assignableRoles,
    errorMessages,
    isForbidden,
    maskSecret,
} from '../team.models';
import { TeamResponse, TeamService } from '../team.service';

/**
 * API keys ("authkeys") of the current workspace. A key identifies the workspace to your servers and acts with the
 * permissions of its role, so the secret is masked by default and only revealed on request in this browser tab.
 */
@Component({
    selector: 'proxy-team-api-keys',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DatePipe,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatTooltipModule,
        CopyButtonComponent,
    ],
    templateUrl: './api-keys.component.html',
    styleUrl: '../team-tab.scss',
})
export class ApiKeysComponent implements OnInit, OnDestroy {
    private readonly service = inject(TeamService);
    private readonly dialog = inject(MatDialog);
    private readonly toast = inject(PrimeNgToastService);
    private readonly destroyRef = inject(DestroyRef);
    private keysRequest?: Subscription;
    private rolesRequest?: Subscription;
    private saveRequest?: Subscription;
    private dialogRef: MatDialogRef<unknown> | null = null;

    @ViewChild('keyDialog', { static: true }) keyDialog!: TemplateRef<unknown>;

    protected readonly mask = maskSecret;
    protected readonly nameMin = API_KEY_NAME_MIN;
    protected readonly nameMax = API_KEY_NAME_MAX;

    readonly keys = signal<ApiKey[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly page = signal(1);
    readonly totalPages = signal(0);
    readonly total = signal(0);

    readonly roles = signal<OperatorRole[]>([]);
    readonly rolesLoading = signal(false);
    readonly rolesFailed = signal(false);
    readonly assignable = computed(() => assignableRoles(this.roles()));

    /** Ids whose secret is currently visible. Held only in memory. */
    readonly revealed = signal<ReadonlySet<number>>(new Set());
    readonly saving = signal(false);
    readonly dialogError = signal<string | null>(null);
    readonly editing = signal<ApiKey | null>(null);
    /** Key currently being activated, deactivated or deleted. */
    readonly busyId = signal<number | null>(null);

    readonly keyForm = new FormGroup({
        name: new FormControl('', [
            Validators.required,
            Validators.minLength(API_KEY_NAME_MIN),
            Validators.maxLength(API_KEY_NAME_MAX),
            Validators.pattern(API_KEY_NAME_PATTERN),
        ]),
        role_id: new FormControl<number | null>(null, [Validators.required]),
    });

    ngOnInit(): void {
        this.load(1);
        this.loadRoles();
    }

    ngOnDestroy(): void {
        this.keysRequest?.unsubscribe();
        this.rolesRequest?.unsubscribe();
        this.saveRequest?.unsubscribe();
    }

    roleName(roleId: number): string {
        return this.roles().find((role) => role.id === roleId)?.role_name ?? `Role #${roleId}`;
    }

    actor(actor: ApiKey['created_by']): string {
        return actor?.name?.trim() || actor?.email || 'Unknown';
    }

    isRevealed(key: ApiKey): boolean {
        return this.revealed().has(key.id);
    }

    toggleReveal(key: ApiKey): void {
        const next = new Set(this.revealed());
        if (!next.delete(key.id)) next.add(key.id);
        this.revealed.set(next);
    }

    load(page: number): void {
        this.keysRequest?.unsubscribe();
        this.loading.set(true);
        this.error.set(null);
        this.page.set(page);
        this.keysRequest = this.service.getApiKeys(page).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (response.hasError || !response.data || !Array.isArray(response.data.data)) {
                    this.keys.set([]);
                    this.error.set('API keys could not be loaded. Retry or contact an administrator.');
                    return;
                }
                this.keys.set(response.data.data);
                this.total.set(response.data.totalEntityCount ?? response.data.data.length);
                this.totalPages.set(response.data.totalPageCount ?? 1);
            },
            error: (error: unknown) => {
                this.loading.set(false);
                this.keys.set([]);
                this.error.set(
                    isForbidden(error)
                        ? 'You need the view_authkeys permission in this workspace to see API keys. Ask a workspace Owner or Admin.'
                        : 'API keys could not be loaded. Check your connection and retry.'
                );
            },
        });
    }

    loadRoles(refresh = false): void {
        this.rolesRequest?.unsubscribe();
        this.rolesLoading.set(true);
        this.rolesFailed.set(false);
        this.rolesRequest = this.service.getRoles(refresh).subscribe({
            next: (response) => {
                this.rolesLoading.set(false);
                if (response.hasError || !Array.isArray(response.data?.data)) {
                    this.rolesFailed.set(true);
                    return;
                }
                this.roles.set(response.data.data);
            },
            error: () => {
                this.rolesLoading.set(false);
                this.rolesFailed.set(true);
            },
        });
    }

    openCreate(): void {
        if (this.dialogRef) return;
        this.editing.set(null);
        this.keyForm.reset({ name: '', role_id: null });
        this.openDialog();
    }

    openEdit(key: ApiKey): void {
        if (this.dialogRef) return;
        this.editing.set(key);
        this.keyForm.reset({
            name: key.name,
            role_id: this.assignable().some((role) => role.id === key.role_id) ? key.role_id : null,
        });
        this.openDialog();
    }

    submitKey(): void {
        if (this.saving()) return;
        if (this.keyForm.invalid) {
            this.keyForm.markAllAsTouched();
            return;
        }
        const { name, role_id } = this.keyForm.getRawValue();
        const existing = this.editing();
        const trimmed = name!.trim();
        if (!existing) {
            this.runSave(this.service.createApiKey({ name: trimmed, role_id: role_id! }), (response) => {
                const created = response.data as ApiKey | undefined;
                if (created?.id) this.revealed.set(new Set(this.revealed()).add(created.id));
                this.toast.success(`API key “${trimmed}” was created.`);
            });
            return;
        }
        const changes: { name?: string; role_id?: number } = {};
        if (trimmed !== existing.name) changes.name = trimmed;
        if (role_id !== existing.role_id) changes.role_id = role_id!;
        if (!Object.keys(changes).length) {
            this.dialogError.set('Change the name or the role before saving.');
            return;
        }
        this.runSave(this.service.updateApiKey(existing.id, changes), () => {
            this.toast.success(`API key “${trimmed}” was updated.`);
        });
    }

    closeDialog(): void {
        this.dialogRef?.close();
    }

    setActive(key: ApiKey, active: boolean): void {
        if (this.busyId() !== null) return;
        if (active) {
            this.updateStatus(key, 'active');
            return;
        }
        this.confirm(
            `Deactivate “${key.name}”? Servers that send this key will be rejected until you activate it again.`,
            'Deactivate'
        ).subscribe((action) => {
            if (action === 'yes') this.updateStatus(key, 'inactive');
        });
    }

    remove(key: ApiKey): void {
        if (this.busyId() !== null) return;
        this.confirm(
            `Delete “${key.name}”? It stops working immediately: any server still using it will be rejected. This cannot be undone.`,
            'Delete'
        ).subscribe((action) => {
            if (action !== 'yes') return;
            this.busyId.set(key.id);
            this.service.deleteApiKey(key.id).subscribe({
                next: (response) => {
                    this.busyId.set(null);
                    if (response.hasError) {
                        this.toast.error(errorMessages(response, 'The API key could not be deleted.'));
                        return;
                    }
                    this.toast.success(`API key “${key.name}” was deleted.`);
                    // stay on the same page unless it is now empty
                    this.load(this.keys().length === 1 && this.page() > 1 ? this.page() - 1 : this.page());
                },
                error: (error: unknown) => {
                    this.busyId.set(null);
                    this.toast.error(this.failure(error, 'The API key could not be deleted.'));
                },
            });
        });
    }

    private updateStatus(key: ApiKey, status: 'active' | 'inactive'): void {
        this.busyId.set(key.id);
        this.service.updateApiKey(key.id, { status }).subscribe({
            next: (response) => {
                this.busyId.set(null);
                if (response.hasError) {
                    this.toast.error(errorMessages(response, 'The API key could not be updated.'));
                    return;
                }
                this.toast.success(`API key “${key.name}” is now ${status}.`);
                this.load(this.page());
            },
            error: (error: unknown) => {
                this.busyId.set(null);
                this.toast.error(this.failure(error, 'The API key could not be updated.'));
            },
        });
    }

    private confirm(message: string, buttonText: string): Observable<'yes' | 'no' | undefined> {
        const ref: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            panelClass: ['mat-dialog'],
        });
        ref.componentRef.setInput('confirmationMessage', message);
        ref.componentRef.setInput('confirmButtonText', buttonText);
        ref.componentRef.setInput('confirmButtonColor', 'warn');
        return ref.afterClosed();
    }

    private failure(error: unknown, fallback: string): string {
        return isForbidden(error)
            ? 'Your role does not allow this action. Ask a workspace Owner or Admin.'
            : errorMessages(error, fallback);
    }

    private runSave(
        request: Observable<TeamResponse<unknown>>,
        onSuccess: (response: TeamResponse<unknown>) => void
    ): void {
        const wasEditing = !!this.editing();
        this.saving.set(true);
        this.dialogError.set(null);
        if (this.dialogRef) this.dialogRef.disableClose = true;
        this.saveRequest = request.subscribe({
            next: (response) => {
                this.saving.set(false);
                if (this.dialogRef) this.dialogRef.disableClose = false;
                if (response.hasError) {
                    this.dialogError.set(errorMessages(response, 'The API key could not be saved.'));
                    return;
                }
                onSuccess(response);
                this.closeDialog();
                this.load(wasEditing ? this.page() : 1);
            },
            error: (error: unknown) => {
                this.saving.set(false);
                if (this.dialogRef) this.dialogRef.disableClose = false;
                this.dialogError.set(this.failure(error, 'The API key could not be saved.'));
            },
        });
    }

    private openDialog(): void {
        this.dialogError.set(null);
        this.dialogRef = this.dialog.open(this.keyDialog, {
            panelClass: ['mat-dialog'],
            hasBackdrop: true,
            autoFocus: 'input',
            restoreFocus: true,
        });
        this.dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.dialogRef = null;
                this.editing.set(null);
                this.dialogError.set(null);
            });
    }
}
