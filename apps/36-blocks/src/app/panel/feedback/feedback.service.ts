import { Injectable, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '@proxy/services/proxy/auth';
import { FeedbackApiService } from './feedback-api.service';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class FeedbackService {
    private readonly dialog = inject(MatDialog);
    private readonly apiService = inject(FeedbackApiService);
    private readonly cookieService = inject(CookieService);
    private readonly authService = inject(AuthService);

    public readonly isSidebarPresent = signal<boolean>(false);

    public isLoggedIn(): boolean {
        const cookie = this.cookieService.get('authToken');
        const mem = this.authService.getTokenSync();
        return Boolean((cookie && cookie.trim().length > 0) || (mem && mem.trim().length > 0));
    }

    public openFeedback(): void {
        this.apiService.refreshPlan();
        this.dialog.open(FeedbackDialogComponent, {
            panelClass: ['mat-dialog', 'feedback-dialog'],
            autoFocus: 'first-tabbable',
            restoreFocus: true,
        });
    }
}
