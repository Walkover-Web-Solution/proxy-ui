import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CustomValidators } from '@proxy/custom-validator';
import { BaseComponent } from '@proxy/ui/base-component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
    selector: 'proxy-create-plan-dialog',
    template: `
        <div class="d-flex justify-content-between align-items-center">
            <h2 mat-dialog-title>{{ dialogTitle }}</h2>
            <button mat-icon-button mat-dialog-close (click)="onClose()">
                <mat-icon>close</mat-icon>
            </button>
        </div>
        <mat-dialog-content class="create-plan-content">
            <div class="d-flex flex-column h-100">
                <p class="mat-body-2 text-secondary mb-3">
                    <strong>Note:</strong> These details will be shown on the invoice.
                </p>

                <form [formGroup]="planForm" class="single-form-layout">
                    <!-- Plan Details Section -->
                    <div class="form-section">
                        <p class="heading"><strong>Plan Details</strong></p>
                        <div class="form-grid">
                            <ng-container *ngFor="let fieldKey of getPlanFormFields()">
                                <ng-container
                                    *ngTemplateOutlet="
                                        inputField;
                                        context: {
                                            fieldControl: planForm.get('createPlanForm').get(fieldKey),
                                            fieldConfig: getFieldConfig(fieldKey)
                                        }
                                    "
                                ></ng-container>
                            </ng-container>
                        </div>
                    </div>

                    <!-- Charges Section -->
                    <mat-card class="charges-card">
                        <mat-card-header>
                            <mat-card-title class="heading"><strong>Charges</strong></mat-card-title>
                        </mat-card-header>
                        <mat-card-content>
                            <div class="form-grid">
                                <ng-container *ngFor="let fieldKey of getChargesFormFields()">
                                    <ng-container
                                        *ngTemplateOutlet="
                                            inputField;
                                            context: {
                                                fieldControl: planForm.get('chargesForm').get(fieldKey),
                                                fieldConfig: getFieldConfig(fieldKey)
                                            }
                                        "
                                    ></ng-container>
                                </ng-container>
                                <div>
                                    <button mat-flat-button color="primary" (click)="addCharge()" type="button">
                                        Add Charge
                                    </button>
                                </div>
                            </div>

                            <!-- Charges List -->
                            <div class="charges-table-container" *ngIf="chargesList && chargesList.length > 0">
                                <h4>Added Charges:</h4>
                                <table mat-table [dataSource]="chargesList" class="charges-table">
                                    <!-- Metric Column -->
                                    <ng-container matColumnDef="metric">
                                        <th mat-header-cell *matHeaderCellDef>Metric</th>
                                        <td mat-cell *matCellDef="let charge">
                                            {{
                                                getBillableMetricName(
                                                    charge.billable_metric_id || charge.lago_billable_metric_id
                                                ) || 'N/A'
                                            }}
                                        </td>
                                    </ng-container>

                                    <!-- Min Amount Column -->
                                    <ng-container matColumnDef="maxLimit">
                                        <th mat-header-cell *matHeaderCellDef>Max Limit</th>
                                        <td mat-cell *matCellDef="let charge">
                                            {{ charge.max_limit || 'N/A' }}
                                        </td>
                                    </ng-container>

                                    <!-- Actions Column -->
                                    <ng-container matColumnDef="actions">
                                        <th mat-header-cell *matHeaderCellDef>Actions</th>
                                        <td mat-cell *matCellDef="let charge; let i = index">
                                            <button
                                                mat-icon-button
                                                color="warn"
                                                (click)="removeCharge(i)"
                                                matTooltip="Remove Charge"
                                                type="button"
                                            >
                                                <mat-icon>delete</mat-icon>
                                            </button>
                                        </td>
                                    </ng-container>

                                    <tr mat-header-row *matHeaderRowDef="chargesDisplayedColumns"></tr>
                                    <tr mat-row *matRowDef="let row; columns: chargesDisplayedColumns"></tr>
                                </table>
                            </div>
                        </mat-card-content>
                    </mat-card>
                </form>
            </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button (click)="onClose()">Cancel</button>
            <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="!planForm.valid">
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

                <!-- Chip List -->

                <mat-hint *ngIf="fieldConfig?.hint">{{ fieldConfig?.hint }}</mat-hint>
                <mat-error *ngIf="getFieldError(fieldControl, fieldConfig)">{{
                    getFieldError(fieldControl, fieldConfig)
                }}</mat-error>
            </mat-form-field>
        </ng-template>
    `,
    styles: [
        `
            .dialog-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 24px 0 24px;
                margin-bottom: 16px;
            }

            .dialog-header h2 {
                margin: 0;
                flex: 1;
            }

            .close-button {
                margin-left: auto;
            }

            .create-plan-content {
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

            .charges-card {
                margin-top: 1rem;
            }

            .charges-list {
                margin-top: 1rem;
            }

            .charge-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-bottom: 0.5rem;
            }

            .charge-info {
                display: flex;
                gap: 1rem;
            }

            .single-form-layout {
                width: 100%;
            }

            .charges-table-container {
                margin-top: 1rem;
            }

            .charges-table {
                width: 100%;
            }

            .charges-table th,
            .charges-table td {
                padding: 8px 12px;
                text-align: left;
            }

            .charges-table th {
                background-color: #f5f5f5;
                font-weight: 600;
            }
        `,
    ],
})
export class CreatePlanDialogComponent extends BaseComponent implements OnInit, OnDestroy {
    public planForm: FormGroup;
    public formConfig: any;
    public dialogTitle: string;
    public submitButtonText: string;
    public chargesList: any[] = [];
    public chargesDisplayedColumns: string[] = ['metric', 'maxLimit', 'actions'];
    public chipListValues: { [key: string]: Set<string> } = {};
    public chipListReadOnlyValues: { [key: string]: Set<string> } = {};
    public chipListSeparatorKeysCodes: number[] = [ENTER, COMMA];
    public metaData: any;
    public taxConfigData: any;

