import {
    AbstractControl,
    ControlValueAccessor,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    NgControl,
    Validators,
} from '@angular/forms';
import { Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, Optional, Self, ViewChild } from '@angular/core';
import { countries } from './country';
import { MatFormField, MatFormFieldAppearance, MatFormFieldControl } from '@angular/material/form-field';
import { Subject, Subscription } from 'rxjs';
import { FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { DIAL_CODE_REGEX, ONLY_INTEGER_REGEX } from '@proxy/regex';

export class PhoneNumber {
    constructor(public countryIso2: string, public phonenumber: string) {}
}

@Component({
    selector: 'phone-number-control',
    templateUrl: './phone-number-control.html',
    styleUrls: ['./phone-number-control.scss'],
    providers: [
        {
            provide: MatFormFieldControl,
            useExisting: PhoneNumberControl,
        },
    ],
    host: {
        '[class.example-floating]': 'shouldLabelFloat',
        '[id]': 'id',
        '(blur)': 'onTouched()',
    },
})
export class PhoneNumberControl implements ControlValueAccessor, MatFormFieldControl<PhoneNumber>, OnDestroy, OnInit {
    isOpen: boolean = false;
    _appearance: MatFormFieldAppearance = this.parentFormField?._appearance;
    @ViewChild('code', { static: true }) codeInput;
    @ViewChild('phoneNumber', { static: true }) phoneNumberInput;
    @Input() appurl: string = '';

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
        this._disabled ? this.phoneForm.disable() : this.phoneForm.enable();
        if (this._disabled) {
            this.isOpen = false;
        }
        this.stateChanges.next();
    }

    private _disabled = false;

    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(req) {
        this._required = coerceBooleanProperty(req);
        this.stateChanges.next();
    }

    private _required = false;

    @Input()
    get placeholder(): string {
        return this._placeholder;
    }

    set placeholder(plh) {
        this._placeholder = plh;
        this.stateChanges.next();
    }

    private _placeholder = '';

    @Input()
    get value(): PhoneNumber | null {
        const n: any = this.phoneForm.getRawValue();
        if (n.countryIso2 && n.dial_code && n.phonenumber) {
            return new PhoneNumber(n.countryIso2, n.dial_code + n.phonenumber);
        }
        return null;
    }

    set value(tel: PhoneNumber | null) {
        let countryIso2 = '' || tel?.countryIso2;
        let dial_code = '';
        let phonenumber = '';
        if (tel?.phonenumber?.startsWith('+')) {
            const twoDigit = tel?.phonenumber.replace(/ /g, '').substr(0, 3);
            const threeDigit = tel?.phonenumber.replace(/ /g, '').substr(0, 4);
            const fourDigit = tel?.phonenumber.replace(/ /g, '').substr(0, 5);
            const i2 = this.countries.findIndex((x) => x.dial_code?.replace(/ /g, '') === twoDigit);
            const i3 = this.countries.findIndex((x) => x.dial_code?.replace(/ /g, '') === threeDigit);
            const i4 = this.countries.findIndex((x) => x.dial_code?.replace(/ /g, '') === fourDigit);
            if (i2 > -1) {
                countryIso2 = this.countries[i2].code;
                dial_code = this.countries[i2].dial_code || '';
                phonenumber = tel?.phonenumber.substr(3);
            }
            if (i3 > -1) {
                countryIso2 = this.countries[i3].code;
                dial_code = this.countries[i3].dial_code || '';
                phonenumber = tel?.phonenumber.substr(4);
            }
            if (i4 > -1) {
                countryIso2 = this.countries[i4].code;
                dial_code = this.countries[i4].dial_code || '';
                phonenumber = tel?.phonenumber.substr(5);
            }
        } else if (tel) {
            phonenumber = tel.phonenumber;
            dial_code =
                this.countries.find((x) => x.code.toUpperCase() === tel.countryIso2?.toUpperCase())?.dial_code || '';
            countryIso2 = tel.countryIso2;
        }
        if (this.countries.find((x) => x.code === countryIso2)) {
            this.selectCountry(this.countries.find((x) => x.code === countryIso2));
        }
        this.phoneForm.patchValue({ countryIso2, dial_code, phonenumber });
        this.phoneForm.updateValueAndValidity();
        this.stateChanges.next();
    }

    get empty(): boolean {
        const n = this.phoneForm.value;
        return !n.phonenumber && !n.dial_code;
    }

    @Input('aria-describedby') describedBy = '';

    @HostBinding('class.floating')
    get shouldLabelFloat(): boolean {
        return this.focused || !this.empty || this.isOpen;
    }

    constructor(
        fb: UntypedFormBuilder,
        private fm: FocusMonitor,
        private elRef: ElementRef<HTMLElement>,
        @Optional() @Self() public ngControl: NgControl,
        @Optional() public parentFormField: MatFormField
    ) {
        this.phoneForm = fb.group({
            countryIso2: new UntypedFormControl('', [Validators.required]),
            dial_code: new UntypedFormControl('', [Validators.pattern(DIAL_CODE_REGEX), Validators.required]),
            phonenumber: new UntypedFormControl('', [Validators.pattern(ONLY_INTEGER_REGEX)]),
        });
        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }
    }

    get errorState(): boolean {
        return (this.phoneForm.invalid && this.phoneForm.dirty) || this.ngControl?.invalid;
    }

    static nextId = 0;

    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_required: BooleanInput;
    phoneForm: UntypedFormGroup;
    countries = countries;
    stateChanges = new Subject<void>();
    focused = false;
    controlType = 'phone-number-control';
    hideCountryList = true;
    private subscription: Subscription | undefined;
    private subscription2: Subscription | undefined;
    private subscription3: Subscription | undefined;
    public selectedCountry: any;
    @HostBinding() id = `phone-number-control-${PhoneNumberControl.nextId++}`;

    onChange = (_: any) => {};
    onTouched = () => {};

    ngOnInit(): void {
        this.fm.monitor(this.codeInput).subscribe((origin) => {
            this.focused = !!origin;
            this.stateChanges.next();
        });
        this.fm.monitor(this.phoneNumberInput).subscribe((origin) => {
            this.focused = !!origin;
            this.stateChanges.next();
        });
        this.subscription = this.phoneForm.get('countryIso2')?.valueChanges.subscribe((res) => {
            if (res?.length) {
                const dialCode = this.countries.find((x) => x.code === res)?.dial_code;
                this.selectedCountry = this.countries.find((x) => x.code === res);
                if (this.phoneForm.get('dial_code')?.value !== dialCode) {
                    this.phoneForm.get('dial_code')?.setValue(dialCode);
                    this.phoneForm.updateValueAndValidity();
                }
            }
        });
        this.subscription2 = this.phoneForm.get('dial_code')?.valueChanges.subscribe((res) => {
            if (res?.length) {
                const countryIso2 = this.countries.find((x) => x.dial_code === res)?.code;
                this.selectedCountry = this.countries.find((x) => x.dial_code === res);
                if (this.phoneForm.get('countryIso2')?.value !== countryIso2) {
                    this.phoneForm.get('countryIso2')?.setValue(countryIso2);
                    this.phoneForm.updateValueAndValidity();
                }
            }
        });
        this.subscription3 = this.phoneForm.valueChanges.subscribe((res) => {
            if (res.countryIso2 && res.dial_code && res.phonenumber) {
                this.onChange({ countryIso2: res.countryIso2 || '', phonenumber: res.dial_code + res.phonenumber });
            } else {
                this.onChange(null);
            }
        });
    }

    ngOnDestroy(): void {
        this.stateChanges.complete();
        this.fm.stopMonitoring(this.codeInput);
        this.fm.stopMonitoring(this.phoneNumberInput);
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.subscription2) {
            this.subscription2.unsubscribe();
        }
        if (this.subscription3) {
            this.subscription3.unsubscribe();
        }
    }

    writeValue(tel: PhoneNumber | null): void {
        this.value = tel;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    _handleInput(control: AbstractControl, nextElement?: HTMLInputElement): void {
        this.autoFocusNext(control, nextElement);
        this.onChange(this.value);
    }

    autoFocusNext(control: AbstractControl, nextElement?: HTMLInputElement): void {
        if (!control.errors && nextElement) {
            this.fm.focusVia(nextElement, 'program');
        }
    }

    autoFocusPrev(control: AbstractControl, prevElement: HTMLInputElement): void {
        console.log('called');
        if (control.value.length < 1) {
            this.fm.focusVia(prevElement, 'program');
        }
    }

    onContainerClick(event: MouseEvent): void {
        if (this.shouldLabelFloat && !this.focused) {
            this.fm.focusVia(this.phoneNumberInput, 'program');
        }
    }

    setDescribedByIds(ids: string[]): void {
        const controlElement = this.elRef.nativeElement.querySelector('.phone-number-control-container');
        controlElement?.setAttribute('aria-describedby', ids.join(' '));
    }

    selectCountry(country: any): void {
        this.phoneForm.get('countryIso2')?.setValue(country?.code);
        this.phoneForm.updateValueAndValidity();
        this.selectedCountry = country;
        if (this.focused) {
            this.fm.focusVia(this.phoneNumberInput, 'program');
        }
    }

    blockKeys(event: KeyboardEvent | ClipboardEvent, allowPlus: boolean = false): boolean | void {
        let text;
        if (event instanceof KeyboardEvent) {
            text = event.key;
        } else if (event instanceof ClipboardEvent) {
            text = event.clipboardData?.getData('text');
        }
        if (allowPlus && !text?.match(/^[0-9\+]*$/)) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            return false;
        } else if (!allowPlus && !text?.match(/^[0-9]*$/)) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            return false;
        }
    }

    public openCountryFlag(): void {
        setTimeout(() => {
            this.isOpen = true;
        }, 300);
    }
}
