import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LoginComponentStore } from './login.store';
import { BehaviorSubject, Observable, takeUntil } from 'rxjs';
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
    @Output() public togglePopUp: EventEmitter<any> = new EventEmitter();
    @Output() public failureReturn: EventEmitter<any> = new EventEmitter();
    public state: string;
    public step: number = 3;
    public selectWidgetData$: Observable<any>;
    private apiError = new BehaviorSubject<any>(null);
    public otpData$: Observable<any> = this.componentStore.otpdata$;
    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public resetPassword$: Observable<any> = this.componentStore.resetPassword$;
    public loginForm = new FormGroup({
        username: new FormControl<string>(null, [Validators.required, Validators.pattern(EMAIL_REGEX)]),
        password: new FormControl<string>(null, [Validators.required, Validators.pattern(PASSWORD_REGEX)]),
    });
    public sendOtpForm = new FormGroup({
        userDetails: new FormControl<string>(null, [Validators.required, CustomValidators.noWhitespaceValidator]),
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
                this.apiError.next(null);
            }
        });
        this.resetPassword$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.step = 1;
                this.apiError.next(null);
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
        this.componentStore.apiError$.subscribe((error) => {
            this.apiError.next(error);
        });
    }
    public backToLogin() {
        this.step = 1;
        this.apiError.next(null);
    }
    public close(closeByUser: boolean = false): void {
        this.togglePopUp.emit();
        if (closeByUser) {
            this.failureReturn.emit({
                code: 0,
                closeByUser,
                message: 'User cancelled the login  process.',
            });
        }
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
        this.apiError.next(null);
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
