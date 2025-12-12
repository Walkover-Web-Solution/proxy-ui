import { ActivatedRoute } from '@angular/router';
import { cloneDeep, isEqual } from 'lodash-es';
import { Component, OnDestroy, OnInit, NgZone, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
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
import { MatDialogRef } from '@angular/material/dialog';
import { getAcceptedTypeRegex } from '@proxy/utils';
import { SimpleDialogComponent } from './simple-dialog/simple-dialog.component';
import { CreatePlanDialogComponent } from './create-plan-dialog/create-plan-dialog.component';
import { CreateTaxDialogComponent } from './create-tax-dialog/create-tax-dialog.component';
import { ConfirmDialogComponent } from '@proxy/ui/confirm-dialog';
type ServiceFormGroup = FormGroup<{
    requirements: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    configurations: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    createPlanForm: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    chargesForm: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    is_enable: FormControl<boolean>;
}>;
type PlanFormGroup = FormGroup<{
    createPlanForm: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    chargesForm: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
}>;
type TaxesFormGroup = FormGroup<{
    taxesForm: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
}>;

export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
    type?: string;
    aggregation?: string;
    code?: string;
}
@Component({
    selector: 'proxy-create-feature',
    templateUrl: './create-feature.component.html',
    styleUrls: ['./create-feature.component.scss'],
    providers: [CreateFeatureComponentStore],
})
export class CreateFeatureComponent extends BaseComponent implements OnDestroy, OnInit {
    @ViewChildren('stepper') stepper: QueryList<MatStepper>;
    public taxes: any[] = [];
    public createPlanForm: any;
    public taxConfigData: any;
    public taxesForm: any;
    private openPlanDialogRef: any = null;
    public billableMetricstabledata: any[];
    public createdPlanData: any[];
    public displayedColumns: string[] = ['name', 'code', 'type', 'aggregation', 'action'];
    public plansOverviewDisplayedColumns: string[] = [
        'planName',
        'code',
        'billingPeriod',
        'price',
        'currency',
        'status',
    ];
    public dataSource: any;

    // Getter for dynamic plans overview columns
    public get plansOverviewColumns(): string[] {
        const baseColumns = ['planName', 'code', 'billingPeriod', 'price', 'currency', 'status'];
        if (this.selectedSubscriptionServiceIndex === -1 && this.isEditMode) {
            return [...baseColumns, 'action'];
        }
        return baseColumns;
    }
    public pageSizeOptions: number[] = [5, 10, 25, 100];

    // Charges table properties
    public chargesList: any[] = [];
    public chargesDisplayedColumns: string[] = ['metric', 'maxLimit', 'actions'];
    public taxesDisplayedColumns: string[] = ['name', 'code', 'rate', 'action'];
    public taxesData: any[] = [];

    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public featureType$: Observable<IFeatureType[]> = this.componentStore.featureType$;
    public serviceMethods$: Observable<IMethod[]> = this.componentStore.serviceMethods$;
    public createUpdateObject$: Observable<IFeature> = this.componentStore.createUpdateObject$;
    public featureDetails$: Observable<IFeatureDetails> = this.componentStore.featureDetails$;
    public createBillableMetric$: Observable<any> = this.componentStore.createBillableMetric$;
    public billableMetrics$: Observable<any> = this.componentStore.billableMetrics$;
    public deleteBillableMetric$: Observable<any> = this.componentStore.deleteBillableMetric$;
    public updateBillableMetric$: Observable<any> = this.componentStore.updateBillableMetric$;
    public taxes$: Observable<any> = this.componentStore.taxes$;
    public createTax$: Observable<any> = this.componentStore.createTax$;
    public deleteTax$: Observable<any> = this.componentStore.deleteTax$;
    public createPlan$: Observable<any> = this.componentStore.createPlan$;
    public planData$: Observable<any> = this.componentStore.planData$;
    public deletePlan$: Observable<any> = this.componentStore.deletePlan$;
    public updatePlan$: Observable<any> = this.componentStore.updatePlan$;
    public paymentDetailsForm$: Observable<any> = this.componentStore.paymentDetailsForm$;
    public paymentDetailsById$: Observable<any> = this.componentStore.paymentDetailsById$;
    public updatePaymentDetails$: Observable<any> = this.componentStore.updatePaymentDetails$;

    public isEditMode = false;
    public previewInputPosition: 'top' | 'bottom' = 'top';
    public selectedServiceIndex = 0;
    public selectedSubscriptionServiceIndex = -2;

