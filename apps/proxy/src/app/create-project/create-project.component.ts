import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { CAMPAIGN_NAME_REGEX, ONLY_INTEGER_REGEX, URL_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { environment } from '../../environments/environment';
import { CreateProjectComponentStore } from './create-project.store';
import { filter, Observable, takeUntil } from 'rxjs';
import { IPaginatedResponse } from '@proxy/models/root-models';
import { IEnvironments, IProjects } from '@proxy/models/logs-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { select, Store } from '@ngrx/store';
import { IAppState, selectAllProjectList } from '../ngrx';
import { rootActions } from '../ngrx/actions';
import {
    IDestinationUrlForm,
    IFormArray,
    IGatewayUrlDetailsForm,
    IPrimaryDetailsForm,
} from '@proxy/models/project-model';
import { IClientData } from '@proxy/models/users-model';

@Component({
    selector: 'proxy-create-project',
    templateUrl: './create-project.component.html',
    styleUrls: ['./create-project.component.scss'],
    providers: [CreateProjectComponentStore],
})
export class CreateProjectComponent extends BaseComponent implements OnInit {
    public primaryDetailsForm: FormGroup<IPrimaryDetailsForm>;
    public gatewayUrlDetailsForm: FormGroup<IGatewayUrlDetailsForm>;
    public destinationUrlForm: FormGroup<IDestinationUrlForm>;
    public currentstep: number = 1;
    public checked: Boolean = false;
    public showEndpoint: Boolean = false;
    public environments_with_slug;
    public environmentParams = {
        itemsPerPage: 10,
        pageNo: 1,
    };
    public projects$: Observable<IPaginatedResponse<IProjects[]>>;
    public environments$: Observable<IPaginatedResponse<IEnvironments[]>> = this.componentStore.environments$;
    public sourceDomain$: Observable<any> = this.componentStore.sourceDomain$;
    public createProjectSuccess$: Observable<IProjects> = this.componentStore.createProjectSuccess$;
    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public clientData$: Observable<IPaginatedResponse<IClientData[]>> = this.componentStore.clientData$;
    public projectId: number;
    public urlUniqId: string;

    constructor(
        private componentStore: CreateProjectComponentStore,
        private fb: FormBuilder,
        private store: Store<IAppState>
    ) {
        super();
        this.projects$ = this.store.pipe(select(selectAllProjectList));

        this.primaryDetailsForm = this.fb.group<IPrimaryDetailsForm>({
            name: this.fb.control('', [
                Validators.required,
                Validators.pattern(CAMPAIGN_NAME_REGEX),
                CustomValidators.minLengthFourWithoutSpace,
                CustomValidators.noStartEndSpaces,
                Validators.maxLength(50),
            ]),
            rateLimitHit: this.fb.control(null, [Validators.required, Validators.pattern(ONLY_INTEGER_REGEX)]),
            rateLimitMinite: this.fb.control(null, [Validators.required, Validators.pattern(ONLY_INTEGER_REGEX)]),
            selectedEnvironments: this.fb.control([], Validators.required),
        });
        this.gatewayUrlDetailsForm = this.fb.group<IGatewayUrlDetailsForm>({
            useSameUrlForAll: this.fb.control(false),
            gatewayUrls: this.fb.array<FormControl<string>>([]),
            singleUrl: this.fb.control(''),
        });
        this.destinationUrlForm = this.fb.group<IDestinationUrlForm>({
            endpoint: this.fb.control(''),
            ForwardUrl: this.fb.array<FormControl<string>>([]),
        });
    }

    ngOnInit(): void {
        this.getEnvironment();
        this.clientData$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((res) => {
            this.urlUniqId = res.data[0].url_unique_id;
            this.projects$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
                if (res) {
                    const latestProject = [];
                    for (let i = res.data.length - 1; i >= 0; i--) {
                        latestProject.push(res.data[i]);
                    }

                    latestProject.forEach((project) => {
                        const baseUrl = `${environment.baseUrl}/proxy`;
                        this.projectId = project.id;
                        this.environments_with_slug = project.environments_with_slug.map((res) => ({
                            name: res.name,
                            url: `${baseUrl}/${this.urlUniqId}/${res.project_slug}`,
                        }));
                    });
                    this.populateGatewayUrls();
                    this.populateForwardUrls();
                }
            });
        });
        this.projects$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                const latestProject = [];
                for (let i = res.data.length - 1; i >= 0; i--) {
                    latestProject.push(res.data[i]);
                }

                latestProject.forEach((project) => {
                    const baseUrl = `${environment.baseUrl}/proxy`;
                    this.projectId = project.id;
                    this.environments_with_slug = project.environments_with_slug.map((res) => ({
                        name: res.name,
                        url: `${baseUrl}/${this.urlUniqId}/${res.project_slug}`,
                    }));
                });
                this.populateGatewayUrls();
                this.populateForwardUrls();
            }
        });
        this.createProjectSuccess$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.changeStep(2);
                this.store.dispatch(rootActions.getAllProject());
                this.getClientData(res.client_id);
            }
        });
    }

    get gatewayUrls(): IFormArray<string> {
        return this.gatewayUrlDetailsForm.get('gatewayUrls') as IFormArray<string>;
    }
    get forwardUrls(): IFormArray<string> {
        return this.destinationUrlForm.get('ForwardUrl') as IFormArray<string>;
    }
    populateGatewayUrls(): void {
        this.gatewayUrls.clear();
        this.environments_with_slug.forEach((env) => {
            this.gatewayUrls.push(this.fb.control('', Validators.pattern(URL_REGEX)));
        });
    }
    populateForwardUrls(): void {
        this.forwardUrls.clear();
        this.environments_with_slug.forEach((env) => {
            this.forwardUrls.push(this.fb.control('', [Validators.required, Validators.pattern(URL_REGEX)]));
        });
    }
    public changeStep(stepChange: number) {
        this.currentstep = stepChange;
        if (stepChange === 3) {
            this.showEndpoint = this.isAnyUrlInputProvided();
        }
    }
    onChange(event: any): void {
        if (event.checked) {
            this.gatewayUrls.clear();
            this.gatewayUrlDetailsForm.get('useSameUrlForAll').setValue(true);
            this.gatewayUrlDetailsForm.addControl('singleUrl', this.fb.control(''));
        } else {
            this.gatewayUrlDetailsForm.removeControl('singleUrl');
            this.gatewayUrlDetailsForm.get('useSameUrlForAll').setValue(false);
            this.populateGatewayUrls();
        }
    }

    isAnyUrlInputProvided(): boolean {
        const gatewayUrlDetails = this.gatewayUrlDetailsForm.value;

        if (gatewayUrlDetails.useSameUrlForAll) {
            return gatewayUrlDetails.singleUrl && gatewayUrlDetails.singleUrl.trim() !== '';
        } else {
            return gatewayUrlDetails.gatewayUrls.some((url) => url && url.trim() !== '');
        }
    }

    public submit() {
        if (this.showEndpoint) {
            const formData = this.gatewayUrlDetailsForm.value.useSameUrlForAll
                ? { data: [{ source: this.gatewayUrlDetailsForm.value.singleUrl }] }
                : { data: this.gatewayUrls.value.map((url) => ({ source: url })) };
            this.componentStore.createSource(formData);
            this.sourceDomain$.subscribe((res) => {
                if (res) {
                    const data = this.forwardUrlData(res[0].client_id);

                    this.updateproject(data);
                }
            });
        } else {
            this.updateproject(this.forwardUrlData());
        }
    }

    updateproject(data) {
        this.componentStore.updateProject({ id: this.projectId, body: data });
    }

    private forwardUrlData(sourceDomainId?: string): any {
        const putData = {
            environments: {},
        };

        this.environments_with_slug.forEach((env) => {
            const hostUrl =
                this.forwardUrls.controls[this.environments_with_slug.findIndex((e) => e.name === env.name)].value;
            putData.environments[env.name] = {
                host_url: hostUrl,
            };
            if (sourceDomainId) {
                putData.environments[env.name].source_domain = {
                    source_domain_id: sourceDomainId,
                    sd_slug: this.destinationUrlForm.get('endpoint').value,
                };
            }
        });

        return putData;
    }

    public getEnvironment() {
        this.componentStore.getEnvironment(this.environmentParams);
    }
    onNextClick() {
        const { name, selectedEnvironments, rateLimitHit, rateLimitMinite } = this.primaryDetailsForm.value;

        const environmentsConfig = selectedEnvironments.reduce(
            (acc, env) => ({
                ...acc,
                [env]: { rate_limiter: `${rateLimitMinite}:${rateLimitHit}` },
            }),
            {}
        );

        const projectDetails = { name, environments: environmentsConfig };
        this.componentStore.createProject(projectDetails);
    }
    public getClientData(clientId) {
        this.componentStore.getClientData(clientId);
    }
}
