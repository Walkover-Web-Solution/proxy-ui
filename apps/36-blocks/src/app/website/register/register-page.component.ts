import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '@proxy/custom-validator';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import * as registrationActions from '../home/ngrx/actions/registration.action';
import {
    selectRegistrationInProgress,
    selectRegistrationSuccess,
    selectRegistrationErrors,
    selectRegisteredEmail,
} from '../home/ngrx/selector/registration.selector';

export interface PasswordRule {
    key: string;
    label: string;
    met: boolean;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-register-page',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './register-page.component.html',
    styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent implements OnInit, OnDestroy {
    private readonly store = inject(Store);

    public readonly registrationInProgress = toSignal(this.store.select(selectRegistrationInProgress), {
        initialValue: false,
    });
    public readonly registrationSuccess = toSignal(this.store.select(selectRegistrationSuccess), {
        initialValue: false,
    });
    public readonly registrationErrors = toSignal(this.store.select(selectRegistrationErrors), {
        initialValue: [] as string[],
    });
    public readonly registeredEmail = toSignal(this.store.select(selectRegisteredEmail), {
        initialValue: null as string | null,
    });

    public readonly registrationFormGroup = new FormGroup({
        email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
        password: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, CustomValidators.passwordStrength()],
        }),
    });

    public passwordVisible = false;

    public ngOnInit(): void {
        this.store.dispatch(registrationActions.registrationResetAction());
    }

    public ngOnDestroy(): void {
        this.store.dispatch(registrationActions.registrationResetAction());
    }

    public togglePasswordVisibility(): void {
        this.passwordVisible = !this.passwordVisible;
    }

    public get passwordRules(): PasswordRule[] {
        const control = this.registrationFormGroup.get('password');
        const value: string = control?.value ?? '';
        return [
            { key: 'minLength', label: 'At least 8 characters', met: value.length >= 8 },
            { key: 'uppercase', label: 'At least one uppercase letter (A–Z)', met: /[A-Z]/.test(value) },
            { key: 'lowercase', label: 'At least one lowercase letter (a–z)', met: /[a-z]/.test(value) },
            { key: 'number', label: 'At least one number (0–9)', met: /[0-9]/.test(value) },
            { key: 'symbol', label: 'At least one symbol (!@#$…)', met: /[^A-Za-z0-9]/.test(value) },
        ];
    }

    public getFieldError(fieldName: string): string | null {
        const control = this.registrationFormGroup.get(fieldName);
        if (!control || !control.invalid || !control.touched) {
            return null;
        }
        if (control.errors?.['required']) {
            return 'This field is required.';
        }
        if (control.errors?.['email']) {
            return 'Please enter a valid email address.';
        }
        return null;
    }

    public submitRegistration(): void {
        if (this.registrationFormGroup.invalid) {
            this.registrationFormGroup.markAllAsTouched();
            return;
        }
        const formValue = this.registrationFormGroup.getRawValue();
        this.store.dispatch(
            registrationActions.registrationSubmitAction({
                payload: {
                    email: formValue.email,
                    password: formValue.password,
                },
            })
        );
    }
}