    public selectedMethod = new BehaviorSubject<IMethod>(null);
    public featureId: number = null;
    public nameFieldEditMode = false;
    public loadingScript = new BehaviorSubject<boolean>(false);
    public scriptLoaded = new BehaviorSubject<boolean>(false);
    public showApiConfigurationErrors = false;
    public canCreatePlansFormControls = false;
    public billableMetricsFormFields: any;
    public paymentDetailsFormFields: any;
    public paymentDetailsData: any;
    public featureFieldType = FeatureFieldType;
    public proxyAuthScript = ProxyAuthScript(environment.proxyServer);

    // Chip list
    public chipListSeparatorKeysCodes: number[] = [ENTER, COMMA];
    public chipListValues: { [key: string]: Set<string> } = {};
    public chipListReadOnlyValues: { [key: string]: Set<string> } = {};

    // File
    public fileValues: { [key: string]: FileList } = {};

    // Options cache for select fields
    private optionsCache: { [key: string]: any[] } = {};

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
        planDetails: new FormArray<any>([]),
        taxesForm: new FormArray<any>([]),
        paymentDetailsForm: new FormArray<any>([]),
        plansOverview: new FormGroup({
            planSelected: new FormControl<string>(null, [Validators.required]),
        }),
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
            theme: new FormControl<string>('system', []),
            allowNewUserRegistration: new FormControl<boolean>(false, []),
            showSocialLoginIcons: new FormControl<boolean>(false, []),
            blockNewUserSignUps: new FormControl<boolean>(false, []),
        }),
        // New form controls for conditional steps
    });
    public demoDiv$: Observable<string> = of(null);
    public keepOrder = () => 0;
    constructor(
        private componentStore: CreateFeatureComponentStore,
        private cdr: ChangeDetectorRef,
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

        if (!this.isEditMode) {
            this.featureType$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((features) => {
                this.featureForm.get('primaryDetails.feature_id').setValue(features[0].id);
                if (features?.length === 1) {
                    this.stepper?.first?.next();
                }
            });
            // Selecting first method because there is no form for `method_id` selection currently
            this.serviceMethods$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((methods) => {
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

                    this.proxyAuthScript = ProxyAuthScript(
                        environment.proxyServer,
                        feature.reference_id,
                        feature.feature_id === 1 ? 'authorization' : 'subscription'
                    );
                    this.demoDiv$ = of(`<div id="${feature.reference_id}"></div>`);

                    // Initialize billable metrics form fields for edit mode
                    if (feature.feature_id === 2) {
                        this.getAllBillableMetrics(feature.reference_id);
                        this.getAllPlans(feature.reference_id);
                        this.createBillableMetricsFormControls();
                    }
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
                                theme: feature.extra_configurations?.theme || 'system',
                                allowNewUserRegistration: feature.extra_configurations?.create_account_link || false,
                                blockNewUserSignUps: feature.block_registration || false,
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

            // Initialize billable metrics form fields when method is loaded in edit mode
            if (this.isEditMode && featureDetails?.feature_id === 2) {
                this.createBillableMetricsFormControls();
            }

            method.method_services.forEach((service, index) => {
                const serviceValues = featureDetails?.service_configurations?.[service?.service_id];
                const serviceFormGroup: ServiceFormGroup = new FormGroup({
                    requirements: new FormGroup({}),
                    configurations: new FormGroup({}),
                    createPlanForm: new FormGroup({}),
                    chargesForm: new FormGroup({}),
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
            this.proxyAuthScript = ProxyAuthScript(
                environment.proxyServer,
                obj.reference_id,
                obj.feature_id === 1 ? 'authorization' : 'subscription'
            );

            if (this.isEditMode) {
                this.nameFieldEditMode = false;
                this.getFeatureDetalis();
            }
            if (obj?.feature_id === 2) {
                const referenceId = obj.reference_id;
                this.getAllBillableMetrics(referenceId);
                this.getTaxes(referenceId);
                setTimeout(() => {
                    this.stepper?.first?.next();
                }, 10);
            } else {
                setTimeout(() => {
                    this.stepper?.first?.next();
                }, 10);
            }
        });

        this.createBillableMetric$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((metric) => {
            if (metric) {
                this.getAllBillableMetrics();
            }
        });
        this.billableMetrics$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((metrics) => {
            if (metrics) {
                this.billableMetricstabledata = metrics.billable_metrics;
            }
        });
        this.deleteBillableMetric$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((metric) => {
            if (metric) {
                this.getAllBillableMetrics();
            }
        });
        this.updateBillableMetric$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((metric) => {
            if (metric) {
                this.getAllBillableMetrics();
            }
        });
        this.taxes$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((taxes) => {
            if (taxes) {
                this.taxes = taxes.taxes;
                this.taxesData = taxes.taxes;
                if (this.taxConfigData) {
                    const cacheKey = this.getCacheKey(this.taxConfigData);
                    delete this.optionsCache[cacheKey];
                }
                // Update taxes in any open plan dialogs
                if (this.openPlanDialogRef && this.openPlanDialogRef.componentInstance) {
                    const planDialog = this.openPlanDialogRef.componentInstance;
                    if (planDialog.data && planDialog.data.optionsData) {
                        planDialog.data.optionsData.taxes = taxes.taxes;
                        // Clear cache in plan dialog
                        if (planDialog.taxConfigData) {
                            const cacheKey = planDialog.getCacheKey(planDialog.taxConfigData);
                            delete planDialog.optionsCache[cacheKey];
                        }
                    }
                }
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            }
        });
        this.createTax$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((tax) => {
            if (tax) {
                setTimeout(() => {
                    const referenceId = this.getReferenceId();
                    if (referenceId) {
                        this.getTaxes(referenceId);
                    }
                }, 500);
            }
        });
        this.deleteTax$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((tax) => {
            if (tax) {
                setTimeout(() => {
                    const referenceId = this.getReferenceId();
                    if (referenceId) {
                        this.getTaxes(referenceId);
                    }
                }, 500);
            }
        });

        this.createPlan$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((plan) => {
            if (plan) {
                this.getAllPlans();
                setTimeout(() => {
                    this.stepper?.first?.next();
                }, 10);
            }
        });
        this.planData$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((plan) => {
            if (plan) {
                this.createdPlanData = plan.plans;
            }
        });
        this.deletePlan$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((plan) => {
            if (plan) {
                this.getAllPlans();
            }
        });
        this.updatePlan$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((plan) => {
            if (plan) {
                this.getAllPlans();
            }
        });
        this.paymentDetailsForm$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((paymentDetails) => {
            if (paymentDetails) {
                this.paymentDetailsFormFields = paymentDetails.stripe;
                this.createPaymentDetailsFormControls();
            }
        });
        this.paymentDetailsById$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((paymentDetails) => {
            if (paymentDetails) {
                this.paymentDetailsData = paymentDetails;
                this.updatePaymentDetailsForm();
            }
        });
        this.updatePaymentDetails$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((paymentDetails) => {
            if (paymentDetails) {
                const refId = this.getReferenceId();
                this.componentStore.getPaymentDetailsFormById({ refId: refId });
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
                extra_configurations: {
                    theme: featureFormData.authorizationDetails.theme || 'system',
                    allowNewUserRegistration: featureFormData.authorizationDetails.allowNewUserRegistration || false,
                },
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
                        extra_configurations: {
                            theme: authorizationDetailsForm.value.theme,
                            create_account_link: authorizationDetailsForm.value.allowNewUserRegistration || false,
                            default_role: {
                                name: 'Owner',
                                value: 1,
                            },
                        },
                        block_registration: authorizationDetailsForm.value.blockNewUserSignUps || false,
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
                const delimiter = config.delimiter ?? ' ';
                const chipValues = formValue
                    ? formValue
                          .split(delimiter)
                          .map((v: string) => v.trim())
                          .filter((v: string) => v.length > 0)
                    : [];
                this.chipListValues[key] = new Set(chipValues);
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

    private createPlansFormControls(): void {
        const selectedMethod = this.selectedMethod.getValue();
        if (!selectedMethod) return;
        this.billableMetricsFormFields = (
            selectedMethod.method_services[0].configurations as any
        ).billable_metrics?.fields;
        const planForm = (selectedMethod.method_services[0].configurations as any).plans?.fields;
        this.createPlanForm = planForm;

        const planFormGroup: PlanFormGroup = new FormGroup({
            createPlanForm: new FormGroup({}),
            chargesForm: new FormGroup({}),
        });

        selectedMethod.method_services.forEach((service, index) => {
            if (
                planFormGroup.controls.createPlanForm.controls &&
                Object.keys(planFormGroup.controls.createPlanForm.controls).length > 0
            ) {
                return;
            }

            if ((service.configurations as any)?.plans?.fields) {
                const allKeys = Object.keys((service.configurations as any)?.plans?.fields);
                const keysToInclude = allKeys.slice(0, -2);

                keysToInclude.forEach((key) => {
                    const config = planForm[key];
                    const formControl = this.createFormControl(config as IFieldConfig, index, null);
                    if (formControl) {
                        planFormGroup.controls.createPlanForm.addControl(key, formControl);
                    }
                });

                const lastKeys = allKeys.slice(-2);
                lastKeys.forEach((key) => {
                    const config = planForm[key];
                    const formControl = this.createFormControl(config as IFieldConfig, index, null);
                    if (formControl) {
                        planFormGroup.controls.chargesForm.addControl(key, formControl);
                    }
                });
            }
        });

        this.featureForm.controls.planDetails.push(planFormGroup);
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
            const trimmedValue = value?.trim();
            if (fieldControl.valid && trimmedValue && trimmedValue.length > 0) {
                this.chipListValues[chipListKey].add(trimmedValue);
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
                    formConfig: this.billableMetricsFormFields,
                },
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    const referenceId = this.getReferenceId();
                    this.componentStore.createBillableMetric({
                        referenceId: referenceId,
                        body: {
                            ...result,
                            reference_id: referenceId,
                        },
                    });
                }
            });
        } catch (error) {
            console.error('Error opening dialog:', error);
        }
    }

    public editMetric(metric: any, index: number): void {
        // Transform API data to match form configuration
        const editData = this.transformMetricToFormData(metric);

        const billableMetricsFormFields = this.billableMetricsFormFields;

        const dialogRef = this.dialog.open(SimpleDialogComponent, {
            height: 'auto',
            maxHeight: '90vh',
            autoFocus: false,
            restoreFocus: false,
            hasBackdrop: true,
            data: {
                message: 'Edit Metric',
                formConfig: this.billableMetricsFormFields,
                dialogTitle: 'Edit Metric',
                submitButtonText: 'Update Metric',
                editData: editData, // Pass transformed data for editing
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.updateMetricInTable(result, index);
            }
        });
    }

    public deleteMetric(index: number): void {
        const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent);
        const componentInstance = dialogRef.componentInstance;
        componentInstance.confirmationMessage = `Are you sure to delete this metric?`;
        componentInstance.confirmButtonText = 'Delete';
        dialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes') {
                this.componentStore.deleteBillableMetric({
                    refId: this.getReferenceId(),
                    code: this.billableMetricstabledata[index].code,
                });
            }
        });
    }

    private updateMetricInTable(metricData: any, index: number): void {
        this.componentStore.updateBillableMetric({
            refId: this.getReferenceId(),
            code: this.billableMetricstabledata[index].code,
            body: metricData,
        });
    }

    private getAggregationLabel(aggregationType: string): string {
        // Extract aggregation mapping from form configuration dynamically
        if (!this.billableMetricsFormFields || !this.billableMetricsFormFields.aggregation_type) {
            return aggregationType || 'N/A';
        }

        const aggregationConfig = this.billableMetricsFormFields.aggregation_type;
        if (aggregationConfig.sourceFieldLabel && aggregationConfig.sourceFieldValue) {
            const index = aggregationConfig.sourceFieldValue.indexOf(aggregationType);
            return index !== -1 ? aggregationConfig.sourceFieldLabel[index] : 'N/A';
        }
        return 'N/A';
    }

    private transformMetricToFormData(metric: any): any {
        const formData: any = {};

        // Map each field directly from the metric object
        Object.keys(this.billableMetricsFormFields).forEach((formField) => {
            if (metric[formField] !== undefined) {
                formData[formField] = metric[formField];
            } else {
                // Set default values for missing fields
                const fieldConfig = this.billableMetricsFormFields[formField];
                formData[formField] = this.getDefaultValue(fieldConfig);
            }
        });

        return formData;
    }

    private getDefaultValue(fieldConfig: any): any {
        // Return appropriate default value based on field type
        if (fieldConfig.value_type === 'integer' || fieldConfig.value_type === 'number') {
            return 0;
        } else if (fieldConfig.value_type === 'boolean') {
            return false;
        } else {
            return '';
        }
    }

    // Charges table methods
    public addCharge(): void {
        // Get the current form values from chargesForm
        const serviceDetailsArray = this.featureForm.get('planDetails') as FormArray;
        const serviceForm = serviceDetailsArray?.at(this.selectedServiceIndex);
        if (serviceForm) {
            const chargesForm = serviceForm.get('chargesForm');
            const createPlanForm = serviceForm.get('createPlanForm');

            // Add charge even if form is not completely valid, just check if we have some data
            const metricValue = chargesForm?.get('billable_metric_id')?.value;
            const modelValue = chargesForm?.get('charge_model')?.value;
            const amountValue = chargesForm?.get('amount')?.value;
            const maxLimitValue = chargesForm?.get('max_limit')?.value;

            if (metricValue || modelValue || amountValue) {
                const chargeData = {
                    billable_metric_id: metricValue || 'N/A',
                    max_limit: maxLimitValue || 'N/A',
                };
                this.chargesList.push(chargeData);
                // Force change detection by creating a new array reference
                this.chargesList = [...this.chargesList];
                chargesForm?.reset();
            }
        }
    }

    public removeCharge(index: number): void {
        this.chargesList.splice(index, 1);
        this.chargesList = [...this.chargesList];
    }
    public previewFeature(): void {
        const featureId =
            this.getValueFromObservable(this.createUpdateObject$)?.feature_id ??
            this.getValueFromObservable(this.featureDetails$)?.feature_id;

        const configuration = {
            referenceId:
                this.getValueFromObservable(this.createUpdateObject$)?.reference_id ??
                this.getValueFromObservable(this.featureDetails$)?.reference_id,
            type: featureId === 1 ? 'authorization' : 'subscription',
            isPreview: true,
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
    public getPlansForm(): void {
        const selectedMethod = cloneDeep(this.selectedMethod.getValue());
        const services = this.getServicePayload(selectedMethod);
        const featureFormData = this.featureForm.value;

        const originalService = selectedMethod?.method_services?.[0];
        const transformedObjects = this.mergeObjects(featureFormData, originalService);

        setTimeout(() => {
            this.componentStore.createFeature(transformedObjects);
        }, 100);
    }
    public mergeObjects(primaryObj: any, serviceObj: any) {
        return {
            name: primaryObj.primaryDetails?.name || serviceObj?.name || null,
            feature_id: primaryObj.primaryDetails?.feature_id || null,
            method_id: primaryObj.primaryDetails?.method_id || serviceObj?.method_id || null,
            services: [
                {
                    service_id: serviceObj?.service_id || null,
                    configurations: {
                        fields: Object.entries(primaryObj.serviceDetails?.[0]?.configurations || {}).reduce(
                            (acc: any, [key, value]: any) => {
                                acc[key] = { value };
                                return acc;
                            },
                            {}
                        ),
                        mappings: serviceObj?.configurations?.mappings || [],
                    },
                    requirements: primaryObj.serviceDetails?.[0]?.requirements || serviceObj?.requirements || {},
                },
            ],
        };
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

        if (fieldConfig.label === 'Tax Codes' || fieldConfig.label === 'Billable Metric') {
            options = this.getApiOptions(fieldConfig);
        } else if (fieldConfig.source && Array.isArray(fieldConfig.source)) {
            options = fieldConfig.source.map((value: string) => ({
                label: value,
                value: value,
            }));
        } else if (
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

        if (fieldConfig.filter_conditions) {
            options = this.applyFilterConditions(fieldConfig, options);
        }

        this.optionsCache[cacheKey] = options;
        return options;
    }

    // Separate function for API calls
    public getApiOptions(fieldConfig: any): any[] {
        if (fieldConfig.label === 'Tax Codes') {
            this.taxConfigData = fieldConfig;
            return this.getTaxOptionsFromData();
        } else if (fieldConfig.label === 'Billable Metric' && this.billableMetricstabledata) {
            return this.billableMetricstabledata.map((metric) => ({
                label: metric.name,
                value: metric.lago_id,
            }));
        }

        return [];
    }

    public getTaxOptionsFromData(): any[] {
        if (this.taxes) {
            return this.taxes.map((tax: any) => ({
                label: `${tax.name} (${tax.rate}%)`,
                value: tax.code,
                lago_id: tax.lago_id,
                rate: tax.rate,
                description: tax.description,
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

        const fieldValue = this.featureForm?.get(whenCondition.field)?.value;

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

    private getCacheKey(fieldConfig: any): string {
        let cacheKey = fieldConfig.label;

        // If field has filter conditions, include the current form values that affect it
        if (fieldConfig.filter_conditions) {
            const affectingValues: string[] = [];
            fieldConfig.filter_conditions.forEach((condition: any) => {
                if (condition.when?.field) {
                    const fieldValue = this.featureForm?.get(condition.when.field)?.value;
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

    public get isOrganizationDetailsValid(): boolean {
        let isValid = true;
        const serviceFormArray = this.featureForm.controls.serviceDetails;
        serviceFormArray.controls.forEach((formGroup) => formGroup.dirty && formGroup.invalid && (isValid = false));
        this.canCreatePlansFormControls = true;
        return isValid && serviceFormArray.dirty;
    }
    public markDirtyOrganizationDetailsFormTouched(): void {
        const serviceFormArray = this.featureForm.controls.serviceDetails;

        serviceFormArray.controls.forEach(
            (formGroup, index) =>
                (formGroup.dirty || index === this.selectedServiceIndex) && formGroup.markAllAsTouched()
        );
        if (this.isOrganizationDetailsValid) {
            this.createPlansFormControlsOnDemand();
        }
    }
    public createPlansFormControlsOnDemand(): void {
        if (this.canCreatePlansFormControls) {
            this.createBillableMetricsFormControls();
            this.getPlansForm();
            this.getAllBillableMetrics();
        }
    }
    // Function to get reference ID
    public getReferenceId(): string | null {
        const createUpdateObject = this.getValueFromObservable(this.createUpdateObject$);
        const featureDetails = this.getValueFromObservable(this.featureDetails$);

        return createUpdateObject?.reference_id ?? featureDetails?.reference_id ?? null;
    }
    public getAllBillableMetrics(referenceId?: string) {
        const refId = referenceId || this.getReferenceId();
        if (refId) {
            this.componentStore.getAllBillableMetrics({ referenceId: refId });
        }
    }

    private transformPayloadToPlanMeta(formData: any, formConfig: { [key: string]: IFieldConfig }, index: number): any {
        const getChipArray = (key: string): string[] => {
            const config = formConfig?.[key];
            if (config?.type === FeatureFieldType.ChipList) {
                const chipKey = `${config.label}_${index}`;
                return this.chipListValues[chipKey] ? Array.from(this.chipListValues[chipKey]) : [];
            }
            return [];
        };

        const metrics = getChipArray('metrics');
        const featureIncluded = getChipArray('feature_included');
        const featureNotIncluded = getChipArray('feature_not_included');
        const extras = getChipArray('extras');

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
            amount_cents:
                typeof formData.amount_cents === 'string' ? parseFloat(formData.amount_cents) : formData.amount_cents,
            tax_codes: formData.tax_codes
                ? Array.isArray(formData.tax_codes)
                    ? formData.tax_codes
                    : [formData.tax_codes]
                : [],
            ...(Object.keys(planMeta).length > 0 && { plan_meta: planMeta }),
        };
    }

    public createPlanAndGenerateSnippet(): void {
        this.markDirtyCreatePlansFormControlsTouched();

        const serviceDetailsArray = this.featureForm.get('planDetails') as FormArray;
        const serviceForm = serviceDetailsArray?.at(this.selectedServiceIndex);

        if (serviceForm) {
            const chargesForm = serviceForm.get('chargesForm');
            const createPlanForm = serviceForm.get('createPlanForm');

            const createPlanFormData = createPlanForm.value;

            // Process the payload - preserve original amount type
            const processedCharges = this.chargesList.map((charge) => ({
                billable_metric_id: charge.billable_metric_id,
                max_limit: charge.max_limit,
            }));

            // Transform payload to nested plan_meta structure
            const transformedPayload = this.transformPayloadToPlanMeta(
                createPlanFormData,
                this.createPlanForm,
                this.selectedServiceIndex
            );

            // Add charges and refId to the payload
            const payload = {
                ...transformedPayload,
                charges: processedCharges,
                refId: this.getReferenceId(),
            };
            if (this.isCreatePlansFormControlsValid) {
                this.componentStore.createPlan(of(payload));
            }
        }
    }

    public get isCreatePlansFormControlsValid(): boolean {
        let isValid = true;
        const serviceFormArray = this.featureForm.controls.planDetails;
        serviceFormArray.controls.forEach((formGroup) => formGroup.dirty && formGroup.invalid && (isValid = false));
        return isValid && serviceFormArray.dirty;
    }
    public markDirtyCreatePlansFormControlsTouched(): void {
        const serviceFormArray = this.featureForm.controls.planDetails;
        serviceFormArray.controls.forEach((formGroup) => formGroup.markAllAsTouched());
    }
    public getCreatePlansFormData(): void {
        this.createPlansFormControls();
    }
    public createBillableMetricsFormControls(): void {
        const selectedMethod = this.selectedMethod.getValue();
        if (!selectedMethod) return;
        this.billableMetricsFormFields = (
            selectedMethod.method_services[0].configurations as any
        ).billable_metrics?.fields;
    }
    public getTaxes(referenceId?: string): void {
        this.componentStore.getTaxes({ refId: referenceId || this.getReferenceId() });
    }
    public getAllPlans(referenceId?: string): void {
        this.componentStore.getAllPlans({ refId: referenceId || this.getReferenceId() });
    }
    public editPlan(plan: any): void {
        if (!this.billableMetricstabledata || this.billableMetricstabledata.length === 0) {
            this.getAllBillableMetrics();
        }

        if (!this.taxes || this.taxes.length === 0) {
            this.getTaxes();
        }

        // Wait a bit for data to load, then open dialog
        setTimeout(() => {
            this.openEditPlanDialog(plan);
        }, 500);
    }

    private openEditPlanDialog(plan: any, isAddPlan: boolean = false): void {
        try {
            if (!this.createPlanForm) {
                this.createPlansFormControls();
                this.getTaxFormConfig();
            }
            const formConfig = {
                createPlanForm: this.createPlanForm || {},
                chargesForm: this.getChargesFormConfig() || {},
            };
            const editData = isAddPlan ? null : this.transformPlanToFormData(plan);
            const optionsData = {
                taxes: Array.isArray(this.taxes) ? this.taxes : [],
                billableMetrics: Array.isArray(this.billableMetricstabledata) ? this.billableMetricstabledata : [],
            };

            this.openPlanDialogRef = this.dialog.open(CreatePlanDialogComponent, {
                width: '800px',
                height: 'auto',
                maxHeight: '90vh',
                autoFocus: false,
                restoreFocus: false,
                hasBackdrop: true,
                data: {
                    formConfig: formConfig,
                    dialogTitle: isAddPlan ? 'Add Plan' : 'Edit Plan',
                    submitButtonText: isAddPlan ? 'Add Plan' : 'Update Plan',
                    editData: editData,
                    metaData: plan && plan.plan_meta ? plan.plan_meta || {} : {},
                    chipListValues: this.chipListValues,
                    chargesList: isAddPlan ? [] : Array.isArray(plan.charges) ? plan.charges : [],
                    optionsData: optionsData,
                    referenceId: this.getReferenceId(),
                    onCreateTax: (payload: any) => {
                        this.componentStore.createTax(of(payload));
                    },
                },
                panelClass: 'mat-dialog-md',
            });

            this.openPlanDialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    if (isAddPlan) {
                        // For Add Plan, include reference ID
                        const createPayload = {
                            refId: this.getReferenceId(),
                            ...result,
                        };
                        this.componentStore.createPlan(of(createPayload));
                    } else {
                        // For Edit Plan, include reference ID and code from the original plan
                        const updatePayload = {
                            refId: this.getReferenceId(),
                            code: plan.code,
                            body: result,
                        };
                        this.componentStore.updatePlan(of(updatePayload));
                    }
                }
                this.openPlanDialogRef = null; // Clear reference when dialog closes
            });
        } catch (error) {
            this.toast.error('Failed to open edit dialog: ' + error.message);
        }
    }
    public deletePlan(plan: any): void {
        const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent);
        const componentInstance = dialogRef.componentInstance;
        componentInstance.confirmationMessage = `Are you sure to delete this metric?`;
        componentInstance.confirmButtonText = 'Delete';
        dialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes') {
                this.componentStore.deletePlan({ refId: this.getReferenceId(), code: plan.code });
            }
        });
    }

    private getChargesFormConfig(): any {
        const selectedMethod = this.selectedMethod.getValue();
        if (!selectedMethod) return {};

        const planForm = (selectedMethod.method_services[0].configurations as any).plans?.fields;
        if (!planForm) return {};

        const allKeys = Object.keys(planForm);
        const lastKeys = allKeys.slice(-2); // Get the last 2 keys for charges form

        const chargesConfig = {};
        lastKeys.forEach((key) => {
            chargesConfig[key] = planForm[key];
        });

        return chargesConfig;
    }

    private transformPlanToFormData(plan: any): any {
        const createPlanFormData = {};
        const chargesFormData = {};

        // Dynamic mapping based on form configuration
        if (this.createPlanForm) {
            Object.keys(this.createPlanForm).forEach((fieldKey) => {
                const fieldConfig = this.createPlanForm[fieldKey];
                const fieldLabel = fieldConfig?.label?.toLowerCase();

                // Map plan properties to form fields based on field labels and common patterns
                let value = this.getPlanValueForField(plan, fieldKey, fieldLabel);

                if (value !== undefined && value !== null) {
                    createPlanFormData[fieldKey] = value;
                }
            });
        }

        return {
            createPlanForm: createPlanFormData,
            chargesForm: chargesFormData,
            charges: plan.charges || [],
        };
    }

    private getPlanValueForField(plan: any, fieldKey: string, fieldLabel: string): any {
        // Direct field mapping
        if (plan[fieldKey] !== undefined) {
            return plan[fieldKey];
        }

        // Label-based mapping
        if (fieldLabel) {
            // Handle amount fields
            if (fieldLabel.includes('amount') && plan.amount_cents !== undefined) {
                return plan.amount_cents; // Convert cents to dollars
            }

            // Handle currency fields
            if (fieldLabel.includes('currency') && plan.amount_currency) {
                return plan.amount_currency;
            }

            // Handle billing period/interval fields
            if (
                (fieldLabel.includes('billing') || fieldLabel.includes('period') || fieldLabel.includes('interval')) &&
                plan.interval
            ) {
                return plan.interval;
            }

            // Handle trial period fields
            if (fieldLabel.includes('trial') && plan.trial_period !== undefined) {
                return plan.trial_period;
            }

            // Handle pay in advance fields
            if (fieldLabel.includes('advance') && plan.pay_in_advance !== undefined) {
                return plan.pay_in_advance;
            }

            // Handle tax fields
            if (fieldLabel.includes('tax') && plan.taxes && Array.isArray(plan.taxes)) {
                const taxCodes = plan.taxes.map((tax) => tax.code);
                // Return array for multi-select, single value for single select
                return taxCodes.length === 1 ? taxCodes[0] : taxCodes;
            }
        }

        return undefined;
    }

    public addPlan(): void {
        // Ensure taxes and billable metrics are loaded before opening dialog
        if (!this.billableMetricstabledata || this.billableMetricstabledata.length === 0) {
            this.getAllBillableMetrics();
        }

        if (!this.taxes || this.taxes.length === 0) {
            this.getTaxes();
        } // Wait a bit for data to load, then open dialog
        setTimeout(() => {
            this.openEditPlanDialog(null, true);
        }, 500);
    }
    public getBillableMetricName(billableMetricId: string): string {
        const billableMetric = this.billableMetricstabledata.find((metric: any) => metric.lago_id === billableMetricId);
        return billableMetric ? billableMetric.name : '';
    }
    public getPaymentDetailsFormData(): void {
        this.componentStore.getPaymentDetailsForm(of(null));
    }
    public createPaymentDetailsFormControls(): void {
        const paymentDetailsForm = new FormGroup({
            stripe: new FormGroup({}),
        });
        Object.entries(this.paymentDetailsFormFields).forEach(([key, field]: [string, any]) => {
            const formControl = this.createFormControl(field as IFieldConfig, 0, null);
            if (formControl) {
                paymentDetailsForm.controls.stripe.addControl(key, formControl);
            }
        });
        this.featureForm.controls.paymentDetailsForm.push(paymentDetailsForm);
    }
    public savePaymentDetails(): void {
        const paymentDetailsForm = this.featureForm.controls.paymentDetailsForm.at(0);
        if (paymentDetailsForm) {
            const refId = this.getReferenceId();
            this.componentStore.updatePaymentDetails({ refId: refId, body: paymentDetailsForm.value.stripe });
        }
    }
    public updatePaymentDetails(): void {
        this.selectedSubscriptionServiceIndex = -3;
        this.getPaymentDetailsFormData();
        const refId = this.getReferenceId();
        this.componentStore.getPaymentDetailsFormById({ refId: refId });
    }
    public updatePaymentDetailsForm(): void {
        const paymentDetailsForm = this.featureForm.controls.paymentDetailsForm.at(0);
        if (paymentDetailsForm) {
            paymentDetailsForm.patchValue({ stripe: this.paymentDetailsData });
        }
    }
    public updateTaxes(): void {
        this.selectedSubscriptionServiceIndex = -4;
        this.getTaxes();
    }
    public deleteTax(tax: any): void {
        const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent);
        const componentInstance = dialogRef.componentInstance;
        componentInstance.confirmationMessage = `Are you sure to delete this tax?`;
        componentInstance.confirmButtonText = 'Delete';
        dialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes') {
                this.componentStore.deleteTax({ refId: this.getReferenceId(), code: tax.code });
            }
        });
    }
    public getTaxFormConfig(): any {
        const selectedMethod = this.selectedMethod.getValue();
        if (!selectedMethod) return {};
        const taxForm = (selectedMethod.method_services[0].configurations as any).forms?.taxes?.fields;
        this.taxesForm = taxForm;
        return taxForm;
    }
    public addNewOption(fieldConfig?: any): void {
        const selectedMethod = this.selectedMethod.getValue();
        if (!selectedMethod) return;
        const taxForm = (selectedMethod.method_services[0].configurations as any).forms?.taxes?.fields;
        this.taxesForm = taxForm;

        const formConfig = {
            taxesForm: taxForm || {},
        };

        const optionsData = {
            taxes: Array.isArray(this.taxes) ? this.taxes : [],
        };

        const dialogRef = this.dialog.open(CreateTaxDialogComponent, {
            width: '800px',
            height: 'auto',
            maxHeight: '90vh',
            autoFocus: false,
            restoreFocus: false,
            hasBackdrop: true,
            data: {
                formConfig: formConfig,
                dialogTitle: 'Taxes',
                submitButtonText: 'Save',
                editData: null,
                optionsData: optionsData,
            },
            panelClass: 'mat-dialog-md',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                const createPayload = {
                    refId: this.getReferenceId(),
                    body: result,
                };
                this.componentStore.createTax(of(createPayload));
            }
        });
    }
}
