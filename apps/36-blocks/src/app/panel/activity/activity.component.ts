import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import {
    ActivityOperation,
    activityParams,
    emptyActivityFilters,
    isActivityForbidden,
    safeLoginRedirect,
} from './activity.models';
import { ActivityService } from './activity.service';

@Component({
    selector: 'proxy-activity',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DatePipe, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
    templateUrl: './activity.component.html',
    styleUrl: './activity.component.scss',
})
export class ActivityComponent implements OnInit, OnDestroy {
    private readonly service = inject(ActivityService);
    private request?: Subscription;
    private loginRequest?: Subscription;
    filters = emptyActivityFilters();
    private appliedFilters = emptyActivityFilters();
    readonly rows = signal<ActivityOperation[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly page = signal(1);
    readonly totalPages = signal(0);
    readonly total = signal(0);
    loginTarget = '';
    loginCompany = '';
    loginReason = '';
    loginConfirmed = false;
    readonly loggingIn = signal(false);
    readonly loginError = signal<string | null>(null);
    readonly loginMessage = signal<string | null>(null);
    readonly loginRedirect = signal<string | null>(null);

    ngOnInit(): void {
        this.load(1);
    }

    ngOnDestroy(): void {
        this.request?.unsubscribe();
        this.loginRequest?.unsubscribe();
    }

    applyFilters(): void {
        if (this.filters.startDate && this.filters.endDate && this.filters.endDate < this.filters.startDate) {
            this.error.set('The end date must be on or after the start date.');
            return;
        }
        this.appliedFilters = { ...this.filters };
        this.load(1);
    }

    clearFilters(): void {
        this.filters = emptyActivityFilters();
        this.appliedFilters = emptyActivityFilters();
        this.load(1);
    }

    load(page: number): void {
        this.request?.unsubscribe();
        this.loading.set(true);
        this.error.set(null);
        this.rows.set([]);
        this.total.set(0);
        this.totalPages.set(0);
        this.page.set(page);
        this.request = this.service.getOperations(activityParams(this.appliedFilters, page)).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (response.hasError || !response.data || !Array.isArray(response.data.data)) {
                    this.error.set('Activity could not be loaded. Retry or contact an administrator.');
                    return;
                }
                this.rows.set(response.data.data);
                this.total.set(response.data.totalEntityCount);
                this.totalPages.set(response.data.totalPageCount);
            },
            error: (error: unknown) => {
                this.loading.set(false);
                this.error.set(
                    isActivityForbidden(error)
                        ? 'You need the view_operations permission for this client to view activity. Ask a client administrator.'
                        : 'Activity could not be loaded. Check your connection and retry.'
                );
            },
        });
    }

    loginAs(): void {
        if (this.loggingIn()) return;
        this.loginError.set(null);
        this.loginMessage.set(null);
        this.loginRedirect.set(null);
        const userId = Number(this.loginTarget);
        const companyId = this.loginCompany.trim() ? Number(this.loginCompany) : undefined;
        const reason = this.loginReason.trim();
        if (
            !Number.isSafeInteger(userId) ||
            userId < 1 ||
            (companyId !== undefined && (!Number.isSafeInteger(companyId) || companyId < 1)) ||
            !reason ||
            reason.length > 500 ||
            !this.loginConfirmed
        ) {
            this.loginError.set(
                'Enter a valid user ID, an optional company ID and a reason of 1–500 characters, then confirm the action.'
            );
            return;
        }
        this.loggingIn.set(true);
        this.loginRequest = this.service
            .loginAs({ user_id: userId, ...(companyId === undefined ? {} : { company_id: companyId }), reason })
            .subscribe({
                next: (response) => {
                    this.loggingIn.set(false);
                    this.loginConfirmed = false;
                    if (response.hasError || !response.data) {
                        this.loginError.set(
                            'Login as could not be completed. Check the target membership and your permissions.'
                        );
                    } else {
                        const redirect = safeLoginRedirect(response.data.redirect_url);
                        this.loginRedirect.set(redirect);
                        this.loginMessage.set(
                            redirect
                                ? 'An impersonated session was created and audited. Open the connected application to continue.'
                                : 'An impersonated session was created and audited, but no safe application redirect is configured. Configure an HTTPS redirect on the block before using this journey.'
                        );
                    }
                    this.load(1);
                },
                error: (error: unknown) => {
                    this.loggingIn.set(false);
                    this.loginConfirmed = false;
                    this.loginError.set(
                        isActivityForbidden(error)
                            ? 'Login as requires an Owner, Admin or Super admin role in the current client and an eligible target membership.'
                            : 'Login as could not be completed. Check the reason and target, then investigate Activity before retrying.'
                    );
                    this.load(1);
                },
            });
    }

    clearLoginResult(): void {
        this.loginRedirect.set(null);
        this.loginMessage.set(null);
        this.loginError.set(null);
        this.loginConfirmed = false;
    }
}
