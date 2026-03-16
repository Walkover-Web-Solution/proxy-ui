import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomValidators } from '@proxy/custom-validator';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'proxy-simple-dialog',
    template: `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 mat-dialog-title class="m-0">{{ dialogTitle }}</h2>
            <button mat-icon-button mat-dialog-close (click)="onClose()">
                <mat-icon>close</mat-icon>
            </button>
        </div>
        <mat-dialog-content>
            <form [formGroup]="metricForm" class="metric-form">
                <ng-container *ngFor="let fieldKey of getFormFields()">
                    <ng-container *ngIf="!isFieldHidden(fieldKey)">
                        <ng-container
                            *ngTemplateOutlet="
                                inputField;
                                context: {
                                    fieldControl: metricForm.get(fieldKey),
                                    fieldConfig: getFieldConfig(fieldKey)
                                }
                            "
                        ></ng-container>
                    </ng-container>
                </ng-container>
            </form>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button (click)="onClose()">Cancel</button>
            <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="!metricForm.valid">
                {{ submitButtonText }}
            </button>
        </mat-dialog-actions>

        <ng-template #inputField let-fieldControl="fieldControl" let-fieldConfig="fieldConfig">
            <div class="mb-1" *ngIf="fieldConfig?.type === 'checkbox'">
                <mat-slide-toggle [formControl]="fieldControl" [required]="fieldConfig?.is_required">
                    {{ fieldConfig?.label }}
                </mat-slide-toggle>
                <mat-hint *ngIf="fieldConfig?.hint" class="d-block">{{ fieldConfig?.hint }}</mat-hint>
                <mat-error *ngIf="getFieldError(fieldControl, fieldConfig)" class="d-block">{{
                    getFieldError(fieldControl, fieldConfig)
                }}</mat-error>
            </div>

            <mat-form-field appearance="outline" class="w-100 mb-1" *ngIf="fieldConfig?.type !== 'checkbox'">
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
})
export class SimpleDialogComponent implements OnInit {
    public metricForm: FormGroup;
    public formConfig: any;
    public dialogTitle: string;
    public submitButtonText: string;
    private optionsCache: { [key: string]: any[] } = {};

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        public dialogRef: MatDialogRef<SimpleDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            message: string;
            formConfig: any;
            dialogTitle?: string;
            submitButtonText?: string;
            editData?: any;
        }
    ) {
        this.formConfig = data.formConfig;
        this.dialogTitle = data.dialogTitle || 'Add New Item';
        this.submitButtonText = data.submitButtonText || 'Submit';
    }

    ngOnInit(): void {
        this.initializeForm();
    }

    private initializeForm(): void {
        const formControls: { [key: string]: FormControl } = {};
        Object.keys(this.formConfig).forEach((key) => {
            const config = this.formConfig[key];
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
            const initialValue = this.getInitialValue(key, config);
            formControls[key] = new FormControl(initialValue, validators);
        });

        this.metricForm = this.fb.group(formControls);

        if (this.data.editData) {
            setTimeout(() => {
                this.updateFormControlsWithEditData();
            }, 0);
        }
        this.setupConditionalValidation();
    }

    public onSubmit(): void {
        if (this.metricForm.valid) {
            this.dialogRef.close(this.metricForm.value);
        } else {
            this.metricForm.markAllAsTouched();
        }
    }

    public onClose(): void {
        this.dialogRef.close();
    }

    private updateFormControlsWithEditData(): void {
        Object.keys(this.data.editData).forEach((key) => {
            const control = this.metricForm.get(key);
            if (control && this.data.editData[key] !== undefined) {
                control.setValue(this.data.editData[key]);
                control.markAsTouched();
            }
        });
    }

    private getInitialValue(key: string, config: any): any {
        let initialValue = this.data.editData ? this.data.editData[key] || config.value || '' : config.value || '';

        if (config.type === 'select' && config.value_type === 'boolean' && typeof initialValue === 'boolean') {
            return Boolean(initialValue);
        }

        return initialValue;
    }

    public getFormFields(): string[] {
        return Object.keys(this.formConfig);
    }

    public getFieldConfig(fieldName: string): any {
        return this.formConfig[fieldName];
    }

    public getSelectOptions(fieldConfig: any): any[] {
        if (!fieldConfig?.label) {
            return [];
        }
        const cacheKey = this.getCacheKey(fieldConfig);
        if (this.optionsCache[cacheKey]) {
            return this.optionsCache[cacheKey];
        }

        let options: any[] = [];
        if (
            fieldConfig.sourceFieldLabel &&
            fieldConfig.sourceFieldValue &&
            Array.isArray(fieldConfig.sourceFieldLabel) &&
            Array.isArray(fieldConfig.sourceFieldValue)
        ) {
            options = fieldConfig.sourceFieldLabel.map((label: string, index: number) => ({
                label: label,
                value: fieldConfig.sourceFieldValue[index],
            }));
        } else if (fieldConfig.regex) {
            options = this.extractOptionsFromRegex(fieldConfig.regex);
        }
        if (fieldConfig.filter_conditions) {
            options = this.applyFilterConditions(fieldConfig, options);
        }
        this.optionsCache[cacheKey] = options;
        return options;
    }

    private extractOptionsFromRegex(regex: string): any[] {
        const match = regex.match(/\^\(([^)]+)\)\$/);
        if (match && match[1]) {
            const values = match[1].split('|');
            return values.map((value) => ({
                label: this.formatLabel(value),
                value: value,
            }));
        }

        const optionalMatch = regex.match(/\^\(([^)]+)\)\?\$/);
        if (optionalMatch && optionalMatch[1]) {
            const values = optionalMatch[1].split('|');
            return [
                { label: 'None', value: '' },
                ...values.map((value) => ({
                    label: this.formatLabel(value),
                    value: value,
                })),
            ];
        }

        return [];
    }

    public getFieldError(fieldControl: any, fieldConfig: any): string {
        if (fieldControl?.errors && fieldControl.touched) {
            if (fieldControl.errors['required']) {
                return `${fieldConfig?.label} is required`;
            }
            if (fieldControl.errors['pattern']) {
                return `Invalid format for ${fieldConfig?.label}`;
            }
        }
        return '';
    }

    public isFieldRequired(fieldName: string): boolean {
        return this.formConfig[fieldName]?.is_required || false;
    }

    public isFieldHidden(fieldName: string): boolean {
        if (this.formConfig[fieldName]?.is_hidden) {
            return true;
        }

        // Special case for field_name: hide when recurring is true and aggregation_type is count_agg
        if (fieldName === 'field_name') {
            const recurringValue = this.metricForm?.get('recurring')?.value;
            const aggregationTypeValue = this.metricForm?.get('aggregation_type')?.value;

            if (recurringValue === true && aggregationTypeValue === 'count_agg') {
                return true;
            }
        }

        const fieldConfig = this.formConfig[fieldName];
        if (fieldConfig?.filter_conditions) {
            return this.checkFieldVisibility(fieldConfig.filter_conditions);
        }

        return false;
    }

    public getFieldHint(fieldName: string): string {
        return this.formConfig[fieldName]?.hint || '';
    }

    private setupConditionalValidation(): void {
        // Handle field_name visibility based on recurring and aggregation_type
        const recurringField = this.metricForm.get('recurring');
        const aggregationTypeField = this.metricForm.get('aggregation_type');
        const fieldNameField = this.metricForm.get('field_name');

        if (recurringField && aggregationTypeField && fieldNameField) {
            const updateFieldNameVisibility = () => {
                const recurringValue = recurringField.value;
                const aggregationTypeValue = aggregationTypeField.value;

                if (recurringValue === true && aggregationTypeValue === 'count_agg') {
                    // Clear field_name value when it should be hidden
                    fieldNameField.setValue('');
                }
            };

            recurringField.valueChanges.subscribe(updateFieldNameVisibility);
            aggregationTypeField.valueChanges.subscribe(updateFieldNameVisibility);
        }

        Object.keys(this.formConfig).forEach((fieldKey) => {
            const fieldConfig = this.formConfig[fieldKey];

            if (fieldConfig?.filter_conditions) {
                fieldConfig.filter_conditions.forEach((condition: any) => {
                    if (condition.when?.field) {
                        const triggerField = this.metricForm.get(condition.when.field);
                        if (triggerField) {
                            triggerField.valueChanges.subscribe((newValue) => {
                                Object.keys(this.optionsCache).forEach((key) => {
                                    if (key.startsWith(fieldConfig.label)) {
                                        delete this.optionsCache[key];
                                    }
                                });

                                const affectedField = this.metricForm.get(fieldKey);
                                if (affectedField) {
                                    affectedField.updateValueAndValidity();
                                }

                                this.metricForm.updateValueAndValidity();
                            });
                        }
                    }
                });
            }

            if (fieldConfig?.conditional_rule) {
                const conditionalInfo = this.parseConditionalRule(fieldConfig.conditional_rule);

                if (conditionalInfo) {
                    const triggerField = this.metricForm.get(conditionalInfo.triggerField);
                    const targetField = this.metricForm.get(fieldKey);

                    if (triggerField && targetField) {
                        triggerField.valueChanges.subscribe((value) => {
                            if (conditionalInfo.requiredValues.includes(value)) {
                                targetField.setValidators([Validators.required]);
                            } else {
                                targetField.clearValidators();
                            }
                            targetField.updateValueAndValidity();
                        });
                    }
                }
            }
        });
    }

    private parseConditionalRule(rule: string): { triggerField: string; requiredValues: string[] } | null {
        const match = rule.match(/when (\w+) is in \[([^\]]+)\]/);

        if (match && match[1] && match[2]) {
            const triggerField = match[1];
            const valuesString = match[2];
            const values = valuesString
                .split(',')
                .map((v) => v.trim().replace(/'/g, '').replace(/"/g, ''))
                .filter((v) => v.length > 0);

            return {
                triggerField,
                requiredValues: values,
            };
        }

        return null;
    }

    private applyFilterConditions(fieldConfig: any, options: any[]): any[] {
        if (!fieldConfig.filter_conditions || !Array.isArray(fieldConfig.filter_conditions)) {
            return options;
        }

        // Find the matching condition based on current form values
        for (const condition of fieldConfig.filter_conditions) {
            if (this.evaluateCondition(condition.when)) {
                if (condition.hide) {
                    return [];
                }
                if (condition.allowed_values) {
                    return options.filter((option) => condition.allowed_values.includes(option.value));
                }
                return options;
            }
        }

        return options;
    }

    private checkFieldVisibility(filterConditions: any[]): boolean {
        if (!Array.isArray(filterConditions)) {
            return false;
        }

        // Find the matching condition based on current form values
        for (const condition of filterConditions) {
            if (this.evaluateCondition(condition.when)) {
                return condition.hide === true;
            }
        }

        return false; // Default: show field
    }

    private evaluateCondition(whenCondition: any): boolean {
        if (!whenCondition || !whenCondition.field) {
            return false;
        }

        const fieldValue = this.metricForm?.get(whenCondition.field)?.value;

        if (whenCondition.equals !== undefined) {
            // Handle single value comparison
            if (typeof whenCondition.equals === 'string' && whenCondition.equals.includes('|')) {
                // Handle multiple values separated by |
                const allowedValues = whenCondition.equals.split('|');
                return allowedValues.includes(fieldValue);
            }
            return fieldValue === whenCondition.equals;
        }

        return false;
    }

    private formatLabel(value: string): string {
        // Convert snake_case to Title Case
        return value
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    private getCacheKey(fieldConfig: any): string {
        let cacheKey = fieldConfig.label;

        // If field has filter conditions, include the current form values that affect it
        if (fieldConfig.filter_conditions) {
            const affectingValues: string[] = [];
            fieldConfig.filter_conditions.forEach((condition: any) => {
                if (condition.when?.field) {
                    const fieldValue = this.metricForm?.get(condition.when.field)?.value;
                    // Handle null/undefined values properly
                    const value = fieldValue !== null && fieldValue !== undefined ? fieldValue : 'null';
                    affectingValues.push(`${condition.when.field}:${value}`);
                }
            });
            if (affectingValues.length > 0) {
                cacheKey += `_${affectingValues.join('_')}`;
            }
        }

        return cacheKey;
    }
}
