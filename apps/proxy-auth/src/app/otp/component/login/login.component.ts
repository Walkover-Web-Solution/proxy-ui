import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LoginComponentStore } from './login.store';
import { BehaviorSubject, filter, Observable, takeUntil } from 'rxjs';
import { IAppState } from '../../store/app.state';
import { select, Store } from '@ngrx/store';
import { selectWidgetData } from '../../store/selectors';
import { BaseComponent } from '@proxy/ui/base-component';
import { FeatureServiceIds } from '@proxy/models/features-model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IlogInData, IOtpData, IResetPassword } from '../../model/otp';
import { EMAIL_OR_MOBILE_REGEX, EMAIL_REGEX, PASSWORD_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { META_TAG_ID } from '@proxy/constant';

@Component({
    selector: 'proxy-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: [LoginComponentStore],
})
export class LoginComponent extends BaseComponent implements OnInit {
    @Output() public togglePopUp: EventEmitter<any> = new EventEmitter();
    @Output() public closePopUp: EventEmitter<any> = new EventEmitter();
    @Output() public openPopUp: EventEmitter<any> = new EventEmitter();
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
        password: new FormControl<string>(null, [Validators.required, CustomValidators.cannotContainSpace]),
    });
    public sendOtpForm = new FormGroup({
        userDetails: new FormControl<string>(null, [Validators.required, Validators.pattern(EMAIL_OR_MOBILE_REGEX)]),
    });
    public resetPasswordForm = new FormGroup({
        otp: new FormControl<number>(null, Validators.required),

        password: new FormControl<string>(null, [
            Validators.required,
            Validators.pattern(PASSWORD_REGEX),
            Validators.minLength(8),
        ]),
        confirmPassword: new FormControl<string>(null, [
            Validators.required,
            Validators.minLength(8),
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
                this.changeStep(3);
            }
        });
        this.resetPassword$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.changeStep(1);
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
        this.componentStore.showRegistration$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.showRegistration();
            }
        });
    }

    public changeStep(nextStep: number) {
        this.apiError.next(null);
        this.step = nextStep;
        if (this.step === 0) {
            this.closePopUp.emit();
        }
    }
    public showRegistration() {
        this.openPopUp.emit();
    }
    public close(closeByUser: boolean = false): void {
        // document.getElementById(META_TAG_ID)?.remove();

        this.togglePopUp.emit();

        if (closeByUser) {
            this.failureReturn.emit({
                code: 0, // code use for close by user
                closeByUser, // boolean value for status
                message: 'User cancelled the login process.',
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
