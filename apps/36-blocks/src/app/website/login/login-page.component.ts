import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    ViewChild,
    inject,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as logInActions from '../home/ngrx/actions/login.action';
import { GoogleOneTapService } from './google-one-tap.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-login-page',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);
    private readonly router = inject(Router);
    private readonly googleOneTapService = inject(GoogleOneTapService);
    private readonly destroy$ = new Subject<void>();

    @ViewChild('googleButtonContainer') private readonly googleButtonContainer!: ElementRef<HTMLDivElement>;

    public readonly loginInProgress = signal<boolean>(false);
    public readonly googleLoginInProgress = signal<boolean>(false);
    public readonly loginErrors = signal<string[]>([]);
    public passwordVisible = false;

    public readonly loginFormGroup = new FormGroup({
        email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
        password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    });

    public ngOnInit(): void {
        // GIS script is lazy-loaded here — only fetched when the user visits /login, not on every page
        // TODO (pending): GIS One Tap initialization — active only when googleClientId is set in env-variables.ts
        // When active: intercepts Google credential here instead of going through Firebase popup
        this.googleOneTapService.loadScript().then(() => {
            this.googleOneTapService.initialize((credentialResponse) => {
                this.googleLoginInProgress.set(true);
                this.loginErrors.set([]);
                this.store.dispatch(logInActions.googleOneTapCredential({ idToken: credentialResponse.credential }));
            });
        });

        this.actions$
            .pipe(ofType(logInActions.emailLoginOnboardingPending), takeUntil(this.destroy$))
            .subscribe(({ pendingJwtToken }) => {
                this.loginInProgress.set(false);
                this.router.navigate(['/onboarding'], { queryParams: { onboarding_token: pendingJwtToken } });
            });

        this.actions$.pipe(ofType(logInActions.emailLoginSuccess), takeUntil(this.destroy$)).subscribe(() => {
            this.loginInProgress.set(false);
            this.store.dispatch(logInActions.getUserAction());
        });

        this.actions$.pipe(ofType(logInActions.logInActionComplete), takeUntil(this.destroy$)).subscribe(() => {
            this.googleLoginInProgress.set(false);
        });

        this.actions$.pipe(ofType(logInActions.logInActionError), takeUntil(this.destroy$)).subscribe(({ errors }) => {
            this.loginInProgress.set(false);
            this.googleLoginInProgress.set(false);
            this.loginErrors.set(errors);
        });
    }

    public ngAfterViewInit(): void {
        // TODO (pending): GIS rendered button — shows personalized "Continue as user@gmail.com"
        // Only renders when googleClientId is set in env-variables.ts; falls back to manual button below
        if (this.googleButtonContainer?.nativeElement) {
            this.googleOneTapService.renderButton(this.googleButtonContainer.nativeElement);
        }
        this.googleOneTapService.prompt();
    }

    public ngOnDestroy(): void {
        this.googleOneTapService.cancel();
        this.destroy$.next();
        this.destroy$.complete();
    }

    public togglePasswordVisibility(): void {
        this.passwordVisible = !this.passwordVisible;
    }

    public getFieldError(fieldName: string): string | null {
        const control = this.loginFormGroup.get(fieldName);
        if (!control || !control.invalid || !control.touched) {
            return null;
        }
        if (control.errors?.['required']) {
            return 'This field is required.';
        }
        if (control.errors?.['email']) {
            return 'Please enter a valid email address.';
        }
        return 'Invalid value.';
    }

    public submitLogin(): void {
        if (this.loginFormGroup.invalid) {
            this.loginFormGroup.markAllAsTouched();
            return;
        }
        this.loginErrors.set([]);
        this.loginInProgress.set(true);
        const formValue = this.loginFormGroup.getRawValue();
        this.store.dispatch(logInActions.emailLoginAction({ email: formValue.email, password: formValue.password }));
    }

    public loginWithGoogle(): void {
        this.loginErrors.set([]);
        this.googleLoginInProgress.set(true);
        this.store.dispatch(logInActions.logInAction());
    }

    // TODO (pending): Switch Google button to GIS rendered version once googleClientId is configured
    // When true: shows native Google button with personalized email ("Continue as user@gmail.com")
    // When false: falls back to standard Firebase popup login button
    public get isGisAvailable(): boolean {
        return this.googleOneTapService.isAvailable();
    }
}
