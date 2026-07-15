import { CommonModule, NgStyle } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    afterNextRender,
    computed,
    effect,
    inject,
    input,
    signal,
} from '@angular/core';
import { WidgetPortalRef, WidgetPortalService } from '../service/widget-portal.service';
import { ToastService } from '../service/toast.service';
import { ToastComponent } from '../service/toast.component';
import { ConfirmDialogComponent } from '../ui/confirm-dialog.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
    BehaviorSubject,
    distinctUntilChanged,
    interval,
    map,
    Observable,
    Subscription,
    takeUntil,
    take,
    filter,
    skip,
} from 'rxjs';
import { IAppState } from '../store/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import {
    getUserDetails,
    leaveCompany,
    leaveCompanyError,
    resetAnyState,
    sendOtpAction,
    updateUser,
    verifyOtpAction,
} from '../store/actions/otp.action';
import {
    error,
    getUserProfileData,
    getUserProfileInProcess,
    updateSuccess,
    leaveCompanySuccess,
    selectGetOtpInProcess,
    selectGetOtpSuccess,
    selectVerifyOtpV2InProcess,
    selectVerifyOtpV2Success,
    selectVerifyOtpV2Data,
    selectApiErrorResponse,
} from '../store/selectors';
import { BaseComponent } from '@proxy/ui/base-component';
import { isEqual } from 'lodash-es';
import { NAME_REGEX } from '@proxy/regex';
import { WidgetTheme } from '@proxy/constant';
import { WidgetThemeService } from '../service/widget-theme.service';
import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

