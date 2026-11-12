import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IClient } from '@proxy/models/root-models';
import { RootService } from '@proxy/services/proxy/root';
import {
    WORKSPACE_NAME_MAX,
    WORKSPACE_NAME_MIN,
    WORKSPACE_NAME_PATTERN,
    errorMessages,
    isForbidden,
} from '../../team/team.models';

/**
 * Creates a new workspace (a "client") owned by the signed-in user. On success the dialog closes with the created
 * workspace; the API has already switched the session into it, so the caller reloads the panel.
 */
@Component({
    selector: 'proxy-create-workspace-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './create-workspace-dialog.component.html',
})
export class CreateWorkspaceDialogComponent {
    private readonly dialogRef = inject<MatDialogRef<CreateWorkspaceDialogComponent, IClient>>(MatDialogRef);
    private readonly rootService = inject(RootService);

    protected readonly nameMin = WORKSPACE_NAME_MIN;
    protected readonly nameMax = WORKSPACE_NAME_MAX;
    readonly saving = signal(false);
    readonly error = signal<string | null>(null);

    readonly form = new FormGroup({
        name: new FormControl('', [
            Validators.required,
            Validators.minLength(WORKSPACE_NAME_MIN),
            Validators.maxLength(WORKSPACE_NAME_MAX),
            Validators.pattern(WORKSPACE_NAME_PATTERN),
        ]),
    });

    submit(): void {
        if (this.saving()) return;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const failure = 'The workspace could not be created. Check the name and retry.';
        this.saving.set(true);
        this.error.set(null);
        this.dialogRef.disableClose = true;
        this.rootService.createClient({ name: this.form.getRawValue().name!.trim() }).subscribe({
            next: (response) => {
                if (response.hasError || !response.data) {
                    this.fail(errorMessages(response, failure));
                    return;
                }
                this.saving.set(false);
                this.dialogRef.close(response.data);
            },
            error: (error: unknown) =>
                this.fail(
                    isForbidden(error)
                        ? 'You do not have permission to create a workspace.'
                        : errorMessages(error, failure)
                ),
        });
    }

    cancel(): void {
        if (!this.saving()) this.dialogRef.close();
    }

    private fail(message: string): void {
        this.saving.set(false);
        this.dialogRef.disableClose = false;
        this.error.set(message);
    }
}
