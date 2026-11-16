import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeedbackService } from '../feedback.service';

@Component({
    selector: 'proxy-feedback-floating-button',
    templateUrl: './feedback-floating-button.component.html',
    styleUrls: ['./feedback-floating-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
})
export class FeedbackFloatingButtonComponent {
    public readonly feedbackService = inject(FeedbackService);

    public readonly shouldShow = computed(() => {
        return this.feedbackService.isLoggedIn() && !this.feedbackService.isSidebarPresent();
    });

    public openFeedback(): void {
        this.feedbackService.openFeedback();
    }
}
