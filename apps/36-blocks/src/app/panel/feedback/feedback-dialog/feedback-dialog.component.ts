import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FeedbackApiService } from '../feedback-api.service';

@Component({
    selector: 'proxy-feedback-dialog',
    templateUrl: './feedback-dialog.component.html',
    styleUrls: ['./feedback-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
})
export class FeedbackDialogComponent {
    private readonly dialogRef = inject<MatDialogRef<FeedbackDialogComponent>>(MatDialogRef);
    private readonly apiService = inject(FeedbackApiService);

    public readonly state = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
    public readonly errorMessage = signal<string | null>(null);
    public feedbackText = '';

    public canSend(): boolean {
        return Boolean(this.feedbackText && this.feedbackText.trim().length > 0);
    }

    public async send(): Promise<void> {
        if (!this.canSend() || this.state() === 'loading') {
            return;
        }

        this.state.set('loading');
        this.errorMessage.set(null);
        this.dialogRef.disableClose = true;

        const result = await this.apiService.sendFeedback(this.feedbackText.trim());

        if (result.success) {
            this.state.set('success');
            this.dialogRef.disableClose = false;
        } else {
            this.state.set('error');
            this.dialogRef.disableClose = false;
            this.errorMessage.set(result.error || 'Failed to send feedback. Please try again.');
        }
    }

    public close(): void {
        if (this.state() !== 'loading') {
            this.dialogRef.close();
        }
    }
}
