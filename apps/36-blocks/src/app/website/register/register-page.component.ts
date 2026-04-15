import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import * as logInActions from '../home/ngrx/actions/login.action';
import * as registrationActions from '../home/ngrx/actions/registration.action';
import {
    selectRegistrationInProgress,
    selectRegistrationSuccess,
    selectRegistrationErrors,
    selectRegisteredEmail,
} from '../home/ngrx/selector/registration.selector';

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
        firstName: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(2)],
        }),
        lastName: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(2)],
        }),
        email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
        mobile: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/^\d{10,15}$/)],
        }),
        username: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9]+$/)],
        }),
        password: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(8)],
        }),
        organizationName: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(2)],
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
        if (control.errors?.['minlength']) {
            const requiredLength = control.errors['minlength'].requiredLength;
            return `Must be at least ${requiredLength} characters.`;
        }
        if (control.errors?.['pattern']) {
            if (fieldName === 'mobile') {
                return 'Please enter a valid mobile number (10–15 digits).';
            }
            if (fieldName === 'username') {
                return 'Only letters and numbers are allowed.';
            }
        }
        return 'Invalid value.';
    }

    public login(): void {
        this.store.dispatch(logInActions.logInAction());
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
                    user: {
                        fname: formValue.firstName,
                        lname: formValue.lastName,
                        email: formValue.email,
                        mobile: formValue.mobile,
                        username: formValue.username,
                        password: formValue.password,
                    },
                    client: {
                        name: formValue.organizationName,
                    },
                },
            })
        );
    }
}
