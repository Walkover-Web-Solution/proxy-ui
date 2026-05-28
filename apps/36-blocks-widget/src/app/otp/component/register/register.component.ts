import { cloneDeep } from 'lodash-es';
import { WidgetTheme } from '@proxy/constant';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OtpService } from './../../service/otp.service';
import { environment } from './../../../../environments/environment';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ElementRef,
    computed,
    effect,
    inject,
    input,
    output,
} from '@angular/core';
import { resetAll, resetAnyState, sendOtpAction, verifyOtpAction } from '../../store/actions/otp.action';
import { BaseComponent } from '@proxy/ui/base-component';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../../store/app.state';
import { IntlPhoneLib, removeEmptyKeys } from '@proxy/utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { isEqual } from 'lodash-es';
import { EMAIL_REGEX, NAME_REGEX, PASSWORD_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { OtpUtilityService } from '../../service/otp-utility.service';
import { WidgetThemeService } from '../../service/widget-theme.service';
import { errorResolver } from '@proxy/models/root-models';
import { BehaviorSubject, distinctUntilChanged, Observable, takeUntil, interval, Subscription } from 'rxjs';
import {
    selectGetOtpRes,
    selectGetOtpInProcess,
    selectGetOtpSuccess,
    selectVerifyOtpV2Data,
    selectVerifyOtpV2InProcess,
    selectVerifyOtpV2Success,
    selectApiErrorResponse,
    selectWidgetTheme,
} from '../../store/selectors';
import { IGetOtpRes } from '../../model/otp';

type OtpChannel = 'mobile' | 'email';

@Component({
    selector: 'proxy-register',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent extends BaseComponent implements AfterViewInit, OnDestroy, OnInit {
    public referenceId = input<string>();
    public serviceData = input<any>();
    public loginServiceData = input<any>();
    public registrationViaLogin = input<boolean>();
    public prefillDetails = input<any>();
    public showCompanyDetails = input<boolean>(true);
    public version = input<string>('v1');
    public theme = input<string>();
    protected readonly WidgetTheme = WidgetTheme;
    public firstName = input<string>();
    public lastName = input<string>();
    public email = input<string>();
    public signupServiceId = input<string | number>();
    public isRegisterFormOnly = input<boolean>(false);
    public showPassword: boolean = false;
    public showConfirmPassword: boolean = false;
    public togglePopUp = output<void>();
    public successReturn = output<any>();
    public failureReturn = output<any>();

    get showCompanyDetail(): boolean {
        return this.showCompanyDetails() !== false;
    }

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
            email: new FormControl<string>(null, [Validators.required, Validators.pattern(EMAIL_REGEX)]),
            mobile: new FormControl<string>(null, [Validators.required]),
            password: new FormControl<string>(null, [
                Validators.required,
                Validators.pattern(PASSWORD_REGEX),
                Validators.maxLength(15),
            ]),
            confirmPassword: new FormControl<string>(null, [
                Validators.required,
                Validators.pattern(PASSWORD_REGEX),
                Validators.maxLength(15),
                CustomValidators.valueSameAsControl('password'),
            ]),
        }),
        company: new FormGroup({
            name: new FormControl<string>(null, [Validators.minLength(3), Validators.maxLength(50)]),
            mobile: new FormControl<string>(null),
            email: new FormControl<string>(null, Validators.pattern(EMAIL_REGEX)),
        }),
    });
    public otpForm = new FormGroup({
        otp1: new FormControl<string>(''),
        otp2: new FormControl<string>(''),
        otp3: new FormControl<string>(''),
        otp4: new FormControl<string>(''),
    });
    public emailOtpForm = new FormGroup({
        otp1: new FormControl<string>(''),
        otp2: new FormControl<string>(''),
        otp3: new FormControl<string>(''),
        otp4: new FormControl<string>(''),
    });

    public intlClass: { [key: string]: IntlPhoneLib } = {};
    public apiError = new BehaviorSubject<string[]>(null);
    public prefilledNumber: Number;
    public selectGetOtpRes$: Observable<IGetOtpRes>;
    public selectGetOtpInProcess$: Observable<boolean>;
    public selectGetOtpSuccess$: Observable<boolean>;
    public selectVerifyOtpV2Data$: Observable<any>;
    public selectVerifyOtpV2InProcess$: Observable<boolean>;
    public selectVerifyOtpV2Success$: Observable<boolean>;
    public selectApiErrorResponse$: Observable<any>;
    public isOtpVerified: boolean = false;
    public isOtpSent: boolean = false;
    public isNumberChanged: boolean = false;
    public otpError: string = '';
    public isEmailOtpVerified: boolean = false;
    public isEmailOtpSent: boolean = false;
    public isEmailChanged: boolean = false;
    public emailOtpError: string = '';
    public emailVerificationToken: string = '';
    public mobileVerificationToken: string = '';

    // Resend OTP timer properties
    public resendTimer: number = 0;
    public canResendOtp: boolean = true;
    public lastSentMobileNumber: string = '';
    public emailResendTimer: number = 0;
    public canResendEmailOtp: boolean = true;
    public lastSentEmail: string = '';
    private timerSubscription: Subscription;
    private emailTimerSubscription: Subscription;
    private pendingOtpChannel: OtpChannel = 'mobile';

    public selectWidgetTheme$: Observable<any>;
    public uiPreferences: any = {};

    @ViewChild('otp1', { static: false }) otp1Ref: ElementRef;
    @ViewChild('otp2', { static: false }) otp2Ref: ElementRef;
    @ViewChild('otp3', { static: false }) otp3Ref: ElementRef;
    @ViewChild('otp4', { static: false }) otp4Ref: ElementRef;

    private store = inject<Store<IAppState>>(Store);
    private otpService = inject(OtpService);
    private otpUtilityService = inject(OtpUtilityService);
    private cdr = inject(ChangeDetectorRef);
    private readonly themeService = inject(WidgetThemeService);
    private readonly el = inject(ElementRef);
    readonly isDarkTheme = computed(() => this.themeService.isDark$());

    constructor() {
        super();
        effect(() => this.themeService.setInputTheme(this.theme()));
        this.selectGetOtpRes$ = this.store.pipe(
            select(selectGetOtpRes),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
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
        this.selectVerifyOtpV2Data$ = this.store.pipe(
            select(selectVerifyOtpV2Data),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectVerifyOtpV2InProcess$ = this.store.pipe(
            select(selectVerifyOtpV2InProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectVerifyOtpV2Success$ = this.store.pipe(
            select(selectVerifyOtpV2Success),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectApiErrorResponse$ = this.store.pipe(
            select(selectApiErrorResponse),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectWidgetTheme$ = this.store.pipe(
            select(selectWidgetTheme),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit(): void {
        this.selectWidgetTheme$.pipe(takeUntil(this.destroy$)).subscribe((theme) => {
            this.uiPreferences = theme?.ui_preferences || {};
        });
        if (this.isRegisterFormOnly()) {
            this.registrationForm.get('user.email').disable();
        }
        this.registrationForm
            .get('user.mobile')
            .valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.isOtpVerified = false;
                this.otpError = '';
                this.mobileVerificationToken = '';
            });
        this.registrationForm
            .get('user.email')
            .valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.isEmailOtpVerified = false;
                this.emailOtpError = '';
                this.emailVerificationToken = '';
            });
        this.registrationForm
            .get('user.password')
            .valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.registrationForm.get('user.confirmPassword').updateValueAndValidity();
                }
            });

        this.selectVerifyOtpV2Success$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (this.pendingOtpChannel === 'email') {
                this.isEmailOtpVerified = res;
                if (res) {
                    this.registrationForm.get('user.email').setErrors(null);
                    this.emailOtpError = '';
                }
            } else {
                this.isOtpVerified = res;
                if (res) {
                    this.registrationForm.get('user.mobile').setErrors(null);
                    this.otpError = '';
                }
            }
            this.cdr.markForCheck();
        });
        this.selectVerifyOtpV2Data$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            const token = res?.data?.otp_verification_token;
            if (token) {
                if (this.pendingOtpChannel === 'email') {
                    this.emailVerificationToken = token;
                } else {
                    this.mobileVerificationToken = token;
                }
            }
            this.cdr.markForCheck();
        });
        this.selectGetOtpSuccess$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (!res) {
                return;
            }
            if (this.pendingOtpChannel === 'email') {
                this.isEmailOtpSent = true;
                this.startResendTimer('email');
                this.lastSentEmail = this.registrationForm.get('user.email').value;
                this.isEmailChanged = true;
            } else {
                this.isOtpSent = true;
                this.startResendTimer('mobile');
                this.lastSentMobileNumber = this.registrationForm.get('user.mobile').value;
                this.isNumberChanged = true;
            }
            this.cdr.markForCheck();
        });

        // Handle API errors (OTP verification, getOtp, resendOtp)
        this.selectApiErrorResponse$.pipe(takeUntil(this.destroy$)).subscribe((errorResponse) => {
            if (errorResponse) {
                // Extract error message from the response - handle HTTP error wrapping
                const errorMessage =
                    errorResponse?.error?.errors?.message ||
                    errorResponse?.error?.data?.message ||
                    errorResponse?.error?.message ||
                    errorResponse?.errors?.message ||
                    errorResponse?.data?.message ||
                    errorResponse?.message ||
                    'An error occurred';

                // Display error inline in the dialog
                this.apiError.next([errorMessage]);

                if (this.pendingOtpChannel === 'email' && this.isEmailOtpSent && !this.isEmailOtpVerified) {
                    this.emailOtpError = 'Please enter valid OTP';
                    this.emailOtpForm.reset();
                } else if (this.isOtpSent && !this.isOtpVerified) {
                    this.otpError = 'Please enter valid OTP';
                    this.otpForm.reset();
                }
            }
            this.cdr.markForCheck();
        });

        // Add global paste event listener
        document.addEventListener('paste', this.handleGlobalPaste.bind(this));
    }
    checkPrefillDetails() {
        const val = this.prefillDetails();
        if (isNaN(Number(val))) {
            this.registrationForm.get('user.email').setValue(val);
            this.registrationForm.get('user.mobile').setValue(null);
        } else {
            this.registrationForm.get('user.email').setValue(null);
            this.prefilledNumber = val;
            this.registrationForm.get('user.mobile').setValue(val);
        }
    }
    ngAfterViewInit(): void {
        setTimeout(() => {
            this.initIntl('user');
            let count = 0;
            const interval = setInterval(() => {
                const userIntlWrapper =
                    this.el.nativeElement.querySelector('#init-contact-wrapper-user') ||
                    document.querySelector('proxy-auth')?.shadowRoot?.querySelector('#init-contact-wrapper-user') ||
                    document.getElementById('init-contact-wrapper-user');
                if (count > 6 || userIntlWrapper?.querySelector('.iti__selected-flag')?.getAttribute('title')) {
                    this.initIntl('company');
                    this.applyFlagImages();
                    clearInterval(interval);
                }
                count += 1;
            }, 500);
        });
    }

    private applyFlagImages(): void {
        const flagsUrl = 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/img/flags.png';
        const flags2xUrl = 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/img/flags@2x.png';
        const isHiDpi = window.devicePixelRatio >= 2;
        const url = isHiDpi ? flags2xUrl : flagsUrl;
        const shadowRoot = document.querySelector('proxy-auth')?.shadowRoot;
        const scope = shadowRoot ?? document;
        scope.querySelectorAll<HTMLElement>('.iti__flag').forEach((el) => {
            el.style.backgroundImage = `url('${url}')`;
        });
    }

    public ngOnDestroy(): void {
        // Remove global paste event listener
        document.removeEventListener('paste', this.handleGlobalPaste.bind(this));
        this.stopResendTimer('mobile');
        this.stopResendTimer('email');
        super.ngOnDestroy();
    }

    private startResendTimer(channel: OtpChannel): void {
        if (channel === 'email') {
            this.canResendEmailOtp = false;
            this.emailResendTimer = 30;
            this.emailTimerSubscription = interval(1000).subscribe(() => {
                this.emailResendTimer--;
                if (this.emailResendTimer <= 0) {
                    this.stopResendTimer('email');
                    this.canResendEmailOtp = true;
                }
                this.cdr.detectChanges();
            });
            return;
        }
        this.canResendOtp = false;
        this.resendTimer = 30;
        this.timerSubscription = interval(1000).subscribe(() => {
            this.resendTimer--;
            if (this.resendTimer <= 0) {
                this.stopResendTimer('mobile');
                this.canResendOtp = true;
            }
            this.cdr.detectChanges();
        });
    }

    private stopResendTimer(channel: OtpChannel): void {
        if (channel === 'email') {
            if (this.emailTimerSubscription) {
                this.emailTimerSubscription.unsubscribe();
                this.emailTimerSubscription = null;
            }
            this.emailResendTimer = 0;
            this.canResendEmailOtp = true;
            return;
        }
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
            this.timerSubscription = null;
        }
        this.resendTimer = 0;
        this.canResendOtp = true;
    }

    public resendOtp(): void {
        this.sendOtpForChannel('mobile', true);
    }

    public resendEmailOtp(): void {
        this.sendOtpForChannel('email', true);
    }

    public initIntl(key: string): void {
        const input = (this.el.nativeElement.querySelector('#init-contact-' + key) ||
            document.querySelector('proxy-auth')?.shadowRoot?.getElementById('init-contact-' + key) ||
            document.getElementById('init-contact-' + key)) as HTMLElement;
        const customCssStyleURL = `${window.location.origin}/assets/utils/intl-tel-input-custom.css`;
        if (input) {
            this.intlClass[key] = new IntlPhoneLib(input, document.head, customCssStyleURL);
            if (this.prefilledNumber) {
                input.setAttribute('value', `+${this.prefilledNumber}`);
            }
        }
    }

    public close(closeByUser: boolean = false): void {
        // Reset all form and OTP states
        this.resetFormState();
        this.resetOtpStoreState();

        this.togglePopUp.emit();
        if (closeByUser) {
            this.failureReturn.emit({
                code: 0, // code use for close by user
                closeByUser, // boolean value for status
                message: 'User cancelled the registration process.',
            });
        }
    }

    private resetOtpStoreState(): void {
        this.store.dispatch(
            resetAnyState({
                request: {
                    otpGenerateData: null,
                    getOtpInProcess: false,
                    getOtpSuccess: false,
                    verifyOtpV2Data: null,
                    verifyOtpV2InProcess: false,
                    verifyOtpV2Success: false,
                    resendOtpInProcess: false,
                    resendOtpSuccess: false,
                    verifyOtpData: null,
                    verifyOtpInProcess: false,
                    verifyOtpSuccess: false,
                    resendCount: 0,
                    apiErrorResponse: null,
                    errors: null,
                },
            })
        );
    }
    private resetFormState(): void {
        this.isOtpVerified = false;
        this.isOtpSent = false;
        this.isNumberChanged = false;
        this.otpError = '';
        this.lastSentMobileNumber = '';
        this.isEmailOtpVerified = false;
        this.isEmailOtpSent = false;
        this.isEmailChanged = false;
        this.emailOtpError = '';
        this.lastSentEmail = '';

        this.registrationForm.reset();
        this.otpForm.reset();
        this.emailOtpForm.reset();

        this.stopResendTimer('mobile');
        this.stopResendTimer('email');

        this.apiError.next(null);
    }

    /**
     * Reset only OTP-specific store states, preserving widgetData and other non-OTP states
    //  */
    // private resetOtpStoreState(): void {
    //     this.store.dispatch(
    //         resetAnyState({
    //             request: {
    //                 otpGenerateData: null,
    //                 getOtpInProcess: false,
    //                 getOtpSuccess: false,
    //                 verifyOtpV2Data: null,
    //                 verifyOtpV2InProcess: false,
    //                 verifyOtpV2Success: false,
    //                 resendOtpInProcess: false,
    //                 resendOtpSuccess: false,
    //                 verifyOtpData: null,
    //                 verifyOtpInProcess: false,
    //                 verifyOtpSuccess: false,
    //                 resendCount: 0,
    //                 apiErrorResponse: null,
    //                 errors: null,
    //             },
    //         })
    //     );
    // }

    public returnSuccess(successResponse: any) {
        this.successReturn.emit(successResponse);
    }

    public onSubmitClick(): void {
        this.registrationForm.markAllAsTouched();
        if (this.registrationForm.invalid) {
            return;
        }
        this.submit();
    }

    public submit(): void {
        this.apiError.next(null);
        if (!this.isOtpVerified) {
            this.registrationForm.get('user.mobile').setErrors({ otpVerificationFailed: true });
            return;
        }
        if (!this.isRegisterFormOnly() && !this.isEmailOtpVerified) {
            this.registrationForm.get('user.email').setErrors({ otpVerificationFailed: true });
            return;
        }
        const formData = removeEmptyKeys(cloneDeep(this.registrationForm.getRawValue()), true);
        const state = JSON.parse(
            this.otpUtilityService.aesDecrypt(
                this.registrationViaLogin() ? this.loginServiceData().state : (this.serviceData()?.state ?? ''),
                environment.uiEncodeKey,
                environment.uiIvKey,
                true
            ) || '{}'
        );
        if (formData?.user) {
            delete formData?.user?.confirmPassword;
            formData.user['name'] =
                formData?.user?.firstName + (formData?.user?.lastName ? ' ' + formData?.user?.lastName : '');
            formData.user['meta'] = {};
            delete formData?.user?.firstName;
            delete formData?.user?.lastName;
        }
        if (formData?.company) {
            formData.company['meta'] = {};
        }
        const payload = {
            reference_id: this.referenceId(),
            service_id: this.registrationViaLogin()
                ? this.loginServiceData().service_id
                : this.serviceData().service_id,
            url_unique_id: state?.url_unique_id,
            request_data: formData,
            ...(this.signupServiceId() && { signup_service_id: this.signupServiceId() }),
        };
        const encodedData = this.otpUtilityService.aesEncrypt(
            JSON.stringify(payload),
            environment.uiEncodeKey,
            environment.uiIvKey,
            true
        );
        const registrationState = this.registrationViaLogin()
            ? this.loginServiceData().state
            : this.serviceData().state;
        this.otpService
            .register({
                proxy_state: encodedData,
                state: registrationState,
                ...(this.emailVerificationToken && {
                    email_otp_verification_token: this.emailVerificationToken,
                }),
                ...(this.mobileVerificationToken && {
                    mobile_otp_verification_token: this.mobileVerificationToken,
                }),
            })
            .subscribe(
                (response) => {
                    window.location.href = response.data.redirect_url;
                },
                (err) => {
                    this.apiError.next(errorResolver(err?.error.errors));
                }
            );
    }

    public getOtp(): void {
        this.sendOtpForChannel('mobile', false);
    }

    public getEmailOtp(): void {
        this.sendOtpForChannel('email', false);
    }

    private sendOtpForChannel(channel: OtpChannel, isResend: boolean): void {
        if (channel === 'email') {
            const emailControl = this.registrationForm.get('user.email');
            if (emailControl.errors?.otpVerificationFailed) {
                emailControl.setErrors(null);
            }
            if (emailControl.invalid) {
                emailControl.markAsTouched();
                return;
            }
            const currentEmail = emailControl.value;
            if (isResend && currentEmail !== this.lastSentEmail) {
                this.stopResendTimer('email');
                this.canResendEmailOtp = true;
                this.lastSentEmail = currentEmail;
            }
            if (!this.canResendEmailOtp) {
                return;
            }
            this.pendingOtpChannel = 'email';
            this.store.dispatch(
                sendOtpAction({
                    request: {
                        referenceId: this.referenceId(),
                        identifier: currentEmail,
                    },
                })
            );
            return;
        }

        const mobileControl = this.registrationForm.get('user.mobile');
        if (mobileControl.errors?.otpVerificationFailed) {
            mobileControl.setErrors(null);
        }
        if (mobileControl.invalid) {
            mobileControl.markAsTouched();
            return;
        }
        const isMobileValid = this.intlClass['user']?.isRequiredValidNumber;
        if (!isMobileValid) {
            mobileControl.markAsTouched();
            return;
        }
        const currentMobile = mobileControl.value;
        if (isResend && currentMobile !== this.lastSentMobileNumber) {
            this.stopResendTimer('mobile');
            this.canResendOtp = true;
            this.lastSentMobileNumber = currentMobile;
        }
        if (!this.canResendOtp) {
            return;
        }
        this.pendingOtpChannel = 'mobile';
        this.store.dispatch(
            sendOtpAction({
                request: {
                    referenceId: this.referenceId(),
                    identifier: currentMobile,
                },
            })
        );
    }

    public verifyOtp(): void {
        this.verifyOtpForChannel('mobile');
    }

    public verifyEmailOtp(): void {
        this.verifyOtpForChannel('email');
    }

    private verifyOtpForChannel(channel: OtpChannel): void {
        const form = channel === 'email' ? this.emailOtpForm : this.otpForm;
        const identifierControl =
            channel === 'email' ? this.registrationForm.get('user.email') : this.registrationForm.get('user.mobile');
        const otpValues = form.value;
        const otpArray = [otpValues.otp1, otpValues.otp2, otpValues.otp3, otpValues.otp4];
        const otpString = otpArray.filter((val) => val && val.trim() !== '').join('');

        if (otpString.length === 4) {
            this.pendingOtpChannel = channel;
            this.store.dispatch(
                verifyOtpAction({
                    request: {
                        referenceId: this.referenceId(),
                        identifier: identifierControl.value,
                        otp: otpString,
                    },
                })
            );
        }
    }

    private getOtpForm(channel: OtpChannel): FormGroup {
        return channel === 'email' ? this.emailOtpForm : this.otpForm;
    }

    public onOtpInput(
        event: any,
        controlName: string,
        nextInput?: HTMLInputElement,
        channel: OtpChannel = 'mobile'
    ): void {
        const input = event.target;
        let value = input.value;

        if (!/^\d*$/.test(value)) {
            value = value.replace(/\D/g, '');
            input.value = value;
        }
        this.getOtpForm(channel).get(controlName).setValue(value);

        if (channel === 'email') {
            if (this.emailOtpError) {
                this.emailOtpError = '';
            }
        } else if (this.otpError) {
            this.otpError = '';
        }

        this.cdr.detectChanges();

        if (value && nextInput) {
            nextInput.focus();
        }
    }

    public onOtpPaste(event: any, channel: OtpChannel = 'mobile'): void {
        event.preventDefault();
        const pastedData = event.clipboardData.getData('text/plain');
        const otpDigits = pastedData.replace(/\D/g, '').slice(0, 4).split('');
        const form = this.getOtpForm(channel);
        const otpFields = ['otp1', 'otp2', 'otp3', 'otp4'];

        otpFields.forEach((fieldName) => {
            const controlName = fieldName as 'otp1' | 'otp2' | 'otp3' | 'otp4';
            form.get(controlName).setValue('');
        });

        otpDigits.forEach((digit, index) => {
            if (index < 4) {
                const controlName = otpFields[index] as 'otp1' | 'otp2' | 'otp3' | 'otp4';
                form.get(controlName).setValue(digit);
            }
        });

        if (channel === 'email') {
            if (this.emailOtpError) {
                this.emailOtpError = '';
            }
        } else if (this.otpError) {
            this.otpError = '';
        }

        this.cdr.detectChanges();
    }

    private handleGlobalPaste(event: ClipboardEvent): void {
        const target = event.target as HTMLElement;
        if (target?.closest('.mobile-otp-container')) {
            this.onOtpPaste(event, 'mobile');
        } else if (target?.closest('.email-otp-container')) {
            this.onOtpPaste(event, 'email');
        }
    }

    public onOtpKeyup(event: any, controlName: string, channel: OtpChannel = 'mobile'): void {
        const input = event.target;
        const value = input.value;
        this.getOtpForm(channel).get(controlName).setValue(value);
        this.cdr.detectChanges();
    }

    public onOtpKeydown(
        event: any,
        controlName: string,
        prevInput?: HTMLInputElement,
        channel: OtpChannel = 'mobile'
    ): void {
        const input = event.target;

        if (event.key === 'Backspace' && !input.value && prevInput) {
            event.preventDefault();
            prevInput.focus();
            prevInput.select();
        }
    }
    public onMobileInput(event: any, key?: string) {
        if (key === 'user') {
            this.isOtpSent = false;
            const input = event.target;
            const value = input.value;
            this.registrationForm.get('user.mobile').setValue(value);
            this.otpForm.reset();

            if (value !== this.lastSentMobileNumber) {
                this.stopResendTimer('mobile');
                this.canResendOtp = true;
            }

            this.cdr.detectChanges();
        }
    }

    public onEmailInput = (): void => {
        this.isEmailOtpSent = false;
        this.emailOtpForm.reset();
        const value = this.registrationForm.get('user.email').value;
        if (value !== this.lastSentEmail) {
            this.stopResendTimer('email');
            this.canResendEmailOtp = true;
        }
        this.cdr.detectChanges();
    };

    public numberChanged(): void {
        this.isOtpSent = false;
        this.isOtpVerified = false;
        this.isNumberChanged = false;
        this.otpForm.reset();
        this.cdr.detectChanges();
    }

    public emailChanged(): void {
        this.isEmailOtpSent = false;
        this.isEmailOtpVerified = false;
        this.isEmailChanged = false;
        this.emailOtpForm.reset();
        this.cdr.detectChanges();
    }

    public get primaryColor(): string | null {
        if (this.version() !== 'v2') {
            return null;
        }
        const isDark = this.themeService.isDark();
        return isDark
            ? this.uiPreferences?.dark_theme_primary_color || null
            : this.uiPreferences?.light_theme_primary_color || null;
    }

    public get borderRadiusValue(): string | null {
        if (this.version() !== 'v2') {
            return null;
        }
        switch (this.uiPreferences?.border_radius) {
            case 'none':
                return '0';
            case 'small':
                return '4px';
            case 'medium':
                return '8px';
            case 'large':
                return '12px';
            default:
                return null;
        }
    }

    public get buttonColor(): string | null {
        if (this.version() !== 'v2') return null;
        return this.uiPreferences?.button_color || null;
    }

    public get buttonHoverColor(): string | null {
        if (this.version() !== 'v2') return null;
        return this.uiPreferences?.button_hover_color || null;
    }

    public get buttonTextColor(): string | null {
        if (this.version() !== 'v2') return null;
        return this.uiPreferences?.button_text_color || null;
    }
}
