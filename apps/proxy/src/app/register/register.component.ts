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
import { UsersService } from '@proxy/services/proxy/users';
import { IntlPhoneLib } from '@proxy/utils';

@Component({
    selector: 'app-register-component',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent extends BaseComponent implements OnDestroy, OnInit {
    public registrationForm = new FormGroup({
        user: new FormGroup({
            fname: new FormControl<string>(null, [
                Validators.required,
                Validators.pattern(NAME_REGEX),
                Validators.minLength(3),
                Validators.maxLength(24),
            ]),
            lname: new FormControl<string>(null, [
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
            mobile: new FormControl<string>(null, [Validators.required]),
            password: new FormControl<string>(null, [Validators.required, Validators.pattern(PASSWORD_REGEX)]),
            confirmPassword: new FormControl<string>(null, [
                Validators.required,
                Validators.pattern(PASSWORD_REGEX),
                CustomValidators.valueSameAsControl('password'),
            ]),
        }),
    });
    public intlClass: { [key: string]: IntlPhoneLib } = {};
    constructor(private store: Store<IAppState>, private service: UsersService, private toast: PrimeNgToastService) {
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
    ngAfterViewInit(): void {
        this.initIntl('user');
        let count = 0;
    }
    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }
    public initIntl(key: string): void {
        const parentDom = document.querySelector('proxy-root');
        const input = document.getElementById('init-contact-' + key);
        const customCssStyleURL = `${environment.baseUrl}/assets/utils/intl-tel-input-custom.css`;
        if (input) {
            this.intlClass[key] = new IntlPhoneLib(input, parentDom, customCssStyleURL);
        }
    }

    get f() {
        return this.registrationForm.controls;
    }

    // Submit method to handle form submission
    submit() {
        if (this.registrationForm.valid) {
            const formData = this.registrationForm.value;

            // HTTP POST request to your API endpoint

            const url = `${environment.baseUrl}/register`;
            this.service.register(url, formData).subscribe(
                (response) => {
                    this.toast.success('Registration success');
                },
                (error) => {
                    this.toast.error(error);
                }
            );
        } else {
            // Mark all fields as touched to display validation errors
            this.registrationForm.markAllAsTouched();
        }
    }
}
