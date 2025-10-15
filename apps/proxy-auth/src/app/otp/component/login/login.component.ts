import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { LoginComponentStore } from './login.store';
import { BehaviorSubject, filter, interval, Observable, Subscription, takeUntil } from 'rxjs';
import { IAppState } from '../../store/app.state';
import { select, Store } from '@ngrx/store';
import { selectWidgetData } from '../../store/selectors';
import { BaseComponent } from '@proxy/ui/base-component';
import { FeatureServiceIds } from '@proxy/models/features-model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IlogInData, IOtpData, IResetPassword } from '../../model/otp';
import { EMAIL_OR_MOBILE_REGEX, PASSWORD_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { META_TAG_ID } from '@proxy/constant';
import { environment } from 'apps/proxy-auth/src/environments/environment';
import { OtpUtilityService } from '../../service/otp-utility.service';
import { NgHcaptchaComponent } from 'ng-hcaptcha';

@Component({
    selector: 'proxy-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: [LoginComponentStore],
})
export class LoginComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() public loginServiceData: any;
    @Output() public togglePopUp: EventEmitter<any> = new EventEmitter();
    @Output() public closePopUp: EventEmitter<any> = new EventEmitter();
    @Output() public openPopUp: EventEmitter<any> = new EventEmitter();
    @Output() public failureReturn: EventEmitter<any> = new EventEmitter();
    public state: string;
    public step: number = 1;
    public showPassword: boolean = false;
    public remainingSeconds: number;
    public timerSubscription: Subscription;
    public selectWidgetData$: Observable<any>;
    private apiError = new BehaviorSubject<any>(null);
    public hCaptchaToken: string = '';
    public hCaptchaVerified: boolean = false;
    @ViewChild(NgHcaptchaComponent) hCaptchaComponent: NgHcaptchaComponent;
    public otpData$: Observable<any> = this.componentStore.otpdata$;
    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public resetPassword$: Observable<any> = this.componentStore.resetPassword$;
    public prefillDetails: string;
    public loginForm = new FormGroup({
        username: new FormControl<string>(null, [Validators.required]),
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

    constructor(
        private componentStore: LoginComponentStore,
        private store: Store<IAppState>,
        private otpUtilityService: OtpUtilityService
    ) {
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
                this.startTimer();
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
            // Reset hCaptcha on error
            if (error) {
                this.hCaptchaToken = '';
                this.hCaptchaVerified = false;
                if (this.hCaptchaComponent) {
                    this.hCaptchaComponent.reset();
                }
            }
        });
        this.componentStore.showRegistration$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.prefillDetails = this.loginForm.get('username').value;
                this.showRegistration(this.prefillDetails);
            }
        });
    }

    public changeStep(nextStep: number) {
        this.apiError.next(null);
        this.step = nextStep;
        // Reset hCaptcha when changing steps
        this.hCaptchaToken = '';
        this.hCaptchaVerified = false;
        if (this.step === 0) {
            this.closePopUp.emit();
        }
    }
    public showRegistration(prefillDetails: string) {
        this.openPopUp.emit(prefillDetails);
    }
    public close(closeByUser: boolean = false): void {
        document.getElementById(META_TAG_ID)?.remove();

        this.togglePopUp.emit();

        if (closeByUser) {
            this.failureReturn.emit({
                code: 0, // code use for close by user
                closeByUser, // boolean value for status
                message: 'User cancelled the login process.',
            });
        }
    }
    public encryptPassword(password: string): string {
        return this.otpUtilityService.aesEncrypt(
            JSON.stringify(password),
            environment.uiEncodeKey,
            environment.uiIvKey,
            true
        );
    }

    public login() {
        if (!this.hCaptchaVerified) {
            this.apiError.next('Please complete the hCaptcha verification');
            return;
        }

        const encodedPassword = this.encryptPassword(this.loginForm.get('password').value);
        const loginData: IlogInData = {
            'state': this.state,
            'user': this.loginForm.get('username').value?.replace(/^\+/, ''),
            'password': encodedPassword,
            'hCaptchaToken': this.hCaptchaToken, // Include hCaptcha token in login data
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
        const encodedPassword = this.encryptPassword(this.resetPasswordForm.get('password').value);
        const verfyOtpData: IOtpData = {
            'state': this.state,
            'user': this.sendOtpForm.get('userDetails').value,
            'password': encodedPassword,
            'otp': this.resetPasswordForm.get('otp').value,
        };
        this.componentStore.verfyPasswordOtp(verfyOtpData);
    }

    // hCaptcha event handlers
    public onHCaptchaVerify(token: string) {
        this.hCaptchaToken = token;
        this.hCaptchaVerified = true;
    }

    public onHCaptchaExpired() {
        this.hCaptchaToken = '';
        this.hCaptchaVerified = false;
    }

    public onHCaptchaError(error: any) {
        this.hCaptchaToken = '';
        this.hCaptchaVerified = false;
        console.error('hCaptcha error:', error);
    }
    private startTimer() {
        this.remainingSeconds = 15;
        this.timerSubscription = interval(1000).subscribe(() => {
            if (this.remainingSeconds > 0) {
                this.remainingSeconds--;
            } else {
                this.timerSubscription.unsubscribe();
            }
        });
    }
    ngOnDestroy(): void {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }
}
