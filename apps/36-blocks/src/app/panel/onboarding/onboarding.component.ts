import {
    ChangeDetectionStrategy,
    Component,
    inject,
    NgZone,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
    signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AuthService } from '@proxy/services/proxy/auth';
import { UsersService } from '@proxy/services/proxy/users';
import * as logInActions from '../../website/home/ngrx/actions/login.action';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-onboarding',
    imports: [],
    templateUrl: './onboarding.component.html',
    styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent implements OnInit, OnDestroy {
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    private readonly usersService = inject(UsersService);
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly ngZone = inject(NgZone);
    private readonly destroy$ = new Subject<void>();

    public readonly onboardingError = signal<string | null>(null);
    public readonly onboardingInProgress = signal<boolean>(true);
    public readonly redirectCountdown = signal<number>(3);

    private redirectTimer: ReturnType<typeof setInterval> | null = null;

    public ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const verificationCode = this.activatedRoute.snapshot.queryParamMap.get('code');

        if (!verificationCode) {
            this.onboardingError.set('No verification code found. Please check your email link and try again.');
            this.onboardingInProgress.set(false);
            this.redirectToHomeAfterDelay();
            return;
        }

        this.usersService
            .exchangeToken(verificationCode)
            .pipe(take(1), takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const jwtToken = response?.token;
                    if (!jwtToken) {
                        this.onboardingError.set('Verification failed: invalid server response. Please try again.');
                        this.onboardingInProgress.set(false);
                        this.redirectToHomeAfterDelay();
                        return;
                    }

                    this.authService.setTokenSync(jwtToken);

                    this.actions$
                        .pipe(ofType(logInActions.authenticatedAction), take(1), takeUntil(this.destroy$))
                        .subscribe(() => {
                            this.router.navigate(['/app/features/create']);
                        });

                    this.actions$
                        .pipe(ofType(logInActions.logInActionError), take(1), takeUntil(this.destroy$))
                        .subscribe(({ errors }) => {
                            this.onboardingError.set(errors?.join(' ') || 'Verification failed. Please try again.');
                            this.onboardingInProgress.set(false);
                        });

                    this.store.dispatch(logInActions.getUserAction());
                },
                error: (error) => {
                    const errorBody = error?.error;
                    const resolvedMessage =
                        errorBody?.errors?.message ||
                        errorBody?.data?.message ||
                        errorBody?.message ||
                        'Verification failed. Please try again.';
                    this.onboardingError.set(resolvedMessage);
                    this.onboardingInProgress.set(false);
                    this.redirectToHomeAfterDelay();
                },
            });
    }

    private redirectToHomeAfterDelay(): void {
        this.redirectCountdown.set(3);
        this.redirectTimer = this.ngZone.run(() =>
            setInterval(() => {
                const remaining = this.redirectCountdown() - 1;
                this.redirectCountdown.set(remaining);
                if (remaining <= 0) {
                    if (this.redirectTimer) {
                        clearInterval(this.redirectTimer);
                        this.redirectTimer = null;
                    }
                    this.router.navigate(['/']);
                }
            }, 1000)
        );
    }

    public ngOnDestroy(): void {
        if (this.redirectTimer) {
            clearInterval(this.redirectTimer);
        }
        this.destroy$.next();
        this.destroy$.complete();
    }
}