    // Cache for select options to prevent infinite calls
    private optionsCache: { [key: string]: any[] } = {};

    constructor(
        private fb: FormBuilder,
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<CreatePlanDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            formConfig: any;
            dialogTitle?: string;
            submitButtonText?: string;
            editData?: any;
            metaData?: any;
            chipListValues?: { [key: string]: Set<string> };
            chargesList?: any[];
            optionsData?: {
                taxes: any[];
                billableMetrics: any[];
            };
        }
    ) {
        super();
        this.formConfig = data.formConfig;
        this.dialogTitle = data.dialogTitle || 'Create Plan';
        this.submitButtonText = data.submitButtonText || 'Create Plan';
        this.chargesList = data.chargesList || [];
        this.chipListValues = data.chipListValues || {};
        this.metaData = data.metaData || {};
    }

    ngOnInit(): void {
        try {
            this.initializeForm();
        } catch (error) {
            console.error('Error initializing dialog:', error);
        }
    }

    private initializeForm(): void {
        const createPlanControls: { [key: string]: FormControl } = {};
        const chargesControls: { [key: string]: FormControl } = {};

        // Initialize create plan form controls
        if (this.formConfig?.createPlanForm) {
            Object.keys(this.formConfig.createPlanForm).forEach((key) => {
                const config = this.formConfig.createPlanForm[key];
                const validators = this.getValidators(config);
                const initialValue = this.getInitialValue(key, config);
                createPlanControls[key] = new FormControl(initialValue, validators);
            });
        }

        // Initialize charges form controls
        if (this.formConfig?.chargesForm) {
            Object.keys(this.formConfig.chargesForm).forEach((key) => {
                const config = this.formConfig.chargesForm[key];
                const validators = this.getValidators(config);
                const initialValue = this.getInitialValue(key, config);
                chargesControls[key] = new FormControl(initialValue, validators);
            });
        }

        this.planForm = this.fb.group({
            createPlanForm: this.fb.group(createPlanControls),
            chargesForm: this.fb.group(chargesControls),
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

            // Populate chip list values from metaData if available and Set is empty
            if (this.chipListValues[chipListKey].size === 0 && this.metaData) {
                // Add chips from metaData based on field type
                if (key === 'metrics' && Array.isArray(this.metaData.metrics) && this.metaData.metrics.length > 0) {
                    this.chipListValues[chipListKey] = new Set(this.metaData.metrics);
                } else if (
                    key === 'feature_included' &&
                    this.metaData.features?.included &&
                    Array.isArray(this.metaData.features.included) &&
                    this.metaData.features.included.length > 0
                ) {
                    this.chipListValues[chipListKey] = new Set(this.metaData.features.included);
                } else if (
                    key === 'feature_not_included' &&
                    this.metaData.features?.notIncluded &&
                    Array.isArray(this.metaData.features.notIncluded) &&
                    this.metaData.features.notIncluded.length > 0
                ) {
                    this.chipListValues[chipListKey] = new Set(this.metaData.features.notIncluded);
                } else if (key === 'extras' && Array.isArray(this.metaData.extra) && this.metaData.extra.length > 0) {
                    this.chipListValues[chipListKey] = new Set(this.metaData.extra);
                }
            }

            // If edit data exists and has chip list values, populate them (this takes precedence over metaData)
            if (this.data.editData?.createPlanForm) {
                const editValue = this.data.editData.createPlanForm[key];
                if (editValue) {
                    let chipValues: string[] = [];
                    if (Array.isArray(editValue)) {
                        // If it's an array (from plan_meta), use directly
                        chipValues = editValue
                            .filter((v: string) => v && v.trim().length > 0)
                            .map((v: string) => v.trim());
                    } else if (typeof editValue === 'string') {
                        // If it's a string, split by delimiter
                        const delimiter = config?.delimiter ?? ' ';
                        chipValues = editValue
                            .split(delimiter)
                            .map((v: string) => v.trim())
                            .filter((v: string) => v.length > 0);
                    }
                    if (chipValues.length > 0) {
                        this.chipListValues[chipListKey] = new Set(chipValues);
                    }
                }
            }
            return null; // Chip list form control value is always null
        }

        if (this.data.editData) {
            const editValue = this.data.editData.createPlanForm?.[key] ?? this.data.editData.chargesForm?.[key];
            if (editValue !== undefined && editValue !== null) {
                return editValue;
            }
        }

        if (key === 'highlight_text') {
            const tagValue = this.metaData?.plan_meta?.tag ?? this.metaData?.tag;
            if (tagValue !== undefined && tagValue !== null) {
                return tagValue;
            }
        }
        if (key === 'highlight') {
            const highlightValue = this.metaData?.plan_meta?.highlight_plan ?? this.metaData?.highlight_plan;
            if (highlightValue !== undefined && highlightValue !== null) {
                return highlightValue;
            }
        }

        return config.default_value || '';
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

    private populateFormWithEditData(): void {
        if (this.data.editData) {
            // Populate create plan form
            const createPlanForm = this.planForm.get('createPlanForm');
            if (createPlanForm && this.data.editData.createPlanForm) {
                // Special handling for tax codes to ensure they're set correctly
                const formData = { ...this.data.editData.createPlanForm };

                createPlanForm.patchValue(formData);
            }

            // Populate charges form
            const chargesForm = this.planForm.get('chargesForm');
            if (chargesForm && this.data.editData.chargesForm) {
                chargesForm.patchValue(this.data.editData.chargesForm);
            }

            // Populate charges list
            if (this.data.editData.charges) {
                this.chargesList = [...this.data.editData.charges];
            }
        }
    }

    public getPlanFormFields(): string[] {
        const allFields = this.formConfig?.createPlanForm ? Object.keys(this.formConfig.createPlanForm) : [];
        // Remove the last three fields
        const fields = allFields.slice(0, -2);

        return fields;
    }

    public getChargesFormFields(): string[] {
        return this.formConfig?.chargesForm ? Object.keys(this.formConfig.chargesForm) : [];
    }

    public getFieldConfig(fieldKey: string): any {
        const fieldConfig = this.formConfig?.createPlanForm?.[fieldKey] || this.formConfig?.chargesForm?.[fieldKey];
        return fieldConfig;
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
        if (fieldConfig.label === 'Tax Codes' || fieldConfig.label === 'Billable Metric') {
            options = this.getApiOptions(fieldConfig);
        }
        // Handle source as array (like currency codes)
        else if (fieldConfig.source && Array.isArray(fieldConfig.source)) {
            options = fieldConfig.source.map((value: string) => ({
                label: value,
                value: value,
            }));
        }
        // Handle sourceFieldLabel and sourceFieldValue arrays
        else if (
            fieldConfig.sourceFieldLabel &&
            fieldConfig.sourceFieldValue &&
            Array.isArray(fieldConfig.sourceFieldLabel) &&
            Array.isArray(fieldConfig.sourceFieldValue)
        ) {
            options = fieldConfig.sourceFieldLabel.map((label: string, index: number) => ({
                label: label,
                value: fieldConfig.sourceFieldValue[index],
            }));
        }
        // Handle regex patterns
        else if (fieldConfig.regex) {
            options = this.extractOptionsFromRegex(fieldConfig.regex);
        }
        // Handle predefined options
        else if (fieldConfig?.options) {
            options = fieldConfig.options;
        }

        if (fieldConfig.filter_conditions) {
            options = this.applyFilterConditions(fieldConfig, options);
        }

        // Cache the result
        this.optionsCache[cacheKey] = options;
        return options;
    }

    public getFieldError(fieldControl: FormControl, fieldConfig: any): string {
        if (fieldControl?.errors && fieldControl.touched) {
            if (fieldControl.errors['required']) {
                return `${fieldConfig?.label} is required`;
            }
            if (fieldControl.errors['pattern']) {
                return `Invalid ${fieldConfig?.label} format`;
            }
            if (fieldControl.errors['minlength']) {
                return `${fieldConfig?.label} must be at least ${fieldControl.errors['minlength'].requiredLength} characters`;
            }
            if (fieldControl.errors['maxlength']) {
                return `${fieldConfig?.label} must not exceed ${fieldControl.errors['maxlength'].requiredLength} characters`;
            }
        }
        return '';
    }

    public addCharge(): void {
        const chargesForm = this.planForm.get('chargesForm');
        if (chargesForm) {
            const chargeData = chargesForm.value;

            // Check if we have some data to add
            const metricValue = chargeData.billable_metric_id;
            const modelValue = chargeData.charge_model;
            const amountValue = chargeData.amount;
            const maxLimitValue = chargeData.max_limit;

            if (metricValue || modelValue || amountValue) {
                // Convert amount to cents if it's a string or number
                let amountInCents = 0;
                if (amountValue) {
                    if (typeof amountValue === 'string') {
                        amountInCents = parseFloat(amountValue.replace(/[^0-9.-]/g, '')) * 100;
                    } else if (typeof amountValue === 'number') {
                        amountInCents = amountValue * 100;
                    }
                }

                const newCharge = {
                    billable_metric_id: metricValue || 'N/A',
                    max_limit: maxLimitValue || null,
                };

                this.chargesList.push(newCharge);
                // Force change detection by creating a new array reference
                this.chargesList = [...this.chargesList];
                chargesForm.reset();
            }
        }
    }

    public removeCharge(index: number): void {
        this.chargesList.splice(index, 1);
        // Force change detection by creating a new array reference
        this.chargesList = [...this.chargesList];
    }

    public getChargeAmount(charge: any): string {
        if (charge.min_amount_cents !== null && charge.min_amount_cents !== undefined) {
            return (charge.min_amount_cents / 100).toFixed(2);
        }
        return '0.00';
    }

    public onSubmit(): void {
        if (this.planForm.valid) {
            const formData = this.planForm.value;

            // Process the payload - only include required fields
            const processedCharges = this.chargesList.map((charge) => ({
                billable_metric_id: charge.billable_metric_id || charge.lago_billable_metric_id,
                max_limit: parseInt(charge.max_limit),
            }));

            // Transform payload to nested plan_meta structure
            const transformedPayload = this.transformPayloadToPlanMeta(
                formData.createPlanForm,
                this.formConfig?.createPlanForm || {}
            );

            const payload = {
                ...transformedPayload,
                amount_cents:
                    typeof formData.createPlanForm.amount_cents === 'string'
                        ? parseFloat(formData.createPlanForm.amount_cents)
                        : formData.createPlanForm.amount_cents,
                tax_codes: formData.createPlanForm.tax_codes
                    ? Array.isArray(formData.createPlanForm.tax_codes)
                        ? formData.createPlanForm.tax_codes
                        : [formData.createPlanForm.tax_codes]
                    : [],
                charges: processedCharges,
            };
            this.dialogRef.close(payload);
        }
    }

    /**
     * Transform flat payload structure to nested plan_meta structure
     * Extracts chip list values and nests them under plan_meta
     */
    private transformPayloadToPlanMeta(formData: any, formConfig: { [key: string]: any }): any {
        // Get chip list values as arrays
        const getChipArray = (key: string): string[] => {
            const config = formConfig?.[key];
            if (config?.type === 'chipList') {
                const chipListKey = `${config.label}_0`;
                return this.chipListValues[chipListKey] ? Array.from(this.chipListValues[chipListKey]) : [];
            }
            return [];
        };

        const metrics = getChipArray('metrics');
        const featureIncluded = getChipArray('feature_included');
        const featureNotIncluded = getChipArray('feature_not_included');
        const extras = getChipArray('extras');

        // Build plan_meta object
        const planMeta: any = {};
        if (metrics.length) planMeta.metrics = metrics;

        if (featureIncluded.length || featureNotIncluded.length) {
            planMeta.features = {};
            if (featureIncluded.length) planMeta.features.included = featureIncluded;
            if (featureNotIncluded.length) planMeta.features.notIncluded = featureNotIncluded;
        }

        if (extras.length) planMeta.extra = extras;
        if (formData.highlight !== undefined) planMeta.highlight_plan = formData.highlight;
        if (formData.highlight_text !== undefined) planMeta.tag = formData.highlight_text;

        // Exclude plan_meta fields from main payload
        const {
            metrics: _,
            feature_included: __,
            feature_not_included: ___,
            extras: ____,
            highlight: _____,
            highlight_text: ______,
            ...rest
        } = formData;

        return {
            ...rest,
            ...(Object.keys(planMeta).length > 0 && { plan_meta: planMeta }),
        };
    }

    public onClose(): void {
        this.resetForm();
        this.dialogRef.close();
    }

    private resetForm(): void {
        if (this.planForm) {
            this.planForm.reset();
        }
        // Reset chip list values, but preserve read-only values
        Object.keys(this.chipListValues).forEach((key) => {
            const readOnlyValues = this.chipListReadOnlyValues[key] || new Set<string>();
            this.chipListValues[key] = new Set(readOnlyValues);
        });
        // Reset charges list
        this.chargesList = [];
    }

    // Separate function for API calls
    public getApiOptions(fieldConfig: any): any[] {
        if (fieldConfig.label === 'Tax Codes' && this.data.optionsData?.taxes) {
            return this.data.optionsData.taxes.map((tax: any) => ({
                label: `${tax.name} (${tax.rate}%)`,
                value: tax.code,
            }));
        } else if (fieldConfig.label === 'Billable Metric' && this.data.optionsData?.billableMetrics) {
            return this.data.optionsData.billableMetrics.map((metric: any) => ({
                label: metric.name,
                value: metric.lago_id,
            }));
        }
        return [];
    }

    public extractOptionsFromRegex(regex: string): any[] {
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

    public applyFilterConditions(fieldConfig: any, options: any[]): any[] {
        if (!fieldConfig.filter_conditions || !Array.isArray(fieldConfig.filter_conditions)) {
            return options;
        }
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

    public evaluateCondition(whenCondition: any): boolean {
        if (!whenCondition || !whenCondition.field) {
            return false;
        }

        const fieldValue = this.planForm?.get(whenCondition.field)?.value;

        if (whenCondition.equals !== undefined) {
            if (typeof whenCondition.equals === 'string' && whenCondition.equals.includes('|')) {
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

    public getCacheKey(fieldConfig: any): string {
        let cacheKey = fieldConfig.label;

        // If field has filter conditions, include the current form values that affect it
        if (fieldConfig.filter_conditions) {
            const affectingValues: string[] = [];
            fieldConfig.filter_conditions.forEach((condition: any) => {
                if (condition.when?.field) {
                    const fieldValue = this.planForm?.get(condition.when.field)?.value;
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
    public getBillableMetricName(billableMetricId: string): string {
        const billableMetric = this.data.optionsData.billableMetrics.find(
            (metric: any) => metric.lago_id === billableMetricId
        );
        return billableMetric ? billableMetric.name : '';
    }

    public updateChipListValues(
        operation: 'add' | 'delete',
        chipListKey: string,
        fieldControl: FormControl,
        value: string
    ): void {
        // Ensure the Set exists
        if (!this.chipListValues[chipListKey]) {
            this.chipListValues[chipListKey] = new Set<string>();
        }

        if (operation === 'add') {
            const trimmedValue = value?.trim();
            if (fieldControl.valid && trimmedValue && trimmedValue.length > 0) {
                this.chipListValues[chipListKey].add(trimmedValue);
                fieldControl.reset();
            }
        } else if (operation === 'delete') {
            if (this.chipListValues[chipListKey]) {
                this.chipListValues[chipListKey].delete(value);
                fieldControl.updateValueAndValidity();
            }
        }
    }
    ngOnDestroy(): void {
        // Clear the options cache to prevent memory leaks
        this.optionsCache = {};
        // Reset form when dialog is destroyed
        this.resetForm();
        super.ngOnDestroy();
    }
}
