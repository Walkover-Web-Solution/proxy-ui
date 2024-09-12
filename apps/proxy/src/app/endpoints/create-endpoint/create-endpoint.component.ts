import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NewMethodDialogComponent } from '../new-method-dialog/new-method-dialog.component';
import { distinctUntilChanged, Observable, takeUntil } from 'rxjs';
import { BaseComponent } from '@proxy/ui/base-component';
import { IFirebaseUserModel, IPaginatedResponse, IPoliciesData } from '@proxy/models/root-models';
import { CreateEndpointComponentStore } from './create-endpoint.store';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { IAppState, selectAllPolicies } from '../../ngrx';
import { IProjects } from '@proxy/models/logs-models';
import { isEqual } from 'lodash';
import { rootActions } from '../../ngrx/actions';
import { ButtonLabels, FormwardToNum, IEndpointsRes } from '@proxy/models/endpoint';

@Component({
    selector: 'proxy-create-endpoint',
    templateUrl: './create-endpoint.component.html',
    styleUrls: ['./create-endpoint.component.scss'],
    providers: [CreateEndpointComponentStore],
})
export class CreateEndpointComponent extends BaseComponent implements OnInit {
    public requestTypes: Array<string> = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    public defineNewMethod: string = 'Define New Method';
    public forwardTo: string[] = ['Same as Endpoint', 'Perform operation', 'Configure Viasocket'];
    // public timeUnit: Array<string> = ['Hour', 'Day'];
    public position: Array<string> = ['exactMatch', 'endsWith', 'startsWith'];
    public isVerfiacationDisable = false;
    public selectedButton: String;
    public forwardToNum: number;
    // public updateForm: boolean = false;
    // public singleEndpointData: any;
    public projectId: number;
    public projectName: string;
    public envProjectId: number;
    public endpointId: number;
    public projectSlug: string;
    // public selectedValue: string;
    public buttonLable: ButtonLabels;
    public forward: FormwardToNum;
    public selectedPolicy: string;
    public getPolicies$: Observable<IPaginatedResponse<IPoliciesData[]>>;
    public updateEndpoint: boolean = false;
    // public getVerficationIntgration$: Observable<IPaginatedResponse<IProjects[]>>;
    public logInData$: Observable<IFirebaseUserModel>;
    public environmentParams = {
        itemsPerPage: 10,
        pageNo: 1,
    };
    public endpointForm = new FormGroup({
        endpoint: new FormControl<string>(null, [Validators.required]),
        methodType: new FormControl<string>(null, [Validators.required]),
        sameAsProject: new FormControl<boolean>(false),
        verificationMethod: new FormControl<string>(null),
        position: new FormControl<string>(null),
        rateLimitHit: new FormControl<number>(null, [Validators.required]),
        rateLimitMinute: new FormControl<number>(null, [Validators.required]),
    });
    constructor(
        public dialog: MatDialog,
        private componentStore: CreateEndpointComponentStore,
        private activatedRoute: ActivatedRoute,
        private store: Store<IAppState>
    ) {
        super();

        this.getPolicies$ = this.store.pipe(
            select(selectAllPolicies),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }
    public singleEndpointData$: Observable<IPaginatedResponse<IEndpointsRes[]>> =
        this.componentStore.singleEndpointData$;

    ngOnInit(): void {
        this.loadPolicyData();
        this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            this.extractParams(params);
        });
        this.singleEndpointData$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            if (data) {
                this.setUpdateFormData(data);
                // this.singleEndpointData = data;
            }
        });
    }
    public loadPolicyData() {
        this.store.dispatch(rootActions.getPolicies());
    }
    private extractParams(params) {
        this.projectId = params?.projectId;
        this.projectSlug = params?.projectSlug;
        this.projectName = params?.projectName;
        this.envProjectId = params?.envProjectId;
        if (params?.endpointId) {
            this.endpointId = params.endpointId;
            this.updateEndpoint = true;
            this.editEndpoint(this.endpointId);
        }
    }
    private setUpdateFormData(data: any): void {
        const [limit, time] = data.rate_limiter.split(':');
        this.endpointForm.patchValue({
            endpoint: data.endpoint,
            methodType: data.request_type,
            sameAsProject: data.use_config_from === 'project',
            position: data.position,
            rateLimitHit: limit,
            rateLimitMinute: time,
        });
    }

    isSelected(value: string): boolean {
        return this.selectedButton === value;
    }

    public showdialog(value): void {
        this.dialog.open(NewMethodDialogComponent, {
            panelClass: ['mat-dialog', 'mat-right-dialog', 'mat-dialog-xlg'],
            height: 'calc(100vh - 20px)',
            data: value,
        });
    }
    onSelectionChange(value: string): void {
        if (value === this.defineNewMethod) {
            this.showdialog({ type: 'newMethod', projectSlug: this.projectSlug });
        } else {
            this.selectedPolicy = value;
        }
    }
    selectButton(value: any): void {
        if (value === ButtonLabels.ConfigureViasocket) {
            this.forwardToNum = FormwardToNum.Viasocket;
            this.showdialog({ type: 'viasocket' });
        }
        if (value === ButtonLabels.PerformOperation) {
            this.forwardToNum = FormwardToNum.Operation;
        }
        if (value === ButtonLabels.SameAsEndpoint) {
            this.forwardToNum = FormwardToNum.Endpoint;
        }
    }
    onChange(value) {
        this.isVerfiacationDisable = value;
    }
    public onSaveUpdate(): void {
        const endpointFromData = this.endpointForm.value;
        const payload = {
            ...endpointFromData,
            use_config_from: endpointFromData.sameAsProject ? 'project' : 'endpoint',
            request_type: endpointFromData.methodType,
            forward_to: this.forwardToNum,
            rate_limiter: `${endpointFromData.rateLimitHit}:${endpointFromData.rateLimitMinute}`,
        };
        if (!this.updateEndpoint) {
            this.componentStore.createEndpoint({ id: this.projectId, body: payload });
        }
        if (this.updateEndpoint) {
            this.componentStore.updateEndpoint({
                envProjectId: this.envProjectId,
                endpointId: this.endpointId,
                body: payload,
            });
        }
    }
    public editEndpoint(endPointId: number): void {
        this.componentStore.getSingleEndpoint({ envProjectId: this.envProjectId, endpointId: endPointId });
    }
}
