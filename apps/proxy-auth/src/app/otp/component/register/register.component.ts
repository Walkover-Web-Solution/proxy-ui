import { cloneDeep } from 'lodash-es';
import { OtpService } from './../../service/otp.service';
import { environment } from './../../../../environments/environment';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { resetAll } from '../../store/actions/otp.action';
import { BaseComponent } from '@proxy/ui/base-component';
import { Store } from '@ngrx/store';
import { IAppState } from '../../store/app.state';
import { IntlPhoneLib, removeEmptyKeys } from '@proxy/utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { EMAIL_REGEX, NAME_REGEX, PASSWORD_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { OtpUtilityService } from '../../service/otp-utility.service';
import { errorResolver } from '@proxy/models/root-models';
import { BehaviorSubject, takeUntil } from 'rxjs';

@Component({
    selector: 'proxy-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent extends BaseComponent implements AfterViewInit, OnDestroy, OnInit {
    @Input() public referenceId: string;
    @Input() public serviceData: any;
    @Output() public togglePopUp: EventEmitter<any> = new EventEmitter();
    @Output() public successReturn: EventEmitter<any> = new EventEmitter();
    @Output() public failureReturn: EventEmitter<any> = new EventEmitter();

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
            password: new FormControl<string>(null, [Validators.required, Validators.pattern(PASSWORD_REGEX)]),
            confirmPassword: new FormControl<string>(null, [
                Validators.required,
                Validators.pattern(PASSWORD_REGEX),
                CustomValidators.valueSameAsControl('password'),
            ]),
        }),
        company: new FormGroup({
            name: new FormControl<string>(null, [Validators.minLength(3), Validators.maxLength(50)]),
            mobile: new FormControl<string>(null),
            email: new FormControl<string>(null, Validators.pattern(EMAIL_REGEX)),
        }),
    });

    public intlClass: { [key: string]: IntlPhoneLib } = {};
    public apiError = new BehaviorSubject<string[]>(null);

    constructor(
        private store: Store<IAppState>,
        private otpService: OtpService,
        private otpUtilityService: OtpUtilityService
    ) {
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
        const parentDom = document.querySelector('proxy-auth')?.shadowRoot;
        const interval = setInterval(() => {
            if (
                count > 10 ||
                parentDom.querySelector('#init-contact-wrapper-user .iti__selected-flag')?.getAttribute('title')
            ) {
                this.initIntl('company');
                clearInterval(interval);
            }
            count += 1;
        }, 200);
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public initIntl(key: string): void {
        const parentDom = document.querySelector('proxy-auth')?.shadowRoot;
        const input = document.querySelector('proxy-auth')?.shadowRoot?.getElementById('init-contact-' + key);
        const customCssStyleURL = `${environment.baseUrl}/assets/utils/intl-tel-input-custom.css`;
        if (input) {
            this.intlClass[key] = new IntlPhoneLib(input, parentDom, customCssStyleURL);
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
        const formData = removeEmptyKeys(cloneDeep(this.registrationForm.value), true);
        const state = JSON.parse(
            this.otpUtilityService.aesDecrypt(
                this.serviceData?.state ?? '',
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
            service_id: this.serviceData?.service_id,
            url_unique_id: state?.url_unique_id,
            request_data: formData,
        };
        const encodedData = this.otpUtilityService.aesEncrypt(
            JSON.stringify(payload),
            environment.uiEncodeKey,
            environment.uiIvKey,
            true
        );
        this.otpService.register({ proxy_state: encodedData }).subscribe(
            (response) => {
                this.returnSuccess(response);
            },
            (err) => {
                this.apiError.next(errorResolver(err?.error.errors));
            }
        );
    }
}
