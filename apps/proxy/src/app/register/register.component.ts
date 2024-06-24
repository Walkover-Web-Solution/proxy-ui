import { environment } from '../../environments/environment';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import { Store } from '@ngrx/store';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { EMAIL_REGEX, MOBILE_NUMBER_REGEX, NAME_REGEX, PASSWORD_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { IAppState } from '../ngrx/store/app.state';
import { HttpClient } from '@angular/common/http';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';

@Component({
    selector: 'app-register-component',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent extends BaseComponent implements OnDestroy, OnInit {
    public FormData: any;
    public registrationForm = new FormGroup({
        user: new FormGroup({
            firstName: new FormControl<string>(null, [
                Validators.required,
                Validators.pattern(NAME_REGEX),
                Validators.minLength(3),
                Validators.maxLength(24),
            ]),
            lastName: new FormControl<string>(null, [
                Validators.pattern(NAME_REGEX),
                Validators.minLength(3),
                Validators.maxLength(25),
            ]),
            username: new FormControl<string>(null, [
                Validators.required,
                Validators.pattern(NAME_REGEX),
                Validators.minLength(3),
                Validators.maxLength(24),
            ]),
            email: new FormControl<string>(null, [Validators.required, Validators.pattern(EMAIL_REGEX)]),
            mobile: new FormControl<string>(null, [Validators.required, Validators.pattern(MOBILE_NUMBER_REGEX)]),
            password: new FormControl<string>(null, [Validators.required, Validators.pattern(PASSWORD_REGEX)]),
            confirmPassword: new FormControl<string>(null, [
                Validators.required,
                Validators.pattern(PASSWORD_REGEX),
                CustomValidators.valueSameAsControl('password'),
            ]),
        }),
    });
    public apiError = new BehaviorSubject<string[]>(null);
    constructor(private store: Store<IAppState>, private http: HttpClient, private toast: PrimeNgToastService) {
        super();
    }

    ngOnInit(): void {
        this.registrationForm
            .get('user.password')
            .valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.registrationForm.get('user.confirmPassword').updateValueAndValidity();
                }
            });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    get f() {
        return this.registrationForm.controls;
    }

    // Submit method to handle form submission
    submit() {
        if (this.registrationForm.valid) {
            const formData = this.registrationForm.value;
            console.log('Form Data:', formData);
            this.FormData = {
                user: {
                    fname: formData.user.firstName, // Map firstName to fname
                    lname: formData.user.lastName, // Map lastName to lname
                    email: formData.user.email,
                    mobile: formData.user.mobile,
                    username: formData.user.username,
                    password: formData.user.password,
                    confirmPassword: formData.user.confirmPassword,
                },
            };

            // HTTP POST request to your API endpoint
            this.http.post(`${environment.baseUrl}/register`, this.FormData).subscribe(
                (response) => {
                    this.toast.success('Regitration success');
                },
                (error) => {
                    this.toast.error(error);
                    this.apiError = error;
                }
            );
        } else {
            // Mark all fields as touched to display validation errors
            this.registrationForm.markAllAsTouched();
        }
    }
}
