import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomValidators } from '@proxy/custom-validator';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'proxy-simple-dialog',
    template: `
        <h2 mat-dialog-title>Add New Metric</h2>

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
                Add Metric
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
                    [placeholder]="'Enter ' + fieldConfig?.label"
                    [required]="fieldConfig?.is_required"
                />

                <!-- Textarea -->
                <textarea
                    *ngIf="fieldConfig?.type === 'textarea'"
                    matInput
                    [formControl]="fieldControl"
                    [placeholder]="'Enter ' + fieldConfig?.label"
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
    public aggregationTypes: any[] = [];
    public roundingFunctions: any[] = [];
    private optionsCache: { [key: string]: any[] } = {};

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        public dialogRef: MatDialogRef<SimpleDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string; formConfig: any }
    ) {
        this.formConfig = data.formConfig;
    }

    ngOnInit(): void {
        this.initializeForm();
        // this.loadAggregationTypes();
        // this.loadRoundingFunctions();
    }

    private initializeForm(): void {
        const formControls: { [key: string]: FormControl } = {};

        // Create form controls based on the form configuration
        Object.keys(this.formConfig).forEach((key) => {
            const config = this.formConfig[key];
            const validators = [];

            // Add required validator
            if (config.is_required) {
                validators.push(Validators.required);
            }

            // Add regex validator
            if (config.regex) {
                validators.push(Validators.pattern(config.regex));
            }

            // Add custom validators for specific fields
            if (key === 'name') {
                validators.push(CustomValidators.minLengthThreeWithoutSpace);
                validators.push(CustomValidators.noStartEndSpaces);
            }

            formControls[key] = new FormControl(config.value || '', validators);
        });

        this.metricForm = this.fb.group(formControls);

        // Add dynamic conditional validation
        this.setupConditionalValidation();
    }

    // private loadAggregationTypes(): void {
    //     const aggregationConfig = this.formConfig['aggregation_type'];

    //     if (aggregationConfig?.source) {
    //         // Fetch aggregation types dynamically from API
    //         this.http.get(aggregationConfig.source).subscribe({
    //             next: (response: any) => {
    //                 // Map the response based on sourceFieldLabel and sourceFieldValue
    //                 this.aggregationTypes = response.map(item => ({
    //                     label: item[aggregationConfig.sourceFieldLabel || 'label'],
    //                     value: item[aggregationConfig.sourceFieldValue || 'value']
    //                 }));
    //                 // Update cache
    //                 this.optionsCache['Aggregation Type'] = this.aggregationTypes;
    //             },
    //             error: (error) => {
    //                 console.error('Error fetching aggregation types:', error);
    //                 // Fallback to default values if API fails
    //                 this.loadDefaultAggregationTypes();
    //             }
    //         });
    //     } else {
    //         // Use default values if no source is specified
    //         this.loadDefaultAggregationTypes();
    //     }
    // }

    // private loadDefaultAggregationTypes(): void {
    //     const aggregationConfig = this.formConfig['aggregation_type'];

    //     // Extract default values from regex pattern if available
    //     if (aggregationConfig?.regex) {
    //         const regex = aggregationConfig.regex;
    //         // Extract values from regex pattern like "^(count_agg|sum_agg|max_agg|unique_count_agg|weighted_sum_agg|latest_agg)$"
    //         const match = regex.match(/\^\(([^)]+)\)\$/);
    //         if (match && match[1]) {
    //             const values = match[1].split('|');
    //             this.aggregationTypes = values.map(value => ({
    //                 label: this.formatLabel(value),
    //                 value: value
    //             }));
    //             // Update cache
    //             this.optionsCache['Aggregation Type'] = this.aggregationTypes;
    //             return;
    //         }
    //     }

    //     // Fallback to empty array if no pattern found
    //     this.aggregationTypes = [];
    // }

    // private loadRoundingFunctions(): void {
    //     const roundingConfig = this.formConfig['rounding_function'];

    //     if (roundingConfig?.source) {
    //         // Fetch rounding functions dynamically from API
    //         this.http.get(roundingConfig.source).subscribe({
    //             next: (response: any) => {
    //                 // Map the response based on sourceFieldLabel and sourceFieldValue
    //                 this.roundingFunctions = response.map(item => ({
    //                     label: item[roundingConfig.sourceFieldLabel || 'label'],
    //                     value: item[roundingConfig.sourceFieldValue || 'value']
    //                 }));
    //                 // Update cache
    //                 this.optionsCache['Rounding Function'] = this.roundingFunctions;
    //             },
    //             error: (error) => {
    //                 console.error('Error fetching rounding functions:', error);
    //                 // Fallback to default values if API fails
    //                 this.loadDefaultRoundingFunctions();
    //             }
    //         });
    //     } else {
    //         // Use default values if no source is specified
    //         this.loadDefaultRoundingFunctions();
    //     }
    // }

    // private loadDefaultRoundingFunctions(): void {
    //     const roundingConfig = this.formConfig['rounding_function'];

    //     // Extract default values from regex pattern if available
    //     if (roundingConfig?.regex) {
    //         const regex = roundingConfig.regex;
    //         // Extract values from regex pattern like "^(round|ceil|floor)?$"
    //         const match = regex.match(/\^\(([^)]+)\)\?\$/);
    //         if (match && match[1]) {
    //             const values = match[1].split('|');
    //             this.roundingFunctions = [
    //                 { label: 'None', value: '' }, // Always include None option
    //                 ...values.map(value => ({
    //                     label: this.formatLabel(value),
    //                     value: value
    //                 }))
    //             ];
    //             // Update cache
    //             this.optionsCache['Rounding Function'] = this.roundingFunctions;
    //             return;
    //         }
    //     }

    //     // Fallback to empty array if no pattern found
    //     this.roundingFunctions = [{ label: 'None', value: '' }];
    // }

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

        // Check cache first
        if (this.optionsCache[fieldConfig.label]) {
            return this.optionsCache[fieldConfig.label];
        }

        let options: any[] = [];

        switch (fieldConfig.label) {
            case 'Aggregation Type':
                options = this.getAggregationTypeOptions();
                break;
            case 'Rounding Function':
                options = this.extractOptionsFromRegex(fieldConfig.regex);
                break;
            case 'Type':
                options = this.extractOptionsFromRegex(fieldConfig.regex);
                break;
            default:
                options = [];
        }

        // Cache the result
        this.optionsCache[fieldConfig.label] = options;
        return options;
    }

    private getAggregationTypeOptions(): any[] {
        // Get the current value of the Type field
        const typeValue = this.metricForm?.get('recurring')?.value;

        if (typeValue === 'recurring') {
            // If recurring: sum_agg, weighted_sum_agg, unique_count_agg
            return [
                { label: 'Sum Agg', value: 'sum_agg' },
                { label: 'Weighted Sum Agg', value: 'weighted_sum_agg' },
                { label: 'Unique Count Agg', value: 'unique_count_agg' },
            ];
        } else if (typeValue === 'metered') {
            // If metered: sum_agg, weighted_sum_agg, unique_count_agg, count_agg, max_agg, latest_agg
            return [
                { label: 'Sum Agg', value: 'sum_agg' },
                { label: 'Weighted Sum Agg', value: 'weighted_sum_agg' },
                { label: 'Unique Count Agg', value: 'unique_count_agg' },
                { label: 'Count Agg', value: 'count_agg' },
                { label: 'Max Agg', value: 'max_agg' },
                { label: 'Latest Agg', value: 'latest_agg' },
            ];
        }

        // Default: return all options
        return [
            { label: 'Sum Agg', value: 'sum_agg' },
            { label: 'Weighted Sum Agg', value: 'weighted_sum_agg' },
            { label: 'Unique Count Agg', value: 'unique_count_agg' },
            { label: 'Count Agg', value: 'count_agg' },
            { label: 'Max Agg', value: 'max_agg' },
            { label: 'Latest Agg', value: 'latest_agg' },
        ];
    }

    private extractOptionsFromRegex(regex: string): any[] {
        // Extract options from regex patterns like "^(option1|option2|option3)$"
        const match = regex.match(/\^\(([^)]+)\)\$/);
        if (match && match[1]) {
            const values = match[1].split('|');
            return values.map((value) => ({
                label: this.formatLabel(value),
                value: value,
            }));
        }

        // Handle optional patterns like "^(option1|option2)?$"
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
        // Check if field is hidden by config
        if (this.formConfig[fieldName]?.is_hidden) {
            return true;
        }

        // Special case: hide field_name when aggregation_type is count_agg
        if (fieldName === 'field_name') {
            const aggregationValue = this.metricForm?.get('aggregation_type')?.value;
            return aggregationValue === 'count_agg';
        }

        return false;
    }

    public getFieldHint(fieldName: string): string {
        return this.formConfig[fieldName]?.hint || '';
    }

    private setupConditionalValidation(): void {
        // Handle Type field changes to update Aggregation Type options
        const typeField = this.metricForm.get('recurring');
        if (typeField) {
            typeField.valueChanges.subscribe((value) => {
                // Clear cache for Aggregation Type to force refresh
                delete this.optionsCache['Aggregation Type'];

                // Reset aggregation type when type changes
                const aggregationField = this.metricForm.get('aggregation_type');
                if (aggregationField) {
                    aggregationField.setValue('');
                }
            });
        }

        // Handle Aggregation Type changes to update Field Name requirements
        const aggregationField = this.metricForm.get('aggregation_type');
        if (aggregationField) {
            aggregationField.valueChanges.subscribe((value) => {
                const fieldNameField = this.metricForm.get('field_name');
                if (fieldNameField) {
                    if (value === 'count_agg') {
                        // If count_agg: field name not available (hide/disable)
                        fieldNameField.setValue('');
                        fieldNameField.clearValidators();
                        fieldNameField.disable();
                    } else {
                        // For other aggregation types: field name available but not required
                        fieldNameField.enable();
                        fieldNameField.clearValidators();
                    }
                    fieldNameField.updateValueAndValidity();
                }
            });
        }

        // Handle existing conditional rules
        Object.keys(this.formConfig).forEach((fieldKey) => {
            const fieldConfig = this.formConfig[fieldKey];

            if (fieldConfig?.conditional_rule) {
                // Parse conditional rule to find the trigger field and conditions
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
        // Parse rules like: "Only allowed when aggregation_type is in ['unique_count_agg','latest_agg','max_agg','sum_agg','weighted_sum_agg']"
        const match = rule.match(/when (\w+) is in \[([^\]]+)\]/);

        if (match && match[1] && match[2]) {
            const triggerField = match[1];
            const valuesString = match[2];

            // Extract values from the array string
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

    private formatLabel(value: string): string {
        // Convert snake_case to Title Case
        return value
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
