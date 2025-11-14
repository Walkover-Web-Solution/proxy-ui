import { cloneDeep } from 'lodash-es';
import { OtpService } from './../../service/otp.service';
import { environment } from './../../../../environments/environment';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { resetAll, sendOtpAction, verifyOtpAction } from '../../store/actions/otp.action';
import { BaseComponent } from '@proxy/ui/base-component';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../../store/app.state';
import { IntlPhoneLib, removeEmptyKeys } from '@proxy/utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { EMAIL_REGEX, NAME_REGEX, PASSWORD_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { OtpUtilityService } from '../../service/otp-utility.service';
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
} from '../../store/selectors';
import { IGetOtpRes } from '../../model/otp';

@Component({
    selector: 'proxy-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent extends BaseComponent implements AfterViewInit, OnDestroy, OnInit {
    @Input() public referenceId: string;
    @Input() public serviceData: any;
    @Input() public loginServiceData: any;
    @Input() public registrationViaLogin: boolean;
    @Input() public prefillDetails;
    @Input() public showCompanyDetails: boolean = true;
    public showPassword: boolean = false;
    public showConfirmPassword: boolean = false;
    @Output() public togglePopUp: EventEmitter<any> = new EventEmitter();
    @Output() public successReturn: EventEmitter<any> = new EventEmitter();
    @Output() public failureReturn: EventEmitter<any> = new EventEmitter();

    get showCompanyDetail(): boolean {
        // Show company details by default, only hide when explicitly set to false
        return this.showCompanyDetails !== false;
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

    // Resend OTP timer properties
    public resendTimer: number = 0;
    public canResendOtp: boolean = true;
    public lastSentMobileNumber: string = '';
    private timerSubscription: Subscription;

    @ViewChild('otp1', { static: false }) otp1Ref: ElementRef;
    @ViewChild('otp2', { static: false }) otp2Ref: ElementRef;
    @ViewChild('otp3', { static: false }) otp3Ref: ElementRef;
    @ViewChild('otp4', { static: false }) otp4Ref: ElementRef;

    constructor(
        private store: Store<IAppState>,
        private otpService: OtpService,
        private otpUtilityService: OtpUtilityService,
        private cdr: ChangeDetectorRef
    ) {
        super();
        this.selectGetOtpRes$ = this.store.pipe(
            select(selectGetOtpRes),
            distinctUntilChanged(_.isEqual),
            takeUntil(this.destroy$)
        );
        this.selectGetOtpInProcess$ = this.store.pipe(
            select(selectGetOtpInProcess),
            distinctUntilChanged(_.isEqual),
            takeUntil(this.destroy$)
        );
        this.selectGetOtpSuccess$ = this.store.pipe(
            select(selectGetOtpSuccess),
            distinctUntilChanged(_.isEqual),
            takeUntil(this.destroy$)
        );
        this.selectVerifyOtpV2Data$ = this.store.pipe(
            select(selectVerifyOtpV2Data),
            distinctUntilChanged(_.isEqual),
            takeUntil(this.destroy$)
        );
        this.selectVerifyOtpV2InProcess$ = this.store.pipe(
            select(selectVerifyOtpV2InProcess),
            distinctUntilChanged(_.isEqual),
            takeUntil(this.destroy$)
        );
        this.selectVerifyOtpV2Success$ = this.store.pipe(
            select(selectVerifyOtpV2Success),
            distinctUntilChanged(_.isEqual),
            takeUntil(this.destroy$)
        );
        this.selectApiErrorResponse$ = this.store.pipe(
            select(selectApiErrorResponse),
            distinctUntilChanged(_.isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit(): void {
        this.registrationForm
            .get('user.mobile')
            .valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
                this.isOtpVerified = false;
                this.otpError = ''; // Clear error when mobile number changes
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
            this.isOtpVerified = res;
            if (res) {
                this.registrationForm.get('user.mobile').setErrors(null);
                this.otpError = ''; // Clear error on successful verification
            }
        });
        this.selectGetOtpSuccess$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            this.isOtpSent = res;
            if (res) {
                this.startResendTimer();
                this.lastSentMobileNumber = this.registrationForm.get('user.mobile').value;
                this.isNumberChanged = true;
            }
        });

        // Handle OTP verification errors
        this.selectApiErrorResponse$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res && this.isOtpSent && !this.isOtpVerified) {
                this.otpError = 'Please enter valid OTP';
                // Clear OTP form to allow user to retry
                this.otpForm.reset();
            }
        });

        // Add global paste event listener
        document.addEventListener('paste', this.handleGlobalPaste.bind(this));
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes?.prefillDetails?.currentValue) {
            this.checkPrefillDetails();
        }
    }
    checkPrefillDetails() {
        if (isNaN(Number(this.prefillDetails))) {
            this.registrationForm.get('user.email').setValue(this.prefillDetails);
            this.registrationForm.get('user.mobile').setValue(null);
        } else {
            this.registrationForm.get('user.email').setValue(null);
            this.prefilledNumber = this.prefillDetails;
            this.registrationForm.get('user.mobile').setValue(this.prefillDetails);
        }
    }
    ngAfterViewInit(): void {
        this.initIntl('user');
        let count = 0;
        const userIntlWrapper = document
            ?.querySelector('proxy-auth')
            ?.shadowRoot?.querySelector('#init-contact-wrapper-user');
        const interval = setInterval(() => {
            if (count > 6 || userIntlWrapper?.querySelector('.iti__selected-flag')?.getAttribute('title')) {
                this.initIntl('company');
                clearInterval(interval);
            }
            count += 1;
        }, 500);
    }

    public ngOnDestroy(): void {
        // Remove global paste event listener
        document.removeEventListener('paste', this.handleGlobalPaste.bind(this));
        this.stopResendTimer();
        super.ngOnDestroy();
    }

    private startResendTimer(): void {
        this.canResendOtp = false;
        this.resendTimer = 30;
        this.timerSubscription = interval(1000).subscribe(() => {
            this.resendTimer--;
            if (this.resendTimer <= 0) {
                this.stopResendTimer();
                this.canResendOtp = true;
            }
            this.cdr.detectChanges();
        });
    }

    private stopResendTimer(): void {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
            this.timerSubscription = null;
        }
        this.resendTimer = 0;
        this.canResendOtp = true;
    }

    public resendOtp(): void {
        const mobileControl = this.registrationForm.get('user.mobile');
        const currentMobile = mobileControl.value;

        // Check if mobile number has changed
        if (currentMobile !== this.lastSentMobileNumber) {
            // If number changed, reset timer and allow immediate resend
            this.stopResendTimer();
            this.canResendOtp = true;
            this.lastSentMobileNumber = currentMobile;
        }

        mobileControl.markAsTouched();
        const isMobileValid = this.intlClass['user']?.isRequiredValidNumber;

        if (mobileControl.valid && isMobileValid && this.canResendOtp) {
            this.store.dispatch(
                sendOtpAction({
                    request: {
                        referenceId: this.referenceId,
                        mobile: mobileControl.value,
                        authkey: environment.sendOtpAuthKey,
                    },
                })
            );
        }
    }

    public initIntl(key: string): void {
        const parentDom = document.querySelector('proxy-auth')?.shadowRoot;
        const input = document.querySelector('proxy-auth')?.shadowRoot?.getElementById('init-contact-' + key);
        const customCssStyleURL = `${environment.baseUrl}/assets/utils/intl-tel-input-custom.css`;
        if (input) {
            this.intlClass[key] = new IntlPhoneLib(input, parentDom, customCssStyleURL);
            if (this.prefilledNumber) {
                input.setAttribute('value', `+${this.prefilledNumber}`);
            }
        }
    }

    public close(closeByUser: boolean = false): void {
        this.togglePopUp.emit();
        if (closeByUser) {
            this.failureReturn.emit({
                code: 0, // code use for close by user
                closeByUser, // boolean value for status
                message: 'User cancelled the registration process.',
            });
        }
    }

    public resetStore(): void {
        this.store.dispatch(resetAll());
    }

    public returnSuccess(successResponse: any) {
        this.successReturn.emit(successResponse);
    }

    public submit(): void {
        this.apiError.next(null);
        if (!this.isOtpVerified) {
            this.registrationForm.get('user.mobile').setErrors({ otpVerificationFailed: true });
            return;
        }
        const formData = removeEmptyKeys(cloneDeep(this.registrationForm.value), true);
        const state = JSON.parse(
            this.otpUtilityService.aesDecrypt(
                this.registrationViaLogin ? this.loginServiceData.state : this.serviceData?.state ?? '',
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
            reference_id: this.referenceId,
            service_id: this.registrationViaLogin ? this.loginServiceData.service_id : this.serviceData.service_id,
            url_unique_id: state?.url_unique_id,
            request_data: formData,
        };
        const encodedData = this.otpUtilityService.aesEncrypt(
            JSON.stringify(payload),
            environment.uiEncodeKey,
            environment.uiIvKey,
            true
        );
        const registrationState = this.registrationViaLogin ? this.loginServiceData.state : this.serviceData.state;
        this.otpService.register({ proxy_state: encodedData, state: registrationState }).subscribe(
            (response) => {
                window.location.href = response.data.redirect_url;
            },
            (err) => {
                this.apiError.next(errorResolver(err?.error.errors));
            }
        );
    }

    public getOtp() {
        if (this.registrationForm.get('user.mobile').errors?.otpVerificationFailed) {
            this.registrationForm.get('user.mobile').setErrors(null);
        }

        const mobileControl = this.registrationForm.get('user.mobile');
        if (mobileControl.invalid) {
            return;
        }
        const isMobileValid = this.intlClass['user']?.isRequiredValidNumber;

        if (mobileControl.valid && isMobileValid) {
            this.store.dispatch(
                sendOtpAction({
                    request: {
                        referenceId: this.referenceId,
                        mobile: mobileControl.value,
                        authkey: environment.sendOtpAuthKey,
                    },
                })
            );
        }
    }
    public verifyOtp() {
        const otpValues = this.otpForm.value;
        const mobileControl = this.registrationForm.get('user.mobile');

        const otpArray = [otpValues.otp1, otpValues.otp2, otpValues.otp3, otpValues.otp4];
        const otpString = otpArray.filter((val) => val && val.trim() !== '').join('');

        if (otpString.length === 4) {
            this.store.dispatch(
                verifyOtpAction({
                    request: {
                        referenceId: this.referenceId,
                        mobile: mobileControl.value,
                        otp: otpString,
                        authkey: environment.sendOtpAuthKey,
                    },
                })
            );
        }
    }

    public onOtpInput(event: any, controlName: string, nextInput?: HTMLInputElement) {
        const input = event.target;
        let value = input.value;

        if (!/^\d*$/.test(value)) {
            value = value.replace(/\D/g, '');
            input.value = value;
        }
        this.otpForm.get(controlName).setValue(value);

        // Clear error when user starts typing
        if (this.otpError) {
            this.otpError = '';
        }

        this.cdr.detectChanges();

        if (value && nextInput) {
            nextInput.focus();
        }
    }

    public onOtpPaste(event: any) {
        event.preventDefault();
        const pastedData = event.clipboardData.getData('text/plain');
        const otpDigits = pastedData.replace(/\D/g, '').slice(0, 4).split('');

        const otpFields = ['otp1', 'otp2', 'otp3', 'otp4'];
        otpFields.forEach((fieldName, index) => {
            const controlName = fieldName as 'otp1' | 'otp2' | 'otp3' | 'otp4';
            this.otpForm.get(controlName).setValue('');
        });

        otpDigits.forEach((digit, index) => {
            if (index < 4) {
                const controlName = otpFields[index] as 'otp1' | 'otp2' | 'otp3' | 'otp4';
                this.otpForm.get(controlName).setValue(digit);
            }
        });

        // Clear error when user pastes OTP
        if (this.otpError) {
            this.otpError = '';
        }

        this.cdr.detectChanges();
        const lastFilledIndex = Math.min(otpDigits.length - 1, 3);
        setTimeout(() => {
            const nextField = document.querySelector(`#otp${lastFilledIndex + 1}`) as HTMLInputElement;
            if (nextField && lastFilledIndex < 3) {
                nextField.focus();
            } else {
                const currentField = document.querySelector(`#otp${lastFilledIndex + 1}`) as HTMLInputElement;
                if (currentField) {
                    currentField.focus();
                }
            }
        }, 100);
    }

    private handleGlobalPaste(event: ClipboardEvent) {
        const target = event.target as HTMLElement;
        if (target && target.closest('.otp-container')) {
            this.onOtpPaste(event);
        }
    }

    public onOtpKeyup(event: any, controlName: string) {
        const input = event.target;
        const value = input.value;
        this.otpForm.get(controlName).setValue(value);
        this.cdr.detectChanges();
    }

    public onOtpKeydown(event: any, controlName: string, prevInput?: HTMLInputElement) {
        const input = event.target;

        // Handle backspace
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

            // Check if mobile number has changed
            if (value !== this.lastSentMobileNumber) {
                this.stopResendTimer();
                this.canResendOtp = true;
            }

            this.cdr.detectChanges();
        }
    }
    public numberChanged() {
        this.isOtpSent = false;
        this.isOtpVerified = false;
        this.isNumberChanged = false;
        this.otpForm.reset();
        this.cdr.detectChanges();
    }
}
