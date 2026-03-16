import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomValidators } from '@proxy/custom-validator';
import { BaseComponent } from '@proxy/ui/base-component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
    selector: 'proxy-create-tax-dialog',
    template: `
        <div class="d-flex justify-content-between align-items-center">
            <h2 mat-dialog-title>{{ dialogTitle }}</h2>
            <button mat-icon-button mat-dialog-close (click)="onClose()">
                <mat-icon>close</mat-icon>
            </button>
        </div>
        <mat-dialog-content class="create-tax-content">
            <div class="d-flex flex-column h-100">
                <p class="mat-body-2 text-secondary mb-3">
                    <strong>Note:</strong> New taxes will be added to the list of taxes.
                </p>

                <form [formGroup]="taxForm" class="single-form-layout">
                    <div class="form-section">
                        <div class="form-grid">
                            <ng-container *ngFor="let fieldKey of getTaxFormFields()">
                                <ng-container
                                    *ngTemplateOutlet="
                                        inputField;
                                        context: {
                                            fieldControl: taxForm.get('taxesForm').get(fieldKey),
                                            fieldConfig: getFieldConfig(fieldKey)
                                        }
                                    "
                                ></ng-container>
                            </ng-container>
                        </div>
                    </div>
                </form>
            </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button (click)="onClose()">Cancel</button>
            <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="!taxForm.valid">
                {{ submitButtonText }}
            </button>
        </mat-dialog-actions>

        <ng-template #inputField let-fieldControl="fieldControl" let-fieldConfig="fieldConfig">
            <div class="mb-3" *ngIf="fieldConfig?.type === 'checkbox'">
                <mat-slide-toggle [formControl]="fieldControl" [required]="fieldConfig?.is_required">
                    {{ fieldConfig?.label }}
                </mat-slide-toggle>
                <mat-hint *ngIf="fieldConfig?.hint" class="d-block">{{ fieldConfig?.hint }}</mat-hint>
                <mat-error *ngIf="getFieldError(fieldControl, fieldConfig)" class="d-block">{{
                    getFieldError(fieldControl, fieldConfig)
                }}</mat-error>
            </div>

            <mat-form-field appearance="outline" class="w-100 mb-3" *ngIf="fieldConfig?.type !== 'checkbox'">
                <mat-label
                    >{{ fieldConfig?.label }}
                    <span class="text-danger" *ngIf="fieldConfig?.is_required">*</span></mat-label
                >

                <!-- Text Input -->
                <input
                    *ngIf="fieldConfig?.type === 'text' || fieldConfig?.type === 'number'"
                    matInput
                    [formControl]="fieldControl"
                    [type]="fieldConfig?.type === 'number' ? 'number' : 'text'"
                    [placeholder]="fieldConfig?.placeholder || 'Enter ' + fieldConfig?.label"
                    [required]="fieldConfig?.is_required"
                />

                <!-- Chip List -->
                <ng-container *ngIf="fieldConfig?.type === 'chipList'">
                    <mat-chip-list
                        #chipList
                        [disabled]="fieldControl.disabled"
                        aria-label="{{ fieldConfig?.label }}"
                        *ngIf="fieldConfig?.label"
                    >
                        <mat-chip
                            *ngFor="let item of getChipListArray(fieldConfig?.label + '_0')"
                            (removed)="updateChipListValues('delete', fieldConfig?.label + '_0', fieldControl, item)"
                            [removable]="!getChipListReadOnlySet(fieldConfig?.label + '_0')?.has(item)"
                            disableRipple
                        >
                            {{ item }}
                            <button
                                type="button"
                                matChipRemove
                                *ngIf="!getChipListReadOnlySet(fieldConfig?.label + '_0')?.has(item)"
                            >
                                <mat-icon>cancel</mat-icon>
                            </button>
                        </mat-chip>
                        <input
                            matChipInput
                            type="text"
                            [placeholder]="
                                (getChipListArray(fieldConfig?.label + '_0')?.length || 0) > 0
                                    ? ''
                                    : 'Enter ' + fieldConfig?.label
                            "
                            autocomplete="off"
                            [formControl]="fieldControl"
                            [matChipInputFor]="chipList"
                            [matChipInputSeparatorKeyCodes]="chipListSeparatorKeysCodes"
                            (matChipInputTokenEnd)="
                                updateChipListValues('add', fieldConfig?.label + '_0', fieldControl, $event.value)
                            "
                        />
                    </mat-chip-list>
                </ng-container>

                <!-- Textarea -->
                <textarea
                    *ngIf="fieldConfig?.type === 'textarea'"
                    matInput
                    [formControl]="fieldControl"
                    [placeholder]="fieldConfig?.placeholder || 'Enter ' + fieldConfig?.label"
                    rows="3"
                    [required]="fieldConfig?.is_required"
                ></textarea>

                <!-- Select -->
                <mat-select
                    *ngIf="fieldConfig?.type === 'select'"
                    [formControl]="fieldControl"
                    [required]="fieldConfig?.is_required"
                >
                    <mat-option *ngFor="let option of getSelectOptions(fieldConfig)" [value]="option.value">
                        {{ option.label }}
                    </mat-option>
                </mat-select>

                <mat-hint *ngIf="fieldConfig?.hint">{{ fieldConfig?.hint }}</mat-hint>
                <mat-error *ngIf="getFieldError(fieldControl, fieldConfig)">{{
                    getFieldError(fieldControl, fieldConfig)
                }}</mat-error>
            </mat-form-field>
        </ng-template>
    `,
    styles: [
        `
            .create-tax-content {
                max-height: 80vh;
                overflow-y: auto;
                min-width: 600px;
            }

            .form-section {
                margin-bottom: 1rem;
            }

            .heading {
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 1rem;
                color: #333;
            }

            .form-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1rem;
            }

            .single-form-layout {
                width: 100%;
            }
        `,
    ],
})
export class CreateTaxDialogComponent extends BaseComponent implements OnInit {
    public taxForm: FormGroup;
    public formConfig: any;
    public dialogTitle: string;
    public submitButtonText: string;
    public chipListValues: { [key: string]: Set<string> } = {};
    public chipListReadOnlyValues: { [key: string]: Set<string> } = {};
    public chipListSeparatorKeysCodes: number[] = [ENTER, COMMA];

