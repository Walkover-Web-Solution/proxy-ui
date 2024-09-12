import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IFirebaseUserModel } from '@proxy/models/root-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, Observable, takeUntil } from 'rxjs';
import { ILogInFeatureStateWithRootState } from '../../auth/ngrx/store/login.state';
import { select, Store } from '@ngrx/store';
import { RootService } from '@proxy/services/proxy/root';
import { selectLogInData } from '../../auth/ngrx/selector/login.selector';
import { cloneDeep, isEqual } from 'lodash';
import { environment } from 'apps/proxy/src/environments/environment';
import { NewMethodDialogComponentStore } from './new-method-dialog.store';
import { ActivatedRoute } from '@angular/router';
import { PolicyFieldType } from '@proxy/models/endpoint';
import { getAcceptedTypeRegex } from '@proxy/utils';

type PolicyFormGroup = FormGroup<{
    configurations: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    requirements: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
}>;
@Component({
    selector: 'new-method-dialog',
    templateUrl: './new-method-dialog.component.html',
    styleUrls: ['./new-method-dialog.component.scss'],
    providers: [NewMethodDialogComponentStore],
})
export class NewMethodDialogComponent extends BaseComponent implements OnInit {
    public dialogStep = 0;
    public showPage: string;
    public projectSlug: string;
    public projectId: number | string;
    public configureId: number;
    public requestTypes: Array<string> = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    public keyLocation: Array<string> = ['Header', 'Cookies'];
    public veriFicationMethod: Array<string> = ['Api', 'Mysql DB', 'FireBase'];
    public logInData$: Observable<IFirebaseUserModel>;
    public selectedPolicy = new BehaviorSubject<any>(null);
    public dropdownData: { [key: string]: any[] } = {};
    public fetchDropdownData: { [key: string]: BehaviorSubject<boolean> } = {};
    public defineMethodForm = new FormGroup({
        policyDetails: new FormArray<PolicyFormGroup>([]),
        policyName: new FormControl<string>(null, Validators.required),
    });
    public policyFieldType = PolicyFieldType;
    // File
    public fileValues: { [key: string]: FileList } = {};

    public isLoading$: Observable<boolean> = this.ComponentStore.isLoading$;
    public policyType$: Observable<any> = this.ComponentStore.policyType$;
    public singleEndpointData$: Observable<any> = this.ComponentStore.singleEndpointData$;

