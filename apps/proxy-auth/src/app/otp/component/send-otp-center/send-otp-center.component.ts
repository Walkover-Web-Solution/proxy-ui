import { OtpWidgetService } from './../../service/otp-widget.service';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { NgHcaptchaComponent } from 'ng-hcaptcha';
import { FormControl, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { CustomValidators } from '@proxy/custom-validator';
import { BaseComponent } from '@proxy/ui/base-component';
import {
    sendOtpAction,
    getOtpResendAction,
    getOtpVerifyAction,
    resetAll,
    resetAnyState,
} from '../../store/actions/otp.action';
import { IAppState } from '../../store/app.state';
import { BehaviorSubject, filter, interval, Observable, of, Subscription, timer } from 'rxjs';
import {
    closeWidgetApiFailed,
    errors,
    selectApiErrorResponse,
    selectGetOtpInProcess,
    selectGetOtpRes,
    selectGetOtpSuccess,
    selectResendCount,
    selectResendOtpInProcess,
    selectResendOtpSuccess,
    selectVerifyOtpData,
    selectVerifyOtpInProcess,
    selectVerifyOtpSuccess,
    selectWidgetData,
} from '../../store/selectors';
import { isEqual } from 'lodash-es';
import { debounceTime, distinctUntilChanged, skip, take, takeUntil } from 'rxjs/operators';
import { EMAIL_REGEX, EMAIL_OR_MOBILE_REGEX, ONLY_INTEGER_REGEX, PASSWORD_REGEX } from '@proxy/regex';
import { IGetOtpRes, IlogInData, IOtpData, IResetPassword, IWidgetResponse } from '../../model/otp';
import { IntlPhoneLib } from '@proxy/utils';
import { META_TAG_ID } from '@proxy/constant';
import { environment } from 'apps/proxy-auth/src/environments/environment';
import { FeatureServiceIds } from '@proxy/models/features-model';
import { LoginComponentStore } from '../login/login.store';
import { OtpUtilityService } from '../../service/otp-utility.service';

export enum OtpErrorCodes {
    VerifyLimitReached = 704,
    InvalidOtp = 703,
}

export enum SendOtpCenterVersion {
    V1 = 'v1',
    V2 = 'v2',
}

export enum InputFields {
    TOP = 'top',
    BOTTOM = 'bottom',
}
@Component({
    selector: 'proxy-send-otp-center',
    templateUrl: './send-otp-center.component.html',
    styleUrls: ['./send-otp-center.component.scss'],
    providers: [LoginComponentStore],
})
export class SendOtpCenterComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('initContact') initContact: ElementRef;
    @ViewChild(NgHcaptchaComponent) hCaptchaComponent: NgHcaptchaComponent;
    @Input() public referenceId: string;
    @Input() public serviceData: any;
    @Input() public tokenAuth: string;
    @Input() public target: string;
    @Input() public version: SendOtpCenterVersion = SendOtpCenterVersion.V1;
    @Input() public input_fields: string = InputFields.TOP;
    @Input() public show_social_login_icons: boolean = false;
    @Input() public isCreateAccountLink: boolean;
    @Input() public theme: string;
    @Output() public togglePopUp: EventEmitter<any> = new EventEmitter();
    @Output() public successReturn: EventEmitter<any> = new EventEmitter();
    @Output() public failureReturn: EventEmitter<any> = new EventEmitter();
    @Output() public openPopUp: EventEmitter<any> = new EventEmitter();
    @Output() public closePopUp: EventEmitter<any> = new EventEmitter();

    public steps = 1;
    public phoneForm = new UntypedFormGroup({
        phone: new UntypedFormControl('', [Validators.required]),
    });
    public otpControl = new UntypedFormControl(undefined, [
        Validators.required,
        Validators.pattern(ONLY_INTEGER_REGEX),
    ]);
    public emailControl = new UntypedFormControl('', [Validators.required, Validators.pattern(EMAIL_REGEX)]);
    public errors$: Observable<string[]>;

    public selectGetOtpInProcess$: Observable<boolean>;
    public selectGetOtpSuccess$: Observable<boolean>;
    public selectResendOtpInProcess$: Observable<boolean>;
    public selectResendOtpSuccess$: Observable<boolean>;
    public selectVerifyOtpData$: Observable<any>;
    public selectVerifyOtpInProcess$: Observable<boolean>;
    public selectVerifyOtpSuccess$: Observable<boolean>;

    public selectWidgetData$: Observable<any>;
    public selectGetOtpRes$: Observable<IGetOtpRes>;
    public selectResendCount$: Observable<number>;
    public selectApiErrorResponse$: Observable<any>;
    public closeWidgetApiFailed$: Observable<boolean>;

    public otpScriptLoading: BehaviorSubject<boolean> = this.otpWidgetService.scriptLoading;

    public timerSubscription: Subscription;
    public timerSec = 25;
    public timeRemain: number;
    public retryDisable: Observable<boolean> = of(false);
    public retryCount = 0;
    public otpRes: IGetOtpRes;
    public widgetData: IWidgetResponse;

    public sendOTPMode = '1'; // 1 for Mobile, 2 for Email
    public otpPlaceHolder = '•';
    public mobileNumber: string;
    public invalidOtpError: string;
    public retryByVoiceClicked: boolean = false;
    public intlClass: any;
    public displayMobileNumber: string;

    public clickedEvent: any;
    public retryProcesses = [];
    public otpErrorCodes = OtpErrorCodes;
    public featureServiceIds = FeatureServiceIds;

    // Login form properties
    public showPassword: boolean = false;
    public loginStep: number = 1; // 1: Login, 2: Reset Password (send OTP), 3: Change Password
    public loginForm = new FormGroup({
        username: new FormControl<string>(null, [Validators.required]),
        password: new FormControl<string>(null, [Validators.required, CustomValidators.cannotContainSpace]),
    });
    public sendOtpLoginForm = new FormGroup({
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
    public loginError: string = null;
    public isLoginLoading$: Observable<boolean>;
    public state: string;
    private apiError = new BehaviorSubject<any>(null);
    public remainingSeconds: number;
    public resetPasswordTimerSubscription: Subscription;

    // hCaptcha properties
    public hCaptchaToken: string = '';
    public hCaptchaVerified: boolean = false;

    // Login store observables
    public otpData$: Observable<any>;
    public resetPasswordResult$: Observable<any>;

    constructor(
        private store: Store<IAppState>,
        private cdr: ChangeDetectorRef,
        private _elemRef: ElementRef,
        private otpWidgetService: OtpWidgetService,
        private loginComponentStore: LoginComponentStore,
        private otpUtilityService: OtpUtilityService
    ) {
        super();
        this.errors$ = this.store.pipe(select(errors), distinctUntilChanged(isEqual), takeUntil(this.destroy$));
        this.selectGetOtpInProcess$ = this.store.pipe(
            select(selectGetOtpInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectGetOtpSuccess$ = this.store.pipe(
            select(selectGetOtpSuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectResendOtpInProcess$ = this.store.pipe(
            select(selectResendOtpInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectResendOtpSuccess$ = this.store.pipe(
            select(selectResendOtpSuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectVerifyOtpData$ = this.store.pipe(
            select(selectVerifyOtpData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectVerifyOtpInProcess$ = this.store.pipe(
            select(selectVerifyOtpInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectVerifyOtpSuccess$ = this.store.pipe(
            select(selectVerifyOtpSuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectResendCount$ = this.store.pipe(
            select(selectResendCount),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectGetOtpRes$ = this.store.pipe(
            select(selectGetOtpRes),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectApiErrorResponse$ = this.store.pipe(
            select(selectApiErrorResponse),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.closeWidgetApiFailed$ = this.store.pipe(
            select(closeWidgetApiFailed),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectWidgetData$ = this.store.pipe(select(selectWidgetData), takeUntil(this.destroy$));
        this.isLoginLoading$ = this.loginComponentStore.isLoading$;
        this.otpData$ = this.loginComponentStore.otpdata$;
        this.resetPasswordResult$ = this.loginComponentStore.resetPassword$;
    }

    ngOnInit() {
        this.selectGetOtpSuccess$.subscribe((res: boolean) => {
            if (res) {
                this.steps = 2;
                this.localSecTimer();
                this.store.dispatch(
                    resetAnyState({
                        request: { getOtpSuccess: false, errors: null },
                    })
                );
            }
        });
        this.selectResendOtpSuccess$.subscribe((res: boolean) => {
            if (res) {
                this.localSecTimer();
                this.store.dispatch(
                    resetAnyState({
                        request: { resendOtpSuccess: false, errors: null },
                    })
                );
            }
        });
        this.selectVerifyOtpSuccess$.subscribe((res: boolean) => {
            if (res) {
                const data = this.verifyOtpData();
                if (data) {
                    this.returnSuccess(data);
                }
            }
        });
        this.selectApiErrorResponse$.subscribe((res: any) => {
            if (res) {
                this.returnFailure(res);
                this.store.dispatch(resetAnyState({ request: { apiErrorResponse: null } }));
            }
        });
        this.closeWidgetApiFailed$.pipe(debounceTime(700)).subscribe((res) => {
            if (res) {
                this.close();
            }
        });

        this.selectGetOtpRes$.subscribe((res) => {
            this.otpRes = res;
        });

        // Login store subscriptions
        this.selectWidgetData$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res && res.length > 0) {
                const passwordService = res.find(
                    (service) => service.service_id === FeatureServiceIds.PasswordAuthentication
                );
                if (passwordService) {
                    this.state = passwordService.state;
                }
            }
        });

        this.loginComponentStore.apiError$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
            this.apiError.next(error);
            this.loginError = error;
            // Reset hCaptcha on error
            if (error) {
                this.resetHCaptcha();
            }
        });

        this.loginComponentStore.showRegistration$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                const prefillDetails = this.loginForm.get('username').value;
                this.showRegistration(prefillDetails);
            }
        });

        // Forgot password flow subscriptions
        this.otpData$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.changeLoginStep(3);
                this.startResetPasswordTimer();
            }
        });

        this.resetPasswordResult$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.changeLoginStep(1);
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

        // Subscribe to forgot password mode from service
        this.otpWidgetService.forgotPasswordMode.pipe(takeUntil(this.destroy$)).subscribe((mode) => {
            if (mode.active) {
                this.changeLoginStep(2);
                if (mode.prefillEmail) {
                    this.sendOtpLoginForm.get('userDetails').setValue(mode.prefillEmail);
                }
                // Reset the mode after handling
                this.otpWidgetService.closeForgotPassword();
            }
        });
    }

    ngAfterViewInit(): void {
        this.initIntl();
    }

    public initIntl() {
        const parentDom = document.querySelector('proxy-auth')?.shadowRoot;
        const input = document.querySelector('proxy-auth')?.shadowRoot?.getElementById('init-contact');
        const customCssStyleURL = `${environment.baseUrl}/${
            environment.production ? 'app' : 'hello-new'
        }/assets/utils/intl-tel-input-custom.css`;

        if (input) {
            this.intlClass = new IntlPhoneLib(input, parentDom, customCssStyleURL);
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    this.displayEnterNumber();
                }, 100);
            });
            input.addEventListener('countrychange', () => {
                this.displayEnterNumber();
            });
        }
    }

    public displayEnterNumber(): void {
        this.displayMobileNumber = this.intlClass.phoneNumber.includes('+')
            ? this.intlClass.phoneNumber
            : `+${this.intlClass.selectedCountryData?.dialCode}${this.intlClass.phoneNumber}`;
    }

    public sendOtp() {
        this.mobileNumber = this.intlClass.phoneNumber?.slice(1, this.intlClass.phoneNumber.length);
        this.store.dispatch(
            sendOtpAction({
                request: {
                    // variables: {},
                    referenceId: this.referenceId,
                    mobile: this.mobileNumber,
                },
            })
        );
    }

    // public retryOtp(channel: string = null) {
    //     if (this.sendOTPMode === '2' && !this.mobileNumber) {
    //         this.retryByVoiceClicked = true;
    //         setTimeout(() => {
    //             this.initIntl();
    //         }, 100);
    //         return;
    //     }
    //     this.retryOtpByCall(channel);
    // }

    public retryOtp(channel: string = null) {
        if (this.retryCount < 2) {
            this.retryCount += 1;
            this.store.dispatch(
                getOtpResendAction({
                    request: {
                        tokenAuth: this.tokenAuth,
                        referenceId: this.referenceId,
                        reqId: this.otpRes.reqId,
                        retryChannel: channel,
                    },
                })
            );
        }
    }

    public verifyOtp() {
        this.store.dispatch(
            getOtpVerifyAction({
                request: {
                    tokenAuth: this.tokenAuth,
                    otp: this.otpControl.value,
                    referenceId: this.referenceId,
                    reqId: this.otpRes.reqId,
                    // identifier: this.sendOTPMode === '1' ? this.mobileNumber : this.emailControl.value,
                },
            })
        );
        this.selectApiErrorResponse$.pipe(skip(1), take(1)).subscribe((res: any) => {
            if (res) {
                this.invalidOtpError = res.message;
                this.cdr.detectChanges();
            }
        });
    }

    public close(closeByUser: boolean = false) {
        document.getElementById(META_TAG_ID)?.remove();
        this.resetStore();
        this.togglePopUp.emit();
        this.timeRemain = 0;
        if (closeByUser) {
            this.failureReturn.emit({
                code: 0, // code use for close by user
                closeByUser, // boolean value for status
                message: 'User cancelled the verification process.',
            });
        }
    }

    public resetStore(): void {
        this.store.dispatch(resetAll());
    }

    public returnSuccess(successResponse: any) {
        this.successReturn.emit(successResponse);
        this.close();
    }

    public returnFailure(failureResponse: any) {
        this.failureReturn.emit(failureResponse);
    }

    public verifyOtpData() {
        let data = null;
        this.selectVerifyOtpData$.pipe(take(1)).subscribe((res: any) => {
            data = res;
        });
        return data;
    }

    public localSecTimer(): void {
        this.retryDisable = of(true);
        const source = timer(1000, 1000);
        this.timerSubscription = source.pipe(takeUntil(this.destroy$)).subscribe((val) => {
            this.timeRemain = this.timerSec - val;
            if (this.timeRemain === this.timerSec) {
                this.retryDisable = of(false);
            }
            if (this.timeRemain === 0) {
                this.destroyTimerSubscription();
            }
            this.cdr.detectChanges();
        });
    }

    public destroyTimerSubscription(): void {
        this.timerSubscription.unsubscribe();
    }

    private openLink(link: string): void {
        window.open(link, this.target);
    }

    public onVerificationBtnClick(widgetData: any): void {
        if (widgetData?.urlLink) {
            this.openLink(widgetData?.urlLink);
        } else if (widgetData?.service_id === FeatureServiceIds.Msg91OtpService) {
            this.otpWidgetService.openWidget();
        } else if (widgetData?.service_id === FeatureServiceIds.PasswordAuthentication) {
            if (this.version === SendOtpCenterVersion.V2) {
                this.login();
            } else {
                this.otpWidgetService.openLogin(true);
            }
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

    public login(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        if (!this.hCaptchaVerified) {
            this.loginError = 'Please complete the hCaptcha verification';
            return;
        }

        this.loginError = null;

        const encodedPassword = this.encryptPassword(this.loginForm.get('password').value);
        const loginData: IlogInData = {
            'state': this.state,
            'user': this.loginForm.get('username').value?.replace(/^\+/, ''),
            'password': encodedPassword,
            'hCaptchaToken': this.hCaptchaToken,
        };

        this.loginComponentStore.loginData(loginData);
    }

    // hCaptcha event handlers
    public onHCaptchaVerify(token: string): void {
        this.hCaptchaToken = token;
        this.hCaptchaVerified = true;
    }

    public onHCaptchaExpired(): void {
        this.hCaptchaToken = '';
        this.hCaptchaVerified = false;
    }

    public onHCaptchaError(error: any): void {
        this.hCaptchaToken = '';
        this.hCaptchaVerified = false;
        console.error('hCaptcha error:', error);
    }

    public resetHCaptcha(): void {
        this.hCaptchaToken = '';
        this.hCaptchaVerified = false;
        if (this.hCaptchaComponent) {
            this.hCaptchaComponent.reset();
        }
    }

    public showRegistration(prefillDetails?: string) {
        this.openPopUp.emit(prefillDetails || this.loginForm.get('username')?.value);
    }

    public hasOtherAuthOptions(widgetDataArray: any[]): boolean {
        if (!widgetDataArray) return false;
        return widgetDataArray.some((widget) => widget?.service_id !== this.featureServiceIds.PasswordAuthentication);
    }

    public forgotPassword(): void {
        this.changeLoginStep(2);
    }

    public changeLoginStep(nextStep: number): void {
        this.apiError.next(null);
        this.loginError = null;
        this.loginStep = nextStep;
        // Reset hCaptcha when changing steps
        this.resetHCaptcha();
    }

    public sendResetPasswordOtp(): void {
        if (this.sendOtpLoginForm.invalid) {
            this.sendOtpLoginForm.markAllAsTouched();
            return;
        }
        const emailData: IResetPassword = {
            'state': this.state,
            'user': this.sendOtpLoginForm.get('userDetails').value,
        };
        this.loginComponentStore.resetPassword(emailData);
    }

    public verifyResetPasswordOtp(): void {
        if (this.resetPasswordForm.invalid) {
            this.resetPasswordForm.markAllAsTouched();
            return;
        }
        const encodedPassword = this.encryptPassword(this.resetPasswordForm.get('password').value);
        const verifyOtpData: IOtpData = {
            'state': this.state,
            'user': this.sendOtpLoginForm.get('userDetails').value,
            'password': encodedPassword,
            'otp': this.resetPasswordForm.get('otp').value,
        };
        this.loginComponentStore.verfyPasswordOtp(verifyOtpData);
    }

    private startResetPasswordTimer(): void {
        this.remainingSeconds = 15;
        this.resetPasswordTimerSubscription = interval(1000).subscribe(() => {
            if (this.remainingSeconds > 0) {
                this.remainingSeconds--;
            } else {
                this.resetPasswordTimerSubscription.unsubscribe();
            }
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        if (this.resetPasswordTimerSubscription) {
            this.resetPasswordTimerSubscription.unsubscribe();
        }
    }
}
