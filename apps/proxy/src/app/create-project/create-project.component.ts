import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { CAMPAIGN_NAME_REGEX, ONLY_INTEGER_REGEX, URL_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { environment } from '../../environments/environment';
import { CreateProjectComponentStore } from './create-project.store';
import { Observable, takeUntil } from 'rxjs';
import { IPaginatedResponse } from '@proxy/models/root-models';
import { IEnvironments, IProjects } from '@proxy/models/logs-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { select, Store } from '@ngrx/store';
import { IAppState, selectAllProjectList } from '../ngrx';
import { rootActions } from '../ngrx/actions';

@Component({
    selector: 'proxy-create-project',
    templateUrl: './create-project.component.html',
    styleUrls: ['./create-project.component.scss'],
    providers: [CreateProjectComponentStore],
})
export class CreateProjectComponent extends BaseComponent implements OnInit {
    public primaryDetailsForm: FormGroup;
    public gatewayUrlDetailsForm: FormGroup;
    public destinationUrlForm: FormGroup;
    public currentstep: number = 1;
    public checked: Boolean = false;
    public showEndpoint: Boolean = false;
    public environments_with_slug;
    public environmentParams = {
        itemsPerPage: 5,
        pageNo: 1,
    };
    public projects$: Observable<IPaginatedResponse<IProjects[]>>;
    public environments$: Observable<IPaginatedResponse<IEnvironments[]>> = this.componentStore.environments$;
    public sourceDomain$: Observable<any> = this.componentStore.sourceDomain$;
    public getProject$: Observable<boolean> = this.componentStore.getProject$;
    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public projectId: number;

    constructor(
        private componentStore: CreateProjectComponentStore,
        private fb: FormBuilder,
        private store: Store<IAppState>
    ) {
        super();
        this.projects$ = this.store.pipe(select(selectAllProjectList));
        this.primaryDetailsForm = this.fb.group({
            name: [
                '',
                [
                    Validators.required,
                    Validators.pattern(CAMPAIGN_NAME_REGEX),
                    CustomValidators.minLengthThreeWithoutSpace,
                    CustomValidators.noStartEndSpaces,
                    Validators.maxLength(20),
                ],
            ],
            rateLimitHit: [null, [Validators.required, Validators.pattern(ONLY_INTEGER_REGEX)]],
            rateLimitMinute: [null, [Validators.required, Validators.pattern(ONLY_INTEGER_REGEX)]],
            selectedEnvironments: [''],
        });

        (this.destinationUrlForm = this.fb.group({
            endpoint: ['', Validators.required],
            ForwardUrl: this.fb.array([]),
        })),
            (this.gatewayUrlDetailsForm = this.fb.group({
                useSameUrlForAll: [false],
                gatewayUrls: this.fb.array([]),
            }));
    }

    ngOnInit(): void {
        this.getEnvironment();
        this.projects$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                const latestProject = res.data.slice().reverse();

                latestProject.forEach((project) => {
                    const baseUrl = `${environment.baseUrl}/proxy`;
                    this.projectId = project.id;
                    this.environments_with_slug = project.environments_with_slug.map((res) => ({
                        name: res.name,
                        url: `${baseUrl}/${this.projectId}/${res.project_slug}`,
                    }));
                });
                this.populateGatewayUrls();
                this.populateForwardUrls();
            }
        });
        this.getProject$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.currentstep = 2;
                this.store.dispatch(rootActions.getAllProject());
            }
        });
    }

    get gatewayUrls(): FormArray {
        return this.gatewayUrlDetailsForm.get('gatewayUrls') as FormArray;
    }
    get forwardUrls(): FormArray {
        return this.destinationUrlForm.get('ForwardUrl') as FormArray;
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

    checkInputfeild() {
        this.showEndpoint = this.isAnyUrlInputProvided();
        this.currentstep = 3;
    }
    backStep() {
        this.currentstep = 2;
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
        const { name, selectedEnvironments, rateLimitHit, rateLimitMinute } = this.primaryDetailsForm.value;

        const environmentsConfig = selectedEnvironments.reduce(
            (acc, env) => ({
                ...acc,
                [env]: { rate_limiter: `${rateLimitHit}:${rateLimitMinute}` },
            }),
            {}
        );

        const projectDetails = { name, environments: environmentsConfig };
        this.componentStore.createProject(projectDetails);
    }
}
