import {
    AbstractControl,
    AsyncValidatorFn,
    FormControl,
    UntypedFormControl,
    UntypedFormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import {
    NON_LATIN_UNICODE_REGEX,
    START_WITH_ALPHABET,
    CONTENT_BETWEEEN_HASH_TAG_REGEX,
    NON_ASCII_PRINTABLE_CHARACTERS_REGEX,
} from '@proxy/regex';
import { getInvalidEmailVariables, maxVariableLengthCheck, minVariableLengthCheck } from '@proxy/utils';
import { cloneDeep } from 'lodash-es';
import { Observable, of } from 'rxjs';

export class CustomValidators {
    public static multipleEmailValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (!control || (control && !control.value)) {
            return null;
        }
        const emails = (control.value || '').split(',');
        const forbidden = emails.some((email: any) => Validators.email(new UntypedFormControl(email)));
        return forbidden ? { multipleemails: true } : null;
    }

    public static containsOnlyVariables(control: AbstractControl): { [key: string]: boolean } | null {
        if (!control || (control && !control.value)) {
            return null;
        }
        let newContent = cloneDeep(control.value || '');
        let matchContent = newContent.match(CONTENT_BETWEEEN_HASH_TAG_REGEX);
        if (!matchContent) {
            return null;
        }
        while (matchContent) {
            newContent = newContent.replace(CONTENT_BETWEEEN_HASH_TAG_REGEX, '');
            matchContent = newContent.match(CONTENT_BETWEEEN_HASH_TAG_REGEX);
        }
        return !newContent.trim().length ? { containsOnlyVariables: true } : null;
    }

    public static emailVariableCheck(
        control: FormControl<string>
    ): { [s: string]: { invalidVar?: string[]; errorMessage: string } } | null {
        let invalidVar = [];
        if (!minVariableLengthCheck(control?.value)) {
            return {
                emailVariableCheck: {
                    errorMessage: '#### is not allowed, Variable must contain atleast one character',
                },
            };
        }
        invalidVar = getInvalidEmailVariables(control?.value);
        if (invalidVar.length) {
            return {
                emailVariableCheck: {
                    invalidVar,
                    errorMessage:
                        'Variables must contain only alphanumeric, dashes, underscores and must start with alphabet only',
                },
            };
        }
        invalidVar = maxVariableLengthCheck(control?.value);
        if (invalidVar.length) {
            return {
                emailVariableCheck: {
                    invalidVar,
                    errorMessage: 'Variables must not contain more than 32 characters',
                },
            };
        }
        return null;
    }

    public static noWhitespaceValidator(control: AbstractControl): { [key: string]: any } | null {
        const controlValue = typeof control.value !== 'string' ? String(control.value) : control.value;
        const isEmpty = (controlValue || '').length === 0;
        const isWhitespace = (controlValue || '').trim().length === 0;
        const isNewLines = (controlValue || '').replace(/^\n+|\n+$/g, '').length === 0;
        const isValid = !isWhitespace && !isNewLines;
        return isValid || isEmpty ? null : { whitespace: 'value is only whitespace' };
    }

    public static noWhitespaceValidatorAsync(): AsyncValidatorFn {
        return (control: AbstractControl): Promise<ValidationErrors | null> => {
            const value: string = control.value;
            const hasWhitespace = /\s/.test(value);

            return hasWhitespace ? Promise.resolve({ whitespace: true }) : Promise.resolve(null);
        };
    }

    public static hasOnlySpaceAsync(): AsyncValidatorFn {
        return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
            const value = control.value;
            if (!value || value.length === 0) {
                return of(null);
            }
            // Check if the input value is only spaces
            const isSpaceOnly = value.trim().length === 0;

            // Return an error if the input value is only spaces
            if (isSpaceOnly) {
                return of({ hasOnlySpace: true });
            }

            // Return null if the validation passes
            return of(null);
        };
    }

    public static noStartEndDashValidator(control: AbstractControl): { [key: string]: any } | null {
        const controlValue = typeof control.value !== 'string' ? String(control.value) : control.value;
        const isEmpty = (controlValue || '').length === 0;
        const isValid =
            controlValue.length && controlValue[0] !== '-' && controlValue[controlValue.length - 1] !== '-'
                ? true
                : false;
        return isValid || isEmpty ? null : { noStartEndDashValidator: true };
    }

    public static passwordsMatch(group: UntypedFormGroup, formControlName: string) {
        return (control: UntypedFormControl): { [s: string]: boolean } | null => {
            if (control.value && group && group.controls[formControlName].value === control.value) {
                return null;
            }
            return { mismatch: true };
        };
    }

    public static passwordsMatchWithConfirm(group: UntypedFormGroup, formControlName: string) {
        return (control: UntypedFormControl): { [s: string]: boolean } => {
            if (control.value && group && group.controls[formControlName].value === control.value) {
                return { mismatchwithconfirm: false };
            }
            return { mismatchwithconfirm: true };
        };
    }

    // custom validator to check that two fields match
    public static MustMatch(controlName: string, matchingControlName: string) {
        return (formGroup: UntypedFormGroup) => {
            const control = formGroup.controls[controlName];
            const matchingControl = formGroup.controls[matchingControlName];

            if (matchingControl.errors && !matchingControl.errors.mustMatch) {
                // return if another validator has already found an error on the matchingControl
                return;
            }

            // set error on matchingControl if validation fails
            if (control.value !== matchingControl.value) {
                matchingControl.setErrors({ mustMatch: true });
            } else {
                matchingControl.setErrors(null);
            }
        };
    }

    public static OR(
        val1: (control: any) => { [s: string]: boolean },
        val2: (control: any) => { [s: string]: boolean }
    ) {
        return (control: any) => {
            let res = val1(control);
            if (!res) {
                return null;
            } else {
                res = val2(control);
                if (!res) {
                    return null;
                }
                return res;
            }
        };
    }

    public static validUrl(control: UntypedFormControl): { [s: string]: boolean } | null {
        if (!control.value) {
            return null;
        }
        const valid =
            /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/.test(
                control.value
            );
        return valid ? null : { url: true };
    }

    public static validJson(control: UntypedFormControl): { [s: string]: boolean } | null {
        try {
            JSON.parse(control.value);
        } catch (e) {
            return { json: true };
        }
        return null;
    }

    public static cannotContainSpace(control: UntypedFormControl): { [s: string]: boolean } | null {
        if (control.value && (control.value as string).indexOf(' ') >= 0) {
            return { cannotContainSpace: true };
        }
        return null;
    }

    public static startWithAlpha(control: UntypedFormControl): { [s: string]: boolean } | null {
        if (control.value && !START_WITH_ALPHABET.test(control.value)) {
            return { startWithAlpha: true };
        }
        return null;
    }

    public static noStartEndSpaces(control: UntypedFormControl): { [s: string]: boolean } | null {
        if (control.value && (control.value.toString().startsWith(' ') || control.value.toString().endsWith(' '))) {
            return { noStartEndSpaces: true };
        }
        return null;
    }

    public static noStartEndHyphenOrUnderscore(control: UntypedFormControl): { [s: string]: boolean } | null {
        if (
            control?.value?.toString()?.startsWith('_') ||
            control?.value?.toString()?.endsWith('_') ||
            control?.value?.toString()?.startsWith('-') ||
            control?.value?.toString()?.endsWith('-')
        ) {
            return { noStartEndHyphenOrUnderscore: true };
        }
        return null;
    }

    public static noStartEndSpacesFroalaContain(control: UntypedFormControl): { [s: string]: boolean } | null {
        const value = (control.value || '')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, '')
            .trim();
        if (!value) {
            return { noStartEndSpacesFroalaContain: true };
        }
        if (value && (value.toString().startsWith(' ') || value.toString().endsWith(' '))) {
            return { noStartEndSpacesFroalaContain: true };
        }
        return null;
    }

    public static onlySpaceFroalaContain(control: UntypedFormControl): { [s: string]: boolean } | null {
        const value = (control.value || '')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, '')
            .trim();
        if (!value && !(control.value || '').includes('<img')) {
            return { onlySpaceFroalaContain: true };
        }
        return null;
    }

    public static noStartEndSlash(control: UntypedFormControl): { [s: string]: boolean } | null {
        if (control.value && (control.value.toString().startsWith('/') || control.value.toString().endsWith('/'))) {
            return { noStartEndSlash: true };
        }
        return null;
    }

    public static files(files: string[]) {
        return (control: { value: string }): { [s: string]: boolean } | null => {
            if (control.value && !files.includes(control.value)) {
                return { files: true };
            }
            return null;
        };
    }

    public static minLengthThreeWithoutSpace(control: UntypedFormControl): { [s: string]: boolean } | null {
        if (control.value && control.value.trim()?.length < 3) {
            return { minlengthWithSpace: true };
        }
        return null;
    }

    public static minLengthFourWithoutSpace(control: UntypedFormControl): { [s: string]: boolean } | null {
        if (control.value && control.value.trim()?.length < 4) {
            return { minlengthWithSpace: true };
        }
        return null;
    }

    public static websiteCount(control: AbstractControl): { [key: string]: any } | null {
        return control.value
            .split(',')
            .filter((e: { trim: () => { (): any; new (): any; length: any } }) => e.trim().length).length > 2
            ? { count: 'Only 2 websites are allowed.' }
            : null;
    }

    public static valueExist(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (!control || !control.parent) {
                return null;
            }
            const currentValue = control.value.trim();
            const currentExist = control.root.value.map((p: any) => p.ip).includes(currentValue);
            if (currentExist && currentValue.length) {
                return { currentExist: true };
            }
            return null;
        };
    }

    public static removeNullKeys(requestObject: any): any {
        return Object.entries(requestObject).reduce((a, [k, v]) => (v === null ? a : (((a as any)[k] = v), a)), {});
    }

    public static elementExistsInList(list: Array<any>, key?: any): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value) {
                let value: any;
                if (key) {
                    value = control.value[key];
                } else {
                    value = control.value;
                }
                if (!list.find((val) => val === value)) {
                    return { elementExistsInList: true };
                }
            }
            return null;
        };
    }

    public static minSelected(count?: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value) {
                if (control.value?.length < (count ?? 1)) {
                    return { minSelected: true };
                }
            }
            return null;
        };
    }

    public static checkTextType(type: 'Unicode' | 'Normal'): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value) {
                const nonLatinCharacters = control.value.match(new RegExp(NON_LATIN_UNICODE_REGEX, 'gm'));
                return nonLatinCharacters?.length
                    ? type === 'Unicode'
                        ? null
                        : { checkTextType: true, invalidCharacters: nonLatinCharacters }
                    : type === 'Normal'
                    ? null
                    : { checkTextType: true };
            }
            return null;
        };
    }

    public static onlyAsciiPrintable(control: AbstractControl): { [key: string]: any } | null {
        if (control.value) {
            const nonAsciiPrintableCharacters = control.value.match(
                new RegExp(NON_ASCII_PRINTABLE_CHARACTERS_REGEX, 'gm')
            );
            if (nonAsciiPrintableCharacters) {
                return { onlyAsciiPrintable: { invalidCharacters: nonAsciiPrintableCharacters } };
            }
        }
        return null;
    }

    public static onlyOneOccurrence(regex: RegExp): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value && control.value.match(regex)?.length > 1) {
                return { onlyOneOccurrence: true };
            }
            return null;
        };
    }
    /**
     * Grater than utility method to return error when current control is greater than
     * target control
     *
     * @static
     * @param {string} currentControlName Current control name for comparison
     * @param {string} targetControlName Target control name for comparison
     * @return {*}  {ValidatorFn} Validator function with the result of comparison
     * @memberof CustomValidators
     */
    public static greaterThan(
        currentControlName: string,
        targetControlName: string,
        multiplier: number = 1,
        currency: string = ''
    ): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control && control.get(currentControlName) && control.get(targetControlName)) {
                const currentValue = control.get(currentControlName)?.value;
                const targetValue = control.get(targetControlName)?.value;
                const currencyValue = control.get(currency)?.value;
                if (targetValue > 0 && currentValue > targetValue * multiplier) {
                    control.get(currentControlName)?.setErrors({ limitExceeded: true });
                    control.get(currentControlName)?.markAsTouched();
                    return { limitExceeded: true };
                } else if (targetValue === 0 && (currencyValue === 1 || currency === 'INR') && currentValue > 5000) {
                    control.get(currentControlName)?.setErrors({ limitExceeded: { limitValue: 5000 } });
                    control.get(currentControlName)?.markAsTouched();
                    return { limitExceeded: { limitValue: 5000 } };
                } else if (
                    targetValue === 0 &&
                    (currencyValue !== 1 || currency === 'USD' || currency === 'GBP') &&
                    currency !== 'INR' &&
                    currentValue > 100
                ) {
                    control.get(currentControlName)?.setErrors({ limitExceeded: { limitValue: 100 } });
                    control.get(currentControlName)?.markAsTouched();
                    return { limitExceeded: { limitValue: 100 } };
                }
                control.get(currentControlName)?.setErrors(null);
                return null;
            }
            return null;
        };
    }

    /**
     * Validates the JSON if it is provided else no error
     *
     * @static
     * @param {FormControl<string>} control Form Control instance
     * @return {({ [s: string]: boolean } | null)} Error or null based on validation
     * @memberof CustomValidators
     */
    public static validateJsonIfProvided(control: FormControl<string>): { [s: string]: boolean } | null {
        if (control.value) {
            return CustomValidators.validJson(control);
        }
        return null;
    }

    public static noStartEndCharacter(character: string = ''): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control?.value.toString().startsWith(character) || control.value.toString().endsWith(character)) {
                return { noStartEndCharacter: true };
            }
            return null;
        };
    }
    public static limitCountByPattern(character: string = '', maxCount: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control?.value.toString()) {
                const value = control?.value.toString();
                return value.split(character).length > maxCount
                    ? { limitCountByPattern: true, maxLimitCount: maxCount }
                    : null;
            }
            return null;
        };
    }

    public static atleastOneValueInChipList(list: Set<any>): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (!list?.size) {
                return { atleastOneValueInChipList: true };
            }
            return null;
        };
    }

    /**
     * Compare value of control with other control value and return error if not equal
     *
     * @static
     * @param {string} [controlPath] Control Name/Path Eg. 'password' or 'user.password' (control should be in same parent)
     * @param {FormControl<any>} [formControl] FormControl to Compare with
     * @return {*}  {ValidatorFn}
     * @memberof CustomValidators
     */
    public static valueSameAsControl(controlPath?: string, formControl?: FormControl<any>): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let otherControl;
            if (formControl) {
                otherControl = formControl;
            } else if (controlPath) {
                otherControl = control?.parent?.get(controlPath ?? '');
            } else {
                throw new Error('Provide controlPath or formControl');
            }
            if (!otherControl) {
                return null;
            }
            if (control.value && control.value !== otherControl?.value) {
                return { valueSameAsControl: true };
            }
            return null;
        };
    }
}
