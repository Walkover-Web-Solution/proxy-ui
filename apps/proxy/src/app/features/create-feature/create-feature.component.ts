import { ActivatedRoute } from '@angular/router';
import { cloneDeep, isEqual } from 'lodash-es';
import { Component, OnDestroy, OnInit, NgZone, ViewChildren, QueryList } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import { BehaviorSubject, Observable, distinctUntilChanged, filter, of, take, takeUntil } from 'rxjs';
import { CreateFeatureComponentStore } from './create-feature.store';
import {
    FeatureFieldType,
    IFeature,
    IFeatureDetails,
    IFeatureType,
    IFieldConfig,
    IMethod,
    IMethodService,
    ProxyAuthScript,
    ProxyAuthScriptUrl,
} from '@proxy/models/features-model';
import { FormArray, FormControl, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { CAMPAIGN_NAME_REGEX, ONLY_INTEGER_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { environment } from '../../../environments/environment';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { MatStepper } from '@angular/material/stepper';
import { MatDialog } from '@angular/material/dialog';
import { getAcceptedTypeRegex } from '@proxy/utils';
import { SimpleDialogComponent } from './simple-dialog/simple-dialog.component';

type ServiceFormGroup = FormGroup<{
    requirements: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    configurations: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    is_enable: FormControl<boolean>;
}>;

export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}
@Component({
    selector: 'proxy-create-feature',
    templateUrl: './create-feature.component.html',
    styleUrls: ['./create-feature.component.scss'],
    providers: [CreateFeatureComponentStore],
})
export class CreateFeatureComponent extends BaseComponent implements OnDestroy, OnInit {
    @ViewChildren('stepper') stepper: QueryList<MatStepper>;
    public integrationChoiceJson = [
        {
            id: 10,
            name: 'Lago Billing',
            icon: 'https://campaignfileupload.s3.ap-south-1.amazonaws.com/featureServiceIcon/billinglogo.png',
        },
    ];
    public billableMetricForm: any = {
        'name': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Name',
            'value_type': 'string',
            'type': 'text',
            'regex': '^.{1,255}$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
        'code': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Code',
            'value_type': 'string',
            'type': 'text',
            'regex': '^[a-z0-9_]{1,255}$',
            'unique': true,
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
        'description': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Description',
            'value_type': 'string',
            'type': 'textarea',
            'regex': '^.{0,255}$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
        'recurring': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Type',
            'value_type': 'string',
            'type': 'select',
            'regex': '^(recurring|metered)$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': 'recurring',
        },
        'aggregation_type': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Aggregation Type',
            'value_type': 'string',
            'type': 'select',
            'regex': '^(count_agg|sum_agg|max_agg|unique_count_agg|weighted_sum_agg|latest_agg)$',
            'source': '/api/aggregation-types',
            'sourceFieldLabel': 'label',
            'sourceFieldValue': 'value',
            'value': '',
        },
        'field_name': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Field Name',
            'value_type': 'string',
            'type': 'text',
            'regex': '^.{0,255}$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
            'conditional_rule':
                "Only allowed when aggregation_type is in ['unique_count_agg','latest_agg','max_agg','sum_agg','weighted_sum_agg']",
        },
        'rounding_function': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Rounding Function',
            'value_type': 'string',
            'type': 'select',
            'regex': '^(round|ceil|floor)?$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
        'rounding_precision': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Rounding Precision',
            'value_type': 'integer',
            'type': 'number',
            'regex': '^[0-9]+$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
    };

    public ELEMENT_DATA: PeriodicElement[] = [
        { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
        { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
        { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
        { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
        { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
        { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
        { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
        { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
        { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
        { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
    ];
    public displayedColumns: string[] = ['name', 'code', 'type', 'aggregation', 'action'];
    public dataSource = this.ELEMENT_DATA;

    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public featureType$: Observable<IFeatureType[]> = this.componentStore.featureType$;
    public serviceMethods$: Observable<IMethod[]> = this.componentStore.serviceMethods$;
    public createUpdateObject$: Observable<IFeature> = this.componentStore.createUpdateObject$;
    public featureDetails$: Observable<IFeatureDetails> = this.componentStore.featureDetails$;

    public isEditMode = false;
    public selectedServiceIndex = 0;
    public selectedMethod = new BehaviorSubject<IMethod>(null);
    public featureId: number = null;
    public nameFieldEditMode = false;
    public loadingScript = new BehaviorSubject<boolean>(false);
    public scriptLoaded = new BehaviorSubject<boolean>(false);
    public showApiConfigurationErrors = false;

    public featureFieldType = FeatureFieldType;
    public proxyAuthScript = ProxyAuthScript(environment.proxyServer);

    // Chip list
    public chipListSeparatorKeysCodes: number[] = [ENTER, COMMA];
    public chipListValues: { [key: string]: Set<string> } = {};
    public chipListReadOnlyValues: { [key: string]: Set<string> } = {};

    // File
    public fileValues: { [key: string]: FileList } = {};

    public featureForm = new FormGroup({
        primaryDetails: new FormGroup({
            name: new FormControl<string>(null, [
                Validators.required,
                Validators.pattern(CAMPAIGN_NAME_REGEX),
                CustomValidators.minLengthThreeWithoutSpace,
                CustomValidators.noStartEndSpaces,
                Validators.maxLength(60),
            ]),
            feature_id: new FormControl<number>(null, [Validators.required]),
            method_id: new FormControl<number>(null, [Validators.required]),
        }),
        serviceDetails: new FormArray<ServiceFormGroup>([]),
        authorizationDetails: new FormGroup({
            session_time: new FormControl<number>(null, [
                Validators.required,
                Validators.pattern(ONLY_INTEGER_REGEX),
                Validators.min(60),
                Validators.max(999999999),
            ]),
            authorizationKey: new FormControl<string>(null, [
                Validators.required,
                CustomValidators.minLengthThreeWithoutSpace,
            ]),
        }),
        // New form controls for conditional steps
        integrationChoice: new FormGroup({
            integrationType: new FormControl<string>(null, [Validators.required]),
        }),
        organizationDetails: new FormGroup({
            legalName: new FormControl<string>(null),
            legalNumber: new FormControl<string>(null),
            taxId: new FormControl<string>(null),
            email: new FormControl<string>(null),
            addressLine1: new FormControl<string>(null),
            addressLine2: new FormControl<string>(null),
            city: new FormControl<string>(null),
            state: new FormControl<string>(null),
            country: new FormControl<string>(null),
            postalCode: new FormControl<string>(null),
            phone: new FormControl<string>(null),
        }),
        billableMetrics: new FormGroup({
            apiCalls: new FormControl<boolean>(false),
            dataStorage: new FormControl<boolean>(false),
        }),
        createPlan: new FormGroup({
            planName: new FormControl<string>(null, [Validators.required]),
            price: new FormControl<number>(null, [Validators.required, Validators.min(0)]),
        }),
        plansOverview: new FormGroup({
            planSelected: new FormControl<string>(null, [Validators.required]),
        }),
    });
    public demoDiv$: Observable<string> = of(null);

    constructor(
        private componentStore: CreateFeatureComponentStore,
        private activatedRoute: ActivatedRoute,
        private toast: PrimeNgToastService,
        private ngZone: NgZone,
        private dialog: MatDialog
    ) {
        super();
    }

    ngOnInit(): void {
        this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            if (params?.id) {
                this.featureId = params.id;
                this.isEditMode = true;
                this.getFeatureDetalis();
            } else {
                this.getFeatureType();
            }
        });
        this.featureForm
            .get('integrationChoice.integrationType')
            .valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((value) => {
                console.log(value);
            });
        this.featureForm
            .get('primaryDetails.method_id')
            .valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((value) => {
                console.log(value);
            });
        if (!this.isEditMode) {
            this.featureType$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((features) => {
                this.featureForm.get('primaryDetails.feature_id').setValue(features[0].id);
                if (features?.length === 1) {
                    this.stepper?.first?.next();
                }
            });
            // Selecting first method because there is no form for `method_id` selection currently
            this.serviceMethods$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((methods) => {
                console.log(methods);
                this.featureForm.get('primaryDetails.method_id').setValue(methods[0].id);
            });
        } else {
            this.featureDetails$
                .pipe(
                    filter(Boolean),
                    distinctUntilChanged(
                        (previous, current) =>
                            previous.feature_id === current.feature_id && previous.reference_id === current.reference_id
                    ),
                    takeUntil(this.destroy$)
                )
                .subscribe((feature) => {
                    this.getServiceMethods(feature.feature_id);
                    this.proxyAuthScript = ProxyAuthScript(environment.proxyServer, feature.reference_id);
                    this.demoDiv$ = of(`<div id="${feature.reference_id}"></div>`);
                });
            this.featureDetails$
                .pipe(filter(Boolean), distinctUntilChanged(isEqual), takeUntil(this.destroy$))
                .subscribe((feature) => {
                    this.serviceMethods$.pipe(filter(Boolean), take(1)).subscribe(() => {
                        this.featureForm.patchValue({
                            primaryDetails: {
                                name: feature.name,
                                feature_id: feature.feature_id,
                                method_id: feature.method_id,
                            },
                            authorizationDetails: {
                                session_time: feature.session_time,
                                authorizationKey: feature.authorization_format.key,
                            },
                        });
                    });
                });
        }
        this.featureForm
            .get('primaryDetails.method_id')
            .valueChanges.pipe(filter(Boolean), takeUntil(this.destroy$))
            .subscribe((id) => {
                const methods: IMethod[] = this.getValueFromObservable(this.serviceMethods$);
                this.selectedMethod.next(methods.find((method) => method.id === id));
            });
        this.selectedMethod.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((method) => {
            this.featureForm.controls.serviceDetails.clear();
            const featureDetails: IFeatureDetails = this.getValueFromObservable(this.featureDetails$);
            method.method_services.forEach((service, index) => {
                const serviceValues = featureDetails?.service_configurations?.[service?.service_id];
                const serviceFormGroup: ServiceFormGroup = new FormGroup({
                    requirements: new FormGroup({}),
                    configurations: new FormGroup({}),
                    is_enable: new FormControl<boolean>(this.isEditMode ? serviceValues?.is_enable : true),
                });
                if (service.requirements) {
                    Object.entries(service.requirements).forEach(([key, config]) => {
                        const formControl = this.createFormControl(
                            config,
                            index,
                            this.isEditMode ? serviceValues?.requirements?.[key]?.value : null
                        );
                        if (formControl) {
                            serviceFormGroup.controls.requirements.addControl(key, formControl);
                        }
                    });
                    Object.entries(service.configurations.fields).forEach(([key, config]) => {
                        const formControl = this.createFormControl(
                            config,
                            index,
                            this.isEditMode ? serviceValues?.configurations?.fields?.[key]?.value : null
                        );
                        if (formControl) {
                            serviceFormGroup.controls.configurations.addControl(key, formControl);
                        }
                    });
                }
                this.featureForm.controls.serviceDetails.push(serviceFormGroup);
            });
        });
        this.createUpdateObject$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((obj) => {
            this.proxyAuthScript = ProxyAuthScript(environment.proxyServer, obj.reference_id);
            if (this.isEditMode) {
                this.nameFieldEditMode = false;
                this.getFeatureDetalis();
            } else {
                setTimeout(() => {
                    this.stepper?.first?.next();
                }, 10);
            }
        });
    }

    public createFeature() {
        if (this.featureForm.controls.authorizationDetails.invalid) {
            this.featureForm.controls.authorizationDetails.markAllAsTouched();
        } else {
            const selectedMethod = cloneDeep(this.selectedMethod.getValue());
            const featureFormData = this.featureForm.value;
            const payload = {
                ...featureFormData.primaryDetails,
                authorization_format: {
                    ...selectedMethod.authorization_format,
                    key: featureFormData.authorizationDetails.authorizationKey,
                },
                session_time: featureFormData.authorizationDetails.session_time,
                services: this.getServicePayload(selectedMethod),
            };
            // Added setTimeout because payload creation might contain promises
            setTimeout(() => {
                this.componentStore.createFeature(payload);
            }, 100);
        }
    }

    public updateFeature(type: 'name' | 'service' | 'authorization') {
        let payload;
        const selectedMethod = cloneDeep(this.selectedMethod.getValue());
        const featureDetails: IFeatureDetails = this.getValueFromObservable(this.featureDetails$);
        switch (type) {
            case 'name':
                const primaryDetailsForm = this.featureForm.controls.primaryDetails;
                if (primaryDetailsForm.valid) {
                    payload = {
                        name: primaryDetailsForm.value.name,
                    };
                } else {
                    primaryDetailsForm.markAllAsTouched();
                    return;
                }
                break;
            case 'authorization':
                const authorizationDetailsForm = this.featureForm.controls.authorizationDetails;
                if (authorizationDetailsForm.valid) {
                    payload = {
                        authorization_format: {
                            ...featureDetails.authorization_format,
                            key: authorizationDetailsForm.value.authorizationKey,
                        },
                        session_time: authorizationDetailsForm.value.session_time,
                    };
                } else {
                    authorizationDetailsForm.markAllAsTouched();
                    return;
                }
                break;
            case 'service':
                if (this.isConfigureMethodValid) {
                    payload = {
                        services: this.getServicePayload(selectedMethod),
                    };
                } else {
                    this.markDirtyServiceFormTouched();
                    return;
                }
                break;
            default:
                payload = {};
                break;
        }
        // Added setTimeout because payload creation might contain promises
        setTimeout(() => {
            this.componentStore.updateFeature({ id: this.featureId, body: payload });
        }, 100);
    }

    private getServicePayload(selectedMethod: IMethod): IMethodService[] {
        const services = [];
        this.featureForm.controls.serviceDetails.controls.forEach((formGroup, index) => {
            if (formGroup.dirty) {
                const service = selectedMethod.method_services[index];
                const formData = formGroup.value;
                this.setFormDataInPayload(service?.requirements, formData.requirements, index);
                this.setFormDataInPayload(service?.configurations?.fields, formData.configurations, index);
                service['is_enable'] = formData.is_enable;
                services.push(service);
            }
        });
        return services;
    }

    private setFormDataInPayload(
        payloadObject: { [key: string]: IFieldConfig },
        formDataObject: { [key: string]: any },
        index: number
    ): void {
        Object.keys(payloadObject ?? {}).forEach((key) => {
            const config = payloadObject[key];
            const promise = this.getValueOtherThanForm(config, index);
            if (promise) {
                promise.then((value) => (config.value = value ?? null));
            } else {
                config.value = formDataObject?.[key];
            }
        });
    }

    public stepChange(event: any) {
        if (!this.isEditMode && event?.previouslySelectedIndex === 0) {
            this.getServiceMethods(this.featureForm.value.primaryDetails.feature_id);
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public getServiceMethods(id: number): void {
        this.componentStore.getServiceMethods(id);
    }

    public getFeatureType() {
        this.componentStore.getFeatureType();
    }

    public getFeatureDetalis() {
        this.componentStore.getFeatureDetalis(this.featureId);
    }

    public getValueOtherThanForm(config: IFieldConfig, index: number): Promise<any> {
        const key = `${config.label}_${index}`;
        if (config.type === FeatureFieldType.ChipList) {
            return new Promise((resolve) =>
                resolve(Array.from(this.chipListValues[key]).join(config?.delimiter ?? ' '))
            );
        } else if (config.type === FeatureFieldType.ReadFile) {
            const file = this.fileValues[key]?.[0];
            if (file) {
                config['fileName'] = file?.name;
                return file?.text();
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public createFormControl(config: IFieldConfig, index: number, value: any = null) {
        if (!config.is_hidden) {
            const validators: ValidatorFn[] = [];
            let formValue = value ?? config.value;
            const key = `${config.label}_${index}`;
            if (config.type === FeatureFieldType.ChipList) {
                this.chipListValues[key] = new Set(formValue?.split(config.delimiter ?? ' ') ?? []);
                this.chipListReadOnlyValues[key] = new Set(config?.read_only_value ?? []);
                formValue = null;
            }
            if (config.type === FeatureFieldType.ReadFile) {
                this.fileValues[key] = null;
                if (config?.fileName) {
                    formValue = config?.fileName;
                }
            }
            if (config.is_required) {
                if (config.type === FeatureFieldType.ChipList) {
                    validators.push(CustomValidators.atleastOneValueInChipList(this.chipListValues[key]));
                } else {
                    validators.push(Validators.required);
                }
            }
            if (config.regex) {
                validators.push(Validators.pattern(config.regex));
            }
            return new FormControl<any>({ value: formValue, disabled: Boolean(config?.is_disable) }, validators);
        } else {
            return null;
        }
    }

    public get isConfigureMethodValid(): boolean {
        let isValid = true;
        const serviceFormArray = this.featureForm.controls.serviceDetails;
        serviceFormArray.controls.forEach((formGroup) => formGroup.dirty && formGroup.invalid && (isValid = false));
        return isValid && serviceFormArray.dirty;
    }
    public markDirtyServiceFormTouched(): void {
        const serviceFormArray = this.featureForm.controls.serviceDetails;
        serviceFormArray.controls.forEach(
            (formGroup, index) =>
                (formGroup.dirty || index === this.selectedServiceIndex) && formGroup.markAllAsTouched()
        );
    }

    public resetFormGroup(formGroup: FormGroup, index: number): void {
        formGroup.reset();
        Object.keys(this.chipListValues)
            .filter((key) => +key.split('_')[1] === index)
            .forEach((key) => (this.chipListValues[key] = new Set(this.chipListReadOnlyValues[key])));
        Object.keys(this.fileValues)
            .filter((key) => +key.split('_')[1] === index)
            .forEach((key) => (this.fileValues[key] = null));
    }

    public updateChipListValues(
        operation: 'add' | 'delete',
        chipListKey: string,
        fieldControl: FormControl,
        value: string
    ): void {
        if (operation === 'add') {
            if (fieldControl.valid && value) {
                this.chipListValues[chipListKey].add(value);
                fieldControl.reset();
            }
        } else if (operation === 'delete') {
            this.chipListValues[chipListKey].delete(value);
            fieldControl.updateValueAndValidity();
        }
    }

    public updateFileValue(
        fileKey: string,
        fieldConfig: IFieldConfig,
        fieldControl: FormControl,
        value: FileList
    ): void {
        if (value) {
            let fileRegex = null;
            const nameArray = [];
            if (fieldConfig?.allowed_types) {
                fileRegex = getAcceptedTypeRegex(fieldConfig?.allowed_types);
            }
            for (let i = 0; i < value.length; i++) {
                if (!fileRegex || this.isFileAllowed(value[i], fileRegex)) {
                    nameArray.push(value[i]?.name);
                } else {
                    setTimeout(() => {
                        fieldControl?.setErrors({
                            ...fieldControl?.errors,
                            customError: 'Selected file is not supported for ' + fieldConfig?.label,
                        });
                    }, 100);
                    value = null;
                    break;
                }
            }
            this.fileValues[fileKey] = value;
            fieldControl.setValue(nameArray.join(', '));
            fieldControl.markAsDirty();
            this.featureForm.markAsDirty();
        } else {
            this.fileValues[fileKey] = null;
            fieldControl.reset();
        }
    }

    private isFileAllowed(file: File, fileRegex: string): boolean {
        if (file?.type) {
            return Boolean(file?.type?.match(fileRegex));
        } else {
            const nameSplit = file?.name?.split('.');
            return Boolean(('.' + nameSplit[nameSplit?.length - 1])?.match(fileRegex));
        }
    }

    public addBillableMetric(): void {
        console.log('Opening dialog with data:', this.billableMetricForm);
        console.log('Form config type:', typeof this.billableMetricForm);
        console.log('Form config keys:', Object.keys(this.billableMetricForm));

        try {
            const dialogRef = this.dialog.open(SimpleDialogComponent, {
                width: '600px',
                height: 'auto',
                maxHeight: '90vh',
                autoFocus: false,
                restoreFocus: false,
                hasBackdrop: true,
                data: {
                    message: 'Add New Metric',
                    formConfig: this.billableMetricForm,
                },
            });

            console.log('Dialog reference created:', dialogRef);

            dialogRef.afterClosed().subscribe((result) => {
                console.log('Dialog closed with result:', result);
                if (result) {
                    // Add the new metric to the table
                    this.addMetricToTable(result);
                }
            });
        } catch (error) {
            console.error('Error opening dialog:', error);
        }
    }

    private addMetricToTable(metricData: any): void {
        // Add the new metric to the data source
        const newMetric: PeriodicElement = {
            position: this.ELEMENT_DATA.length + 1,
            name: metricData.name,
            weight: 0, // Default weight
            symbol: metricData.code || 'N/A',
        };
        this.ELEMENT_DATA.push(newMetric);
        this.dataSource = [...this.ELEMENT_DATA];
    }

    public previewFeature(): void {
        const configuration = {
            referenceId:
                this.getValueFromObservable(this.createUpdateObject$)?.reference_id ??
                this.getValueFromObservable(this.featureDetails$)?.reference_id,
            target: '_blank',
            success: (data) => {
                // get verified token in response
                this.ngZone.run(() => {
                    this.toast.success('Authorization successfully completed');
                });
            },
            failure: (error) => {
                // handle error
                this.ngZone.run(() => {
                    this.toast.error(error?.message);
                });
            },
        };
        if (!this.scriptLoaded.getValue()) {
            this.loadingScript.next(true);
            const head = document.getElementsByTagName('head')[0];
            const currentTimestamp = new Date().getTime();
            const otpProviderScript = document.createElement('script');
            otpProviderScript.type = 'text/javascript';
            otpProviderScript.src = ProxyAuthScriptUrl(environment.proxyServer, currentTimestamp);
            head.appendChild(otpProviderScript);
            otpProviderScript.onload = () => {
                this.loadingScript.next(false);
                window?.['initVerification']?.(configuration);
            };
            this.scriptLoaded.next(true);
        } else {
            window?.['initVerification']?.(configuration);
        }
    }
}