    // Cache for select options to prevent infinite calls
    private optionsCache: { [key: string]: any[] } = {};

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<CreateTaxDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            formConfig: any;
            dialogTitle?: string;
            submitButtonText?: string;
            editData?: any;
            chipListValues?: { [key: string]: Set<string> };
            optionsData?: {
                taxes: any[];
            };
        }
    ) {
        super();
        this.formConfig = data.formConfig;
        this.dialogTitle = data.dialogTitle || 'Taxes';
        this.submitButtonText = data.submitButtonText || 'Save';
        this.chipListValues = data.chipListValues || {};
    }

    ngOnInit(): void {
        try {
            this.initializeForm();
        } catch (error) {
            console.error('Error initializing dialog:', error);
        }
    }

    private initializeForm(): void {
        const taxesControls: { [key: string]: FormControl } = {};

        // Initialize taxes form controls
        if (this.formConfig?.taxesForm) {
            Object.keys(this.formConfig.taxesForm).forEach((key) => {
                const config = this.formConfig.taxesForm[key];
                const validators = this.getValidators(config);
                const initialValue = this.getInitialValue(key, config);
                taxesControls[key] = new FormControl(initialValue, validators);
            });
        }

        this.taxForm = this.fb.group({
            taxesForm: this.fb.group(taxesControls),
        });

        // Populate form with edit data if provided
        if (this.data.editData) {
            setTimeout(() => {
                this.populateFormWithEditData();
            }, 0);
        }
    }

    private getValidators(config: any): any[] {
        const validators = [];
        if (config.is_required) {
            validators.push(Validators.required);
        }
        if (config.regex) {
            validators.push(Validators.pattern(config.regex));
        }
        if (config.custom_validators) {
            config.custom_validators.forEach((validatorName: string) => {
                if (CustomValidators[validatorName]) {
                    validators.push(CustomValidators[validatorName]);
                }
            });
        }
        return validators;
    }

    private getInitialValue(key: string, config: any): any {
        // Initialize chip list values if this is a chip list field
        if (config.type === 'chipList') {
            const chipListKey = `${config.label}_0`;

            // Initialize Sets if they don't exist
            if (!this.chipListValues[chipListKey]) {
                this.chipListValues[chipListKey] = new Set<string>();
            }
            if (!this.chipListReadOnlyValues[chipListKey]) {
                this.chipListReadOnlyValues[chipListKey] = new Set<string>(config?.read_only_value || []);
            }

            return null; // Chip list form control value is always null
        }

        // Handle normal input fields
        if (this.data.editData?.taxesForm?.[key] !== undefined && this.data.editData.taxesForm[key] !== null) {
            return this.data.editData.taxesForm[key];
        }

        return config.default_value || '';
    }

    public getTaxFormFields(): string[] {
        return this.formConfig?.taxesForm ? Object.keys(this.formConfig.taxesForm) : [];
    }

    public getFieldConfig(fieldKey: string): any {
        return this.formConfig?.taxesForm?.[fieldKey];
    }

    public getSelectOptions(fieldConfig: any): any[] {
        if (!fieldConfig?.label) {
            return [];
        }

        // Check cache first to prevent infinite calls
        const cacheKey = this.getCacheKey(fieldConfig);
        if (this.optionsCache[cacheKey]) {
            return this.optionsCache[cacheKey];
        }

        let options: any[] = [];

        // Handle specific API fields using passed options data
        if (fieldConfig.label === 'Tax Codes' && this.data.optionsData?.taxes) {
            options = this.data.optionsData.taxes.map((tax: any) => ({
                label: tax.name || tax.code || tax,
                value: tax.code || tax.id || tax,
            }));
            this.optionsCache[cacheKey] = options;
        }
        // Handle source as array (like currency codes)
        else if (fieldConfig.source && Array.isArray(fieldConfig.source)) {
            options = fieldConfig.source.map((value: string) => ({
                label: value,
                value: value,
            }));
            this.optionsCache[cacheKey] = options;
        }

        return options;
    }

    private getCacheKey(fieldConfig: any): string {
        return `${fieldConfig.label}_${JSON.stringify(fieldConfig.source || '')}`;
    }

    public getChipListArray(chipListKey: string): string[] {
        if (!this.chipListValues[chipListKey]) {
            this.chipListValues[chipListKey] = new Set<string>();
        }
        return Array.from(this.chipListValues[chipListKey]);
    }

    public getChipListReadOnlySet(chipListKey: string): Set<string> {
        if (!this.chipListReadOnlyValues[chipListKey]) {
            this.chipListReadOnlyValues[chipListKey] = new Set<string>();
        }
        return this.chipListReadOnlyValues[chipListKey];
    }

    public updateChipListValues(
        action: 'add' | 'delete',
        chipListKey: string,
        formControl: FormControl,
        value: string
    ): void {
        if (!this.chipListValues[chipListKey]) {
            this.chipListValues[chipListKey] = new Set<string>();
        }

        if (action === 'add' && value && value.trim()) {
            const trimmedValue = value.trim();
            if (!this.chipListValues[chipListKey].has(trimmedValue)) {
                this.chipListValues[chipListKey].add(trimmedValue);
            }
            formControl.setValue('');
        } else if (action === 'delete') {
            this.chipListValues[chipListKey].delete(value);
        }

        formControl.updateValueAndValidity();
    }

    public getFieldError(fieldControl: FormControl, fieldConfig: any): string {
        if (!fieldControl || !fieldControl.errors || !fieldControl.touched) {
            return '';
        }

        const errors = fieldControl.errors;
        if (errors['required']) {
            return `${fieldConfig?.label || 'This field'} is required`;
        }
        if (errors['pattern']) {
            return fieldConfig?.error_message || 'Invalid format';
        }
        if (errors['custom']) {
            return errors['custom'];
        }

        return '';
    }

    private populateFormWithEditData(): void {
        if (this.data.editData?.taxesForm) {
            const taxesFormGroup = this.taxForm.get('taxesForm');
            if (taxesFormGroup) {
                taxesFormGroup.patchValue(this.data.editData.taxesForm);
            }
        }
    }

    public onSubmit(): void {
        if (this.taxForm.valid) {
            const formData = this.taxForm.value;
            this.dialogRef.close(formData.taxesForm);
        }
    }

    public onClose(): void {
        this.dialogRef.close();
    }
}
