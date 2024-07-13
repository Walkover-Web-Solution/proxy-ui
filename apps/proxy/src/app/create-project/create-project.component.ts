import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { CAMPAIGN_NAME_REGEX, ONLY_INTEGER_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { environment } from '../../environments/environment';
import { CreateProjectComponentStore } from './create-project.store';
import { BehaviorSubject, Observable, filter, map, takeUntil } from 'rxjs';
import { IPaginatedResponse } from '@proxy/models/root-models';
import { IEnvironments, IProjects } from '@proxy/models/logs-models';

@Component({
    selector: 'proxy-create-project',
    templateUrl: './create-project.component.html',
    styleUrls: ['./create-project.component.scss'],
    providers: [CreateProjectComponentStore],
})
export class CreateProjectComponent implements OnInit {
    public projectForm: FormGroup;
    public gatewayUrlDetails: FormGroup;
    public destinationUrl: FormGroup;
    public primaryDetails;
    public checked: false;
    public showEndpoint: boolean = false;
    public environments_with_slug;
    public projectDetails;
    public selectedEnv;
    public environmentParams = {
        itemsPerPage: 25,
        pageNo: 1,
    };

    public selectedMethod = new BehaviorSubject<any>(null);
    // public projectDetails$: Observable<any> = this.componentStore.getProjects;
    public projects$: Observable<IPaginatedResponse<IProjects[]>> = this.componentStore.projects$;
    public environments$: Observable<IPaginatedResponse<IEnvironments[]>> = this.componentStore.environments$;
    public sourceDomain$: Observable<any> = this.componentStore.sourceDomain$;
    public projectId;
    public devProjectSlug;
    public prodProjectSlug;

    public baseurl;

    environment$: Observable<any>;

    constructor(private componentStore: CreateProjectComponentStore, private fb: FormBuilder) {
        this.projectForm = new FormGroup({
            primaryDetails: new FormGroup({
                name: new FormControl<string>('', [
                    Validators.required,
                    Validators.pattern(CAMPAIGN_NAME_REGEX),
                    CustomValidators.minLengthThreeWithoutSpace,
                    CustomValidators.noStartEndSpaces,
                    Validators.maxLength(60),
                ]),

                rateLimit_hit: new FormControl<number>(null, [
                    Validators.required,
                    Validators.pattern(ONLY_INTEGER_REGEX),
                ]),
                rateLimit_minute: new FormControl<number>(null, [Validators.required]),
                selectedEnvironmentsControl: new FormControl(),
            }),
        });
        (this.destinationUrl = this.fb.group({
            endpoint: [],
            ForwardUrl: this.fb.array([]),
        })),
            (this.gatewayUrlDetails = this.fb.group({
                useSameUrlForAll: [false],
                gatewayUrls: this.fb.array([]),
            }));
    }

    ngOnInit(): void {
        // this.loadEnvironmentData();
        this.getEnvironment();
        this.projects$.subscribe((res) => {
            res.data.forEach((project) => {
                const baseUrl = `${environment.baseUrl}/proxy`;
                this.projectId = project.id;
                this.environments_with_slug = project.environments_with_slug.map((res) => ({
                    name: res.name,
                    url: `${baseUrl}/${this.projectId}/${res.project_slug}`,
                }));
                this.populateGatewayUrls();
                this.populateForwardUrls();
            });
        });
    }

    get gatewayUrls(): FormArray {
        return this.gatewayUrlDetails.get('gatewayUrls') as FormArray;
    }
    get forwardUrls(): FormArray {
        return this.destinationUrl.get('ForwardUrl') as FormArray;
    }
    populateGatewayUrls(): void {
        this.gatewayUrls.clear();
        this.environments_with_slug.forEach((env) => {
            this.gatewayUrls.push(this.fb.control(''));
        });
    }
    populateForwardUrls(): void {
        this.forwardUrls.clear();
        this.environments_with_slug.forEach((env) => {
            this.forwardUrls.push(this.fb.control(''));
        });
    }
    onChange(event: any): void {
        if (event.checked) {
            this.gatewayUrls.clear();
            this.gatewayUrlDetails.get('useSameUrlForAll').setValue(true);
            this.gatewayUrlDetails.addControl('singleUrl', this.fb.control(''));
            // this.gatewayUrls.push(this.fb.control(''))
        } else {
            this.gatewayUrlDetails.removeControl('singleUrl');
            this.gatewayUrlDetails.get('useSameUrlForAll').setValue(false);
            this.populateGatewayUrls();
        }
    }

    checkInputfeild() {
        this.showEndpoint = this.isAnyUrlInputProvided();
    }
    isAnyUrlInputProvided(): boolean {
        const gatewayUrlDetails = this.gatewayUrlDetails.value;

        if (gatewayUrlDetails.useSameUrlForAll) {
            return gatewayUrlDetails.singleUrl && gatewayUrlDetails.singleUrl.trim() !== '';
        } else {
            return gatewayUrlDetails.gatewayUrls.some((url) => url && url.trim() !== '');
        }
    }

    public submit() {
        if (this.showEndpoint) {
            const formData = this.gatewayUrlDetails.value.useSameUrlForAll
                ? { data: [{ source: this.gatewayUrlDetails.value.singleUrl }] }
                : { data: this.gatewayUrls.value.map((url) => ({ source: url })) };

            this.componentStore.createSource$(formData);
            this.sourceDomain$.pipe(filter(Boolean)).subscribe((res) => {
                if (res) {
                    const putData = this.constructPutData(res.data.id);
                    this.componentStore.updateProject({ id: this.projectId, body: putData });
                }
            });
        } else {
            const putData = this.constructPutData();
            this.componentStore.updateProject({ id: this.projectId, body: putData });
        }
    }
    destroy$(destroy$: any) {
        throw new Error('Method not implemented.');
    }

    private constructPutData(sourceDomainId?: string): any {
        const putData = {
            environments: {},
        };

        this.environments_with_slug.forEach((env) => {
            const hostUrl =
                this.forwardUrls.controls[this.environments_with_slug.findIndex((e) => e.name === env.name)].value;
            putData.environments[env.name] = {
                host_url: hostUrl,
                source_domain: {
                    source_domain_id: sourceDomainId,
                    sd_slug: this.destinationUrl.get('endpoint').value,
                },
            };
        });

        return putData;
    }

    public getEnvironment() {
        this.componentStore.getEnvironment(this.environmentParams);
    }
    onNextClick() {
        if (this.projectForm.get('primaryDetails').valid) {
            const { name, selectedEnvironmentsControl, rateLimit_hit, rateLimit_minute } =
                this.projectForm.get('primaryDetails').value;
            this.selectedEnv = selectedEnvironmentsControl;

            const environmentsConfig = selectedEnvironmentsControl.reduce(
                (acc, env) => ({
                    ...acc,
                    [env]: { rate_limiter: `${rateLimit_hit}:${rateLimit_minute}` },
                }),
                {}
            );

            this.projectDetails = { name, environments: environmentsConfig };

            setTimeout(() => {
                this.componentStore.createProject(this.projectDetails);
            }, 100);
        }
    }
}
