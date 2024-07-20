import { Component, OnInit } from '@angular/core';
import { LoginComponentStore } from './login.store';
import { Observable, takeUntil } from 'rxjs';
import { IAppState } from '../../store/app.state';
import { select, Store } from '@ngrx/store';
import { selectWidgetData } from '../../store/selectors';
import { BaseComponent } from '@proxy/ui/base-component';
import { FeatureServiceIds } from '@proxy/models/features-model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IlogInData, IOtpData, IResetPassword } from '../../model/otp';
import { EMAIL_REGEX, PASSWORD_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';

@Component({
    selector: 'proxy-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: [LoginComponentStore],
})
export class LoginComponent extends BaseComponent implements OnInit {
    public state: string;
    public step: number = 1;
    public selectWidgetData$: Observable<any>;
    public otpData$: Observable<any> = this.componentStore.otpdata$;
    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public resetPassword$: Observable<any> = this.componentStore.resetPassword$;
    public apiError$: Observable<any> = this.componentStore.apiError$;
    public loginForm = new FormGroup({
        username: new FormControl<string>(null, [Validators.required, Validators.pattern(EMAIL_REGEX)]),
        password: new FormControl<string>(null, [Validators.required]),
    });
    public sendOtpForm = new FormGroup({
        userDetails: new FormControl<string>(null, [Validators.required]),
    });
    public resetPasswordForm = new FormGroup({
        otp: new FormControl<number>(null, Validators.required),

        password: new FormControl<string>(null, [Validators.required, Validators.pattern(PASSWORD_REGEX)]),
        confirmPassword: new FormControl<string>(null, [
            Validators.required,
            Validators.pattern(PASSWORD_REGEX),
            CustomValidators.valueSameAsControl('password'),
        ]),
    });

    constructor(private componentStore: LoginComponentStore, private store: Store<IAppState>) {
        super();
        this.selectWidgetData$ = this.store.pipe(select(selectWidgetData), takeUntil(this.destroy$));
    }

    ngOnInit(): void {
        this.selectWidgetData$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            this.state = res.find((service) => service.service_id === FeatureServiceIds.PasswordAuthentication).state;
        });
        this.otpData$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.step = 3;
            }
        });
        this.resetPassword$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.step = 1;
            }
        });
        this.resetPasswordForm
            .get('password')
            .valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.resetPasswordForm.get('confirmPassword').updateValueAndValidity();
                }
            });
    }

    public login() {
        const loginData: IlogInData = {
            'state': this.state,
            'user': this.loginForm.get('username').value,
            'password': this.loginForm.get('password').value,
        };

        this.componentStore.loginData(loginData);
    }
    public resetPassword() {
        this.step = 2;
    }
    public sendOtp() {
        const emailData: IResetPassword = {
            'state': this.state,
            'user': this.sendOtpForm.get('userDetails').value,
        };

        this.componentStore.resetPassword(emailData);
    }
    public verfiyOtp() {
        const verfyOtpData: IOtpData = {
            'state': this.state,
            'user': this.sendOtpForm.get('userDetails').value,
            'password': this.resetPasswordForm.get('password').value,
            'otp': this.resetPasswordForm.get('otp').value,
        };
        this.componentStore.verfyPasswordOtp(verfyOtpData);
    }
}