@Component({
    selector: 'user-profile',
    imports: [CommonModule, ReactiveFormsModule, ToastComponent, ConfirmDialogComponent],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    public authToken = input<string>();
    public target = input<string>();
    public showCard = input<boolean>();
    public theme = input<string>();
    public openEditProfile = input<boolean>(false);
    private hasAutoOpenedEditDialog = false;
    protected readonly WidgetTheme = WidgetTheme;
    private readonly themeService = inject(WidgetThemeService);
    readonly isDark = computed(() => this.themeService.isDark$());
    @Input()
    set css(type: NgStyle['ngStyle']) {
        this.cssSubject$.next(type);
    }
    private readonly cssSubject$: NgStyle['ngStyle'] = new BehaviorSubject({
        position: 'absolute',
        'margin-left': '50%',
        top: '10px',
    });
    readonly css$ = this.cssSubject$.pipe(
        map((type) =>
            !type || !Object.keys(type).length
                ? {
                      position: 'absolute',
                      'margin-left': '50%',
                      top: '10px',
                  }
                : type
        )
    );
    public successReturn = input<(arg: any) => any>();
    public failureReturn = input<(arg: any) => any>();
    public userDetails$: Observable<any>;
    public userInProcess$: Observable<boolean>;
    public deleteCompany$: Observable<any>;
    public update$: Observable<any>;
    public selectGetOtpInProcess$: Observable<boolean>;
    public selectGetOtpSuccess$: Observable<boolean>;
    public selectVerifyOtpV2InProcess$: Observable<boolean>;
    public selectVerifyOtpV2Success$: Observable<boolean>;
    public previousName: string;
    public previousMobile: string = '';
    public errorMessage: string;
    public error$: Observable<any>;
    public companyDetails;

    public otpForm = new FormGroup({
        otp1: new FormControl<string>(''),
        otp2: new FormControl<string>(''),
        otp3: new FormControl<string>(''),
        otp4: new FormControl<string>(''),
    });

    public isMobileOtpVerified = false;
    public isMobileOtpSent = false;
    public isNumberChanged = false;
    public showMobileValidation = false;
    public otpError = '';
    public getOtpError = '';
    public resendTimer = 0;
    public canResendOtp = true;
    public lastSentMobileNumber = '';
    public otpVerificationToken = '';
    private timerSubscription: Subscription;

    clientForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.pattern(NAME_REGEX)]),
        mobile: new FormControl({ value: '', disabled: true }),
        email: new FormControl({ value: '', disabled: true }),
    });

    public readonly isEditing = signal(false);
    public readonly isEditingMobile = signal(false);

    private store = inject<Store<IAppState>>(Store);
    private readonly actions$ = inject(Actions);
    readonly toastService = inject(ToastService);
    private readonly widgetPortal = inject(WidgetPortalService);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly injector = inject(Injector);
    readonly confirmDialogCompanyId = signal<number | null>(null);

    @ViewChild('editDialogPortal') private editDialogPortalEl?: ElementRef<HTMLElement>;
    @ViewChild('confirmDialogPortal') private confirmDialogPortalEl?: ElementRef<HTMLElement>;
    @ViewChild('toastPortal') private toastPortalEl?: ElementRef<HTMLElement>;
    @ViewChild('otp1', { static: false }) private otp1Ref?: ElementRef<HTMLInputElement>;

    private editDialogRef: WidgetPortalRef | null = null;
    private confirmDialogPortalRef: WidgetPortalRef | null = null;
    private toastPortalRef: WidgetPortalRef | null = null;

    constructor() {
        super();
        effect(() => this.themeService.setInputTheme(this.theme()));
        this.userDetails$ = this.store.pipe(
            select(getUserProfileData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.userInProcess$ = this.store.pipe(
            select(getUserProfileInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.deleteCompany$ = this.store.pipe(
            select(leaveCompanySuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.update$ = this.store.pipe(select(updateSuccess), distinctUntilChanged(isEqual), takeUntil(this.destroy$));
        this.error$ = this.store.pipe(select(error), distinctUntilChanged(isEqual), takeUntil(this.destroy$));
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
    }

    ngAfterViewInit(): void {
        if (this.toastPortalEl?.nativeElement) {
            this.toastPortalRef = this.widgetPortal.attach(this.toastPortalEl.nativeElement);
        }
    }

    ngOnDestroy(): void {
        this.stopResendTimer();
        this.editDialogRef?.detach();
        this.confirmDialogPortalRef?.detach();
        this.toastPortalRef?.detach();
        super.ngOnDestroy();
    }

    ngOnInit(): void {
        this.userDetails$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.previousName = res?.name;
                this.companyDetails = res;
                const nameControl = this.clientForm.get('name');
                nameControl?.setValue(res?.name);
                nameControl?.updateValueAndValidity({ emitEvent: false });
                if (nameControl?.hasError('pattern')) {
                    nameControl.markAsTouched();
                }
                this.clientForm.get('email').setValue(res?.email);
                const mobile = res?.mobile && res.mobile !== '--Not Provided--' ? res.mobile : '';
                this.previousMobile = mobile;
                this.clientForm.get('mobile').setValue(mobile);

                if (this.openEditProfile() && !this.hasAutoOpenedEditDialog) {
                    this.hasAutoOpenedEditDialog = true;
                    this.openEditDialog();
                }
            }
        });

        this.clientForm.get('name').valueChanges.subscribe((value) => {
            if (value.trim() !== this.previousName) {
                this.clientForm.get('name').markAsTouched();
            }
        });

        this.selectVerifyOtpV2Success$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            this.isMobileOtpVerified = res;
            if (res) {
                this.clientForm.get('mobile').setErrors(null);
                this.otpError = '';
            }
            this.cdr.markForCheck();
        });

        this.store
            .pipe(select(selectVerifyOtpV2Data), distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res?.data?.otp_verification_token) {
                    this.otpVerificationToken = res.data.otp_verification_token;
                }
                this.cdr.markForCheck();
            });

        this.selectGetOtpSuccess$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.isMobileOtpSent = true;
                this.getOtpError = '';
                this.startResendTimer();
                this.lastSentMobileNumber = this.getMobileIdentifier();
                this.lockMobileInput();
                this.cdr.detectChanges();
                afterNextRender(() => this.focusFirstOtpInput(), { injector: this.injector });
            }
        });

        this.store
            .pipe(select(selectApiErrorResponse), distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((errorResponse) => {
                if (!errorResponse) {
                    return;
                }

                const errorMessage = this.extractApiErrorMessage(errorResponse);

                if (this.isMobileOtpSent && !this.isMobileOtpVerified) {
                    this.otpError = errorMessage;
                    this.otpForm.reset();
                } else if (this.isEditingMobile()) {
                    this.getOtpError = errorMessage;
                }

                this.cdr.markForCheck();
            });

        this.store.dispatch(
            getUserDetails({
                request: this.authToken(),
            })
        );
    }

    openModal(companyId: number): void {
        this.confirmDialogCompanyId.set(companyId);
        this.cdr.detectChanges();
        setTimeout(() => {
            if (this.confirmDialogPortalEl?.nativeElement) {
                this.confirmDialogPortalRef = this.widgetPortal.attach(this.confirmDialogPortalEl.nativeElement);
                this.confirmDialogPortalRef.onDetach(() => {
                    this.confirmDialogPortalRef = null;
                    this.confirmDialogCompanyId.set(null);
                });
            }
        });
    }

    confirmLeave(): void {
        const companyId = this.confirmDialogCompanyId();
        this.confirmDialogPortalRef?.detach();
        this.confirmDialogPortalRef = null;
        if (!companyId) return;

        this.actions$
            .pipe(ofType(leaveCompanyError), take(1), takeUntil(this.destroy$))
            .subscribe(({ errorResponse }) => {
                const errorMessage =
                    errorResponse?.error?.errors?.message ||
                    errorResponse?.error?.data?.message ||
                    errorResponse?.error?.message ||
                    errorResponse?.errors?.message ||
                    errorResponse?.data?.message ||
                    errorResponse?.message ||
                    'Failed to leave the organisation.';
                this.toastService.error(errorMessage);
            });

        this.deleteCompany$.pipe(filter(Boolean), take(1)).subscribe((response) => {
            if (response) {
                window.parent.postMessage({ type: 'proxy', data: { event: 'userLeftCompany', companyId } }, '*');
                this.store.dispatch(getUserDetails({ request: this.authToken() }));
            }
        });

        this.store.dispatch(leaveCompany({ companyId, authToken: this.authToken() }));
    }

    public get displayMobile(): string {
        const value = this.clientForm.get('mobile')?.value;
        if (!value || value === '--Not Provided--') {
            return '';
        }
        return value;
    }

    public startEditMobile(): void {
        this.resetMobileOtpState();
        this.isEditingMobile.set(true);
        const mobileControl = this.clientForm.get('mobile');
        mobileControl.enable();
        if (mobileControl.value === '--Not Provided--') {
            mobileControl.setValue('');
        }
        this.cdr.detectChanges();
    }

    public cancelEditMobile(): void {
        this.isEditingMobile.set(false);
        this.resetMobileOtpState();
        const mobileControl = this.clientForm.get('mobile');
        mobileControl.setValue(this.previousMobile);
        mobileControl.disable();
        this.cdr.detectChanges();
    }

    public getMobileIdentifier(): string {
        const mobileControl = this.clientForm.get('mobile');
        const value = mobileControl?.disabled ? mobileControl.getRawValue() : mobileControl?.value;
        return this.normalizeMobileDigits(value ?? '');
    }

    public isProfileMobileValid(): boolean {
        return this.getProfileMobileValidationError() === null;
    }

    public getProfileMobileValidationError(): string | null {
        const digits = this.getMobileIdentifier();

        if (!digits) {
            return 'Mobile number is required.';
        }

        if (!/^\d+$/.test(digits)) {
            return 'Mobile number must contain digits only.';
        }

        try {
            const parsed = phoneUtil.parse(`+${digits}`, undefined);
            const countryCode = parsed.getCountryCode();

            if (!countryCode) {
                return 'Enter a valid country code (e.g. 91 for India).';
            }

            if (!phoneUtil.isValidNumber(parsed)) {
                const nationalNumber = parsed.getNationalNumber()?.toString() ?? '';
                if (!nationalNumber) {
                    return 'Enter a valid country code with your mobile number.';
                }
                return 'Enter a valid mobile number for the country code.';
            }

            return null;
        } catch {
            return 'Enter a valid mobile number with country code (e.g. 919876543210).';
        }
    }

    public onMobileBlur(): void {
        const mobileControl = this.clientForm.get('mobile');
        const digits = this.getMobileIdentifier();
        if (digits !== mobileControl?.value) {
            mobileControl?.setValue(digits, { emitEvent: false });
        }
        this.cdr.detectChanges();
    }

    public onMobileKeypress(event: KeyboardEvent): void {
        const char = event.key;
        if (char.length === 1 && !/[0-9]/.test(char)) {
            event.preventDefault();
        }
    }

    public numberChanged(): void {
        this.isMobileOtpSent = false;
        this.isMobileOtpVerified = false;
        this.otpVerificationToken = '';
        this.otpForm.reset();
        this.unlockMobileInput();
        this.cdr.detectChanges();
    }

    private lockMobileInput(): void {
        this.isNumberChanged = true;
        this.clientForm.get('mobile')?.disable({ emitEvent: false });
    }

    private unlockMobileInput(): void {
        this.isNumberChanged = false;
        if (this.isEditingMobile()) {
            this.clientForm.get('mobile')?.enable({ emitEvent: false });
        }
    }

    public getOtp(): void {
        this.sendOtp(false);
    }

    public resendOtp(): void {
        this.sendOtp(true);
    }

    private sendOtp(isResend: boolean): void {
        const mobileControl = this.clientForm.get('mobile');
        if (mobileControl.errors?.otpVerificationFailed) {
            mobileControl.setErrors(null);
        }
        mobileControl.markAsTouched();
        this.showMobileValidation = true;
        if (!this.isProfileMobileValid()) {
            this.cdr.detectChanges();
            return;
        }
        const currentMobile = this.getMobileIdentifier();
        if (isResend && currentMobile !== this.lastSentMobileNumber) {
            this.stopResendTimer();
            this.canResendOtp = true;
            this.lastSentMobileNumber = currentMobile;
        }
        if (!this.canResendOtp) {
            return;
        }
        this.getOtpError = '';
        this.store.dispatch(
            sendOtpAction({
                request: {
                    authToken: this.authToken(),
                    identifier: currentMobile,
                },
            })
        );
    }

    public verifyOtp(): void {
        const otpValues = this.otpForm.value;
        const otpArray = [otpValues.otp1, otpValues.otp2, otpValues.otp3, otpValues.otp4];
        const otpString = otpArray.filter((val) => val && val.trim() !== '').join('');

        if (otpString.length === 4) {
            this.store.dispatch(
                verifyOtpAction({
                    request: {
                        authToken: this.authToken(),
                        identifier: this.getMobileIdentifier(),
                        otp: otpString,
                    },
                })
            );
        }
    }

    public onMobileInput(): void {
        if (this.isNumberChanged) {
            return;
        }
        this.isMobileOtpSent = false;
        this.isMobileOtpVerified = false;
        this.otpVerificationToken = '';
        this.getOtpError = '';
        this.showMobileValidation = false;
        this.otpForm.reset();
        const value = this.getMobileIdentifier();
        if (value !== this.lastSentMobileNumber) {
            this.stopResendTimer();
            this.canResendOtp = true;
        }
        this.cdr.detectChanges();
    }

    public onOtpInput(event: Event, controlName: string, nextInput?: HTMLInputElement): void {
        const input = event.target as HTMLInputElement;
        let value = input.value;
        if (!/^\d*$/.test(value)) {
            value = value.replace(/\D/g, '');
            input.value = value;
        }
        this.otpForm.get(controlName).setValue(value);
        if (this.otpError) {
            this.otpError = '';
        }
        this.cdr.detectChanges();
        if (value && nextInput) {
            nextInput.focus();
        }
    }

    public onOtpKeyup(event: Event, controlName: string): void {
        const input = event.target as HTMLInputElement;
        this.otpForm.get(controlName).setValue(input.value);
        this.cdr.detectChanges();
    }

    public onOtpKeydown(event: KeyboardEvent, prevInput?: HTMLInputElement): void {
        const input = event.target as HTMLInputElement;
        if (event.key === 'Backspace' && !input.value && prevInput) {
            event.preventDefault();
            prevInput.focus();
            prevInput.select();
        }
    }

    public onOtpPaste(event: ClipboardEvent): void {
        event.preventDefault();
        const pastedData = event.clipboardData?.getData('text/plain') ?? '';
        const otpDigits = pastedData.replace(/\D/g, '').slice(0, 4).split('');
        const otpFields = ['otp1', 'otp2', 'otp3', 'otp4'] as const;
        otpFields.forEach((field) => this.otpForm.get(field).setValue(''));
        otpDigits.forEach((digit, index) => {
            if (index < 4) {
                this.otpForm.get(otpFields[index]).setValue(digit);
            }
        });
        if (this.otpError) {
            this.otpError = '';
        }
        this.cdr.detectChanges();
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

    private extractApiErrorMessage(errorResponse: any): string {
        return (
            errorResponse?.errors?.message ||
            errorResponse?.data?.message ||
            errorResponse?.error?.errors?.message ||
            errorResponse?.error?.data?.message ||
            errorResponse?.error?.message ||
            errorResponse?.message ||
            'An error occurred'
        );
    }

    private focusFirstOtpInput(): void {
        const input =
            this.otp1Ref?.nativeElement ||
            (this.editDialogPortalEl?.nativeElement.querySelector('.mobile-otp-container input') as HTMLInputElement);

        input?.focus();
    }

    private resetMobileOtpState(): void {
        this.isMobileOtpVerified = false;
        this.isMobileOtpSent = false;
        this.showMobileValidation = false;
        this.otpError = '';
        this.getOtpError = '';
        this.lastSentMobileNumber = '';
        this.otpVerificationToken = '';
        this.otpForm.reset();
        this.stopResendTimer();
        this.unlockMobileInput();
        this.store.dispatch(
            resetAnyState({
                request: {
                    getOtpInProcess: false,
                    getOtpSuccess: false,
                    verifyOtpV2InProcess: false,
                    verifyOtpV2Success: false,
                    apiErrorResponse: null,
                    errors: null,
                },
            })
        );
    }

    private normalizeMobileDigits(mobile: string): string {
        return (mobile ?? '').replace(/\D/g, '');
    }

    public openEditDialog(): void {
        this.isEditingMobile.set(false);
        this.resetMobileOtpState();
        this.clientForm.get('mobile').disable();
        this.isEditing.set(true);
        this.cdr.detectChanges();
        setTimeout(() => {
            if (this.editDialogPortalEl?.nativeElement) {
                this.editDialogRef = this.widgetPortal.attach(this.editDialogPortalEl.nativeElement);
                this.editDialogRef.onDetach(() => {
                    this.editDialogRef = null;
                    this.cancelEdit();
                });
            }
        });
    }

    public cancelEdit() {
        this.editDialogRef?.detach();
        this.editDialogRef = null;
        this.isEditing.set(false);
        this.isEditingMobile.set(false);
        this.resetMobileOtpState();
        this.clientForm.get('name').setValue(this.previousName);
        this.clientForm.get('mobile').setValue(this.previousMobile);
        this.clientForm.get('mobile').disable();
    }

    updateUser() {
        const nameControl = this.clientForm.get('name');
        const mobileControl = this.clientForm.get('mobile');
        const enteredName = nameControl?.value?.trim();
        const enteredMobile = this.isEditingMobile() ? this.getMobileIdentifier() : (mobileControl?.value ?? '').trim();
        const nameChanged = enteredName !== this.previousName;
        const mobileChanged = this.isEditingMobile() && enteredMobile !== this.previousMobile;

        if (!nameChanged && !mobileChanged) {
            this.editDialogRef?.detach();
            this.editDialogRef = null;
            this.isEditing.set(false);
            this.isEditingMobile.set(false);
            mobileControl.disable();
            return;
        }

        if (nameChanged && (!enteredName || nameControl.invalid)) {
            return;
        }

        if (mobileChanged && enteredMobile && !this.isProfileMobileValid()) {
            mobileControl.markAsTouched();
            this.showMobileValidation = true;
            this.cdr.detectChanges();
            return;
        }

        if (mobileChanged && !this.isMobileOtpVerified) {
            mobileControl.setErrors({ otpVerificationFailed: true });
            this.cdr.detectChanges();
            return;
        }

        if (!navigator.onLine) {
            this.errorMessage = 'Something went wrong';
            this.clear();
            return;
        }

        this.update$.pipe(skip(1), filter(Boolean), take(1)).subscribe((res) => {
            if (res) {
                this.editDialogRef?.detach();
                this.editDialogRef = null;
                this.isEditing.set(false);
                this.isEditingMobile.set(false);
                this.resetMobileOtpState();
                if (nameChanged) {
                    this.previousName = enteredName;
                }
                if (mobileChanged) {
                    this.previousMobile = enteredMobile;
                }
                mobileControl.setValue(this.previousMobile);
                mobileControl.disable();
                this.cdr.detectChanges();
                this.toastService.success('Information successfully updated');
            }
        });

        this.error$.pipe(skip(1), filter(Boolean), take(1)).subscribe((err) => {
            if (err?.[0]) this.toastService.error(err[0]);
        });

        this.store.dispatch(
            updateUser({
                name: enteredName || this.previousName,
                authToken: this.authToken(),
                ...(mobileChanged && {
                    mobile: enteredMobile,
                    otpVerificationToken: this.otpVerificationToken,
                }),
            })
        );

        if (nameChanged) {
            window.parent.postMessage({ type: 'proxy', data: { event: 'userNameUpdated', enteredName } }, '*');
        }
    }

    public clear() {
        this.toastService.error('Something went wrong');
        setTimeout(() => {
            this.errorMessage = '';
        }, 3000);
    }
}
