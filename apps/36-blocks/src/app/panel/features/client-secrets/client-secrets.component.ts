import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    Input,
    OnChanges,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    computed,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IClientSecret, MAX_ACTIVE_CLIENT_SECRETS } from '@proxy/models/features-model';
import { ConfirmDialogComponent } from '@proxy/ui/confirm-dialog';
import { CopyButtonComponent } from '@proxy/ui/copy-button';
import { ClientSecretsComponentStore } from './client-secrets.store';

/**
 * Client secrets of a block, shown inside "Session & Token Settings".
 *
 * A client's backend uses one of these secrets, together with the one-time code from a
 * 'code' mode login redirect, to exchange for the session. At most
 * MAX_ACTIVE_CLIENT_SECRETS can be active at once so a secret can be rotated without
 * downtime. The plaintext is shown exactly once, right after creation; afterwards only
 * the last 4 characters are available. Revoked secrets stay listed as history.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-client-secrets',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        CopyButtonComponent,
    ],
    templateUrl: './client-secrets.component.html',
    styleUrls: ['./client-secrets.component.scss'],
    providers: [ClientSecretsComponentStore],
})
export class ClientSecretsComponent implements OnChanges {
    private store = inject(ClientSecretsComponentStore);
    private dialog = inject(MatDialog);
    private destroyRef = inject(DestroyRef);

    /** Numeric feature configuration id (`features/{id}/clientSecrets`). */
    @Input() featureId: number | null = null;

    public readonly maxSecrets = MAX_ACTIVE_CLIENT_SECRETS;

    public readonly secrets = signal<IClientSecret[]>([]);
    public readonly isLoading = signal(false);
    public readonly loadFailed = signal(false);
    public readonly isCreating = signal(false);
    public readonly revokingId = signal<number | null>(null);
    /** The just-created secret, holding the one-time plaintext. Only set while the reveal step is open. */
    public readonly createdSecret = signal<IClientSecret | null>(null);

    /** Active secrets first, then revoked history; newest first within each group. */
    public readonly sortedSecrets = computed(() =>
        [...this.secrets()].sort((a, b) => {
            const aRevoked = a.revoked_at ? 1 : 0;
            const bRevoked = b.revoked_at ? 1 : 0;
            return aRevoked - bRevoked || b.id - a.id;
        })
    );
    public readonly activeCount = computed(() => this.secrets().filter((secret) => !secret.revoked_at).length);
    public readonly limitReached = computed(() => this.activeCount() >= this.maxSecrets);
    /** Creating is blocked at the limit, and until the list is known (the count would be wrong). */
    public readonly canCreate = computed(() => {
        const listUnknown = !this.secrets().length && (this.isLoading() || this.loadFailed());
        return !this.limitReached() && !listUnknown;
    });

    public readonly createForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]),
    });

    private createDialogRef: MatDialogRef<unknown> | null = null;

    @ViewChild('createDialogTemplate', { static: true }) createDialogTemplate: TemplateRef<unknown>;

    constructor() {
        this.store.secrets$.pipe(takeUntilDestroyed()).subscribe((secrets) => this.secrets.set(secrets));
        this.store.isLoading$.pipe(takeUntilDestroyed()).subscribe((value) => this.isLoading.set(value));
        this.store.loadFailed$.pipe(takeUntilDestroyed()).subscribe((value) => this.loadFailed.set(value));
        this.store.revokingId$.pipe(takeUntilDestroyed()).subscribe((value) => this.revokingId.set(value));

        this.store.isCreating$.pipe(takeUntilDestroyed()).subscribe((value) => {
            this.isCreating.set(value);
            // don't let a stray click on the backdrop dismiss the dialog mid-request
            if (this.createDialogRef && !this.createdSecret()) {
                this.createDialogRef.disableClose = value;
            }
        });

        this.store.createdSecret$.pipe(takeUntilDestroyed()).subscribe((secret) => {
            if (!secret?.client_secret) {
                return;
            }
            // Switch the open dialog to the one-time reveal step. It can only be closed with "Done",
            // so the secret isn't lost to a misclick.
            this.createdSecret.set(secret);
            if (this.createDialogRef) {
                this.createDialogRef.disableClose = true;
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['featureId'] && this.featureId) {
            this.store.getSecrets(this.featureId);
        }
    }

    public reload(): void {
        if (this.featureId) {
            this.store.getSecrets(this.featureId);
        }
    }

    public trackById(_: number, secret: IClientSecret): number {
        return secret.id;
    }

    /** Opens the "Create client secret" form as a centered modal with a backdrop. */
    public openCreateDialog(): void {
        if (!this.canCreate() || this.createDialogRef) {
            return;
        }
        this.createForm.reset({ name: '' });
        this.createdSecret.set(null);
        this.createDialogRef = this.dialog.open(this.createDialogTemplate, {
            panelClass: ['mat-dialog', 'client-secret-dialog'],
            hasBackdrop: true,
            autoFocus: 'input',
            restoreFocus: true,
        });
        this.createDialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.createDialogRef = null;
                // the plaintext must not outlive the reveal step
                this.createdSecret.set(null);
                this.store.clearCreatedSecret();
            });
    }

    public submitCreate(): void {
        if (!this.featureId || this.isCreating()) {
            return;
        }
        if (this.createForm.invalid) {
            this.createForm.markAllAsTouched();
            return;
        }
        this.store.createSecret({
            featureId: this.featureId,
            body: { name: this.createForm.getRawValue().name.trim() },
        });
    }

    public closeCreateDialog(): void {
        this.createDialogRef?.close();
    }

    public revoke(secret: IClientSecret): void {
        if (!this.featureId || secret.revoked_at || this.revokingId() !== null) {
            return;
        }
        const confirmDialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            panelClass: ['mat-dialog'],
        });
        confirmDialogRef.componentRef.setInput(
            'confirmationMessage',
            `Revoke "${secret.name}" (ending ${secret.last_four})? It stops working immediately: any server still using it will no longer be able to exchange login codes. This cannot be undone.`
        );
        confirmDialogRef.componentRef.setInput('confirmButtonText', 'Revoke');
        confirmDialogRef.componentRef.setInput('confirmButtonColor', 'warn');

        confirmDialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes' && this.featureId) {
                this.store.revokeSecret({ featureId: this.featureId, secretId: secret.id });
            }
        });
    }
}