    constructor(
        public dialogRef: MatDialogRef<NewMethodDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private store: Store<ILogInFeatureStateWithRootState>,
        private rootService: RootService,
        @Inject(NewMethodDialogComponentStore)
        private ComponentStore: NewMethodDialogComponentStore,
        private activatedRoute: ActivatedRoute
    ) {
        super();
        this.showPage = data.type;
        if (data.endpointId && data.projectId) {
            this.getSingleEndpointData(data.projectId, data.endpointId);
        }
        this.projectSlug = data.projectSlug;
        this.logInData$ = this.store.pipe(
            select(selectLogInData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }
    ngOnInit(): void {
        this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            if (params?.projectSlug) {
                this.projectSlug = params.projectSlug;
            }
        });
        if (this.showPage === 'newMethod') {
            this.getPolicy();
        }
        this.selectedPolicy.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((policy) => {
            this.defineMethodForm.controls.policyDetails.clear();
            const PolicyFormGroup: PolicyFormGroup = new FormGroup({
                requirements: new FormGroup({}),
                configurations: new FormGroup({}),
            });
            if (policy?.requirements) {
                Object.entries(policy.requirements).forEach(([key, config]) => {
                    const formControl = this.createFormControl(config, policy.id);
                    if (formControl) {
                        PolicyFormGroup.controls.requirements.addControl(key, formControl);
                    }
                });
            }
            if (policy?.configurations) {
                Object.entries(policy.configurations.fields).forEach(([key, config]) => {
                    const formControl = this.createFormControl(config, policy.id);
                    if (formControl) {
                        PolicyFormGroup.controls.configurations.addControl(key, formControl);
                    }
                });
            }
            this.defineMethodForm.controls.policyDetails.push(PolicyFormGroup);
        });

        if (this.showPage === 'viasocket') {
            combineLatest([this.logInData$]).subscribe(([loginData]) => {
                if (loginData) {
                    this.rootService.generateToken({ source: 'configViaSocket' }).subscribe((res) => {
                        const scriptId = 'viasocket-embed-main-script';
                        const existingScript = document.getElementById(scriptId);
                        if (existingScript) {
                            existingScript.remove();
                        }
                        const scriptElement = document.createElement('script');
                        scriptElement.type = 'text/javascript';
                        scriptElement.src = environment.viasocketEmbededURl;
                        scriptElement.id = scriptId;
                        scriptElement.setAttribute('embedToken', res?.data?.jwt);
                        scriptElement.setAttribute('parentId', 'viasocket-embed-Container');
                        scriptElement.onload = () => {};

                        document.body.appendChild(scriptElement);
                    });
                }
            });
        }
    }
    public closeDialog(): void {
        this.dialogRef.close();
    }
    onSelectionChange(event: any) {
        const policy = this.getValueFromObservable(this.policyType$);
        this.configureId = event.value.service_id;
        this.selectedPolicy.next(policy.find((policy) => policy.name === event.value.name));
    }
    public onsave() {
        const selectedPolicies = cloneDeep(this.selectedPolicy.getValue());

        const formData = this.defineMethodForm.value;

        const data = this.getPolicyPayload(selectedPolicies);
        const payload = {
            name: this.defineMethodForm.get('policyName').value,
            slug: '1ylozt1',
            configurations: data[0].configurations,
            configuration_id: this.configureId,
            credentials: {
                name: 'hhcsdfs',
                requirements: data[0].requirements,
            },
        };
        this.ComponentStore.createPolicies(payload);
    }
    private getPolicyPayload(selectedPolicies) {
        const policies = [];
        this.defineMethodForm.controls.policyDetails.controls.forEach((formGroup, index) => {
            if (formGroup.dirty) {
                const policy = selectedPolicies;
                const formData = formGroup.value;
                this.setFormDataInPayload(policy?.requirements, formData.requirements, index);
                this.setFormDataInPayload(policy?.configurations?.fields, formData.configurations, index);

                policies.push(policy);
            }
        });
        return policies;
    }
    private setFormDataInPayload(
        payloadObject: { [key: string]: any },
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
    public getValueOtherThanForm(config, index: number): Promise<any> {
        const key = `${config.label}_${index}`;
        if (config.type === PolicyFieldType.ReadFile) {
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
    private isFileAllowed(file: File, fileRegex: string): boolean {
        if (file?.type) {
            return Boolean(file?.type?.match(fileRegex));
        } else {
            const nameSplit = file?.name?.split('.');
            return Boolean(('.' + nameSplit[nameSplit?.length - 1])?.match(fileRegex));
        }
    }
    public updateFileValue(fileKey: string, fieldConfig, fieldControl: FormControl, value: FileList): void {
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
            this.defineMethodForm.markAsDirty();
        } else {
            this.fileValues[fileKey] = null;
            fieldControl.reset();
        }
    }
    public createFormControl(config: any, index?: number, value: any = null) {
        if (!config.is_hidden) {
            const validators: ValidatorFn[] = [];
            let formValue = value ?? config.value;
            const key = `${config.label}_${index}`;
            if (config.type === PolicyFieldType.ReadFile) {
                this.fileValues[key] = null;
                if (config?.fileName) {
                    formValue = config?.fileName;
                }
            }
            if (config.type === PolicyFieldType.Dropdown) {
                this.fetchDropdownData[config.name] = new BehaviorSubject<boolean>(true);
                if (typeof config?.source === 'string') {
                    // this.flowService.getDropdownData(field?.subpart?.source, field.name).subscribe((res) => {
                    //     this.handleDropdownData(res.data, res?.request?.controlName);
                    //     this.cdr.detectChanges();
                    // });
                } else {
                    this.handleDropdownData(config.source, config.name);
                }
            }
            if (config.is_required) {
                validators.push(Validators.required);
            }
            if (config.regex) {
                validators.push(Validators.pattern(config.regex));
            }
            return new FormControl<any>({ value: formValue, disabled: Boolean(config?.is_disable) }, validators);
        } else {
            return null;
        }
    }
    public handleDropdownData(data: any[], controlName: string): void {
        if (data && typeof data[0] === 'string') {
            this.dropdownData[controlName] = data.map((val) => ({
                label: val,
                value: val,
            }));
        } else if (data) {
            this.dropdownData[controlName] = data;
        } else {
            this.dropdownData[controlName] = [];
        }
        this.fetchDropdownData[controlName].next(false);
    }
    public getSingleEndpointData(projectId, endpointId) {
        this.ComponentStore.getSingleEndpointData({ projectId: projectId, endpointId: endpointId });
    }
    private getPolicy() {
        this.ComponentStore.getPolicies();
    }
}
