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
    public loginForm = new FormGroup({
        username: new FormControl<string>(null, [Validators.required, Validators.email]),
        password: new FormControl<string>(null, [Validators.required]),
    });
    public emailForm = new FormGroup({
        email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
    });
    public resetPasswordForm = new FormGroup({
        email: new FormControl<string | null>({ value: null, disabled: true }, [Validators.required, Validators.email]),
        otp: new FormControl<number>(null, Validators.required),
        password: new FormControl<string | null>(null, [Validators.required]),
        confirmPassword: new FormControl<string | null>(null, [Validators.required]),
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
    }

    public login() {
        if (this.loginForm.valid) {
            const loginData: IlogInData = {
                'state': this.state,
                'user': this.loginForm.get('username').value,
                'password': this.loginForm.get('password').value,
            };

            this.componentStore.loginData(loginData);
        }
    }
    public resetPassword() {
        this.step = 2;
    }
    public sendOtp() {
        if (this.emailForm.valid) {
            const emailData: IResetPassword = {
                'state': this.state,
                'user': this.emailForm.get('email').value,
            };

            this.componentStore.resetPassword(emailData);
        }
    }
    public verfiyOtp() {
        if (this.resetPasswordForm.valid) {
            const verfyOtpData: IOtpData = {
                'state': this.state,
                'user': this.emailForm.get('email').value,
                'password': this.resetPasswordForm.get('password').value,
                'otp': this.resetPasswordForm.get('otp').value,
            };
            this.componentStore.verfyPasswordOtp(verfyOtpData);
        }
    }
}
