import { ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash-es';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import { BehaviorSubject, Observable, filter, take, takeUntil } from 'rxjs';
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
} from '@proxy/models/features-model';
import { FormArray, FormControl, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { CAMPAIGN_NAME_REGEX, ONLY_INTEGER_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { environment } from '../../../environments/environment';

type ServiceFormGroup = FormGroup<{
    requirements: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    configurations: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
}>;

@Component({
    selector: 'proxy-create-feature',
    templateUrl: './create-feature.component.html',
    styleUrls: ['./create-feature.component.scss'],
    providers: [CreateFeatureComponentStore],
})
export class CreateFeatureComponent extends BaseComponent implements OnDestroy, OnInit {
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

    public featureFieldType = FeatureFieldType;
    public proxyAuthScript = ProxyAuthScript(environment.proxyServer);

    // Chip list
    public chipListSeparatorKeysCodes: number[] = [ENTER, COMMA];
    public chipListValues: { [key: string]: Set<string> } = {};
    public chipListReadOnlyValues: { [key: string]: Set<string> } = {};

    public featureForm = new FormGroup({
        primaryDetails: new FormGroup({
            name: new FormControl<string>(null, [
                Validators.required,
                Validators.pattern(CAMPAIGN_NAME_REGEX),
                CustomValidators.minLengthThreeWithoutSpace,
                Validators.maxLength(60),
            ]),
            feature_id: new FormControl<number>(null, [Validators.required]),
            method_id: new FormControl<number>(null, [Validators.required]),
        }),
        serviceDetails: new FormArray<ServiceFormGroup>([]),
        authorizationDetails: new FormGroup({
            session_time: new FormControl<number>(null, [Validators.required, Validators.pattern(ONLY_INTEGER_REGEX)]),
            authorizationKey: new FormControl<string>(null, [
                Validators.required,
                CustomValidators.minLengthThreeWithoutSpace,
            ]),
        }),
    });

    constructor(private componentStore: CreateFeatureComponentStore, private activatedRoute: ActivatedRoute) {
        super();
    }

    ngOnInit(): void {
        this.activatedRoute.params.subscribe((params) => {
            if (params?.id) {
                this.featureId = params.id;
                this.isEditMode = true;
                this.getFeatureDetalis();
            } else {
                this.getFeatureType();
            }
        });
        if (!this.isEditMode) {
            this.featureType$.pipe(takeUntil(this.destroy$), filter(Boolean)).subscribe((features) => {
                this.featureForm.get('primaryDetails.feature_id').setValue(features[0].id);
            });
            // Selecting first method because there is no form for `method_id` selection currently
            this.serviceMethods$.pipe(takeUntil(this.destroy$), filter(Boolean)).subscribe((methods) => {
                this.featureForm.get('primaryDetails.method_id').setValue(methods[0].id);
            });
        } else {
            this.featureDetails$.pipe(takeUntil(this.destroy$), filter(Boolean)).subscribe((feature) => {
                this.getServiceMethods(feature.feature_id);
                this.proxyAuthScript = ProxyAuthScript(environment.proxyServer, feature.reference_id);
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
            .valueChanges.pipe(takeUntil(this.destroy$), filter(Boolean))
            .subscribe((id) => {
                const methods: IMethod[] = this.getValueFromObservable(this.serviceMethods$);
                this.selectedMethod.next(methods.find((method) => method.id === id));
            });
        this.selectedMethod.pipe(takeUntil(this.destroy$), filter(Boolean)).subscribe((method) => {
            const featureDetails: IFeatureDetails = this.getValueFromObservable(this.featureDetails$);
            method.method_services.forEach((service, index) => {
                const serviceValues = featureDetails?.service_configurations?.[index];
                const serviceFormGroup: ServiceFormGroup = new FormGroup({
                    requirements: new FormGroup({}),
                    configurations: new FormGroup({}),
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
        this.createUpdateObject$.pipe(takeUntil(this.destroy$), filter(Boolean)).subscribe((obj) => {
            this.proxyAuthScript = ProxyAuthScript(environment.proxyServer, obj.reference_id);
            this.nameFieldEditMode = false;
            this.getFeatureDetalis();
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
            console.log(payload);
            this.componentStore.createFeature(payload);
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
                const serviceDetailsForm = this.featureForm.controls.serviceDetails;
                if (serviceDetailsForm.valid) {
                    payload = {
                        services: this.getServicePayload(selectedMethod),
                    };
                } else {
                    serviceDetailsForm.markAllAsTouched();
                    return;
                }
                break;
            default:
                payload = {};
                break;
        }
        this.componentStore.updateFeature({ id: this.featureId, body: payload });
    }

    private getServicePayload(selectedMethod: IMethod): IMethodService[] {
        const services = [];
        this.featureForm.controls.serviceDetails.controls.forEach((formGroup, index) => {
            if (formGroup.dirty) {
                const service = selectedMethod.method_services[index];
                const formData = formGroup.value;
                Object.keys(service?.requirements ?? {}).forEach((key) => {
                    const config = service.requirements[key];
                    config.value = this.getValueOtherThanForm(config, index) ?? formData.requirements[key];
                });
                Object.keys(service?.configurations?.fields ?? {}).forEach((key) => {
                    const config = service.configurations.fields[key];
                    config.value = this.getValueOtherThanForm(config, index) ?? formData.configurations[key];
                });
                services.push(service);
            }
        });
        return services;
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

    public getValueOtherThanForm(config: IFieldConfig, index: number): any {
        if (config.type === FeatureFieldType.ChipList) {
            const key = `${config.label}_${index}`;
            return Array.from(this.chipListValues[key]).join(config?.delimiter ?? ' ');
        }
        return null;
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
            return new FormControl<any>(formValue, validators);
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

    public resetFormGroup(formGroup: FormGroup, index: number): void {
        formGroup.reset();
        Object.keys(this.chipListValues)
            .filter((key) => +key.split('_')[1] === index)
            .forEach((key) => (this.chipListValues[key] = new Set(this.chipListReadOnlyValues[key])));
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
}