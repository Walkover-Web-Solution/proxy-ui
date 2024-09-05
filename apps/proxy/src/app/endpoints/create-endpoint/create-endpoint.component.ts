import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NewMethodDialogComponent } from '../new-method-dialog/new-method-dialog.component';
import { distinctUntilChanged, Observable, takeUntil } from 'rxjs';
import { BaseComponent } from '@proxy/ui/base-component';
import { IFirebaseUserModel, IPaginatedResponse } from '@proxy/models/root-models';
import { CreateEndpointComponentStore } from './create-endpoint.store';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { IAppState, selectAllVerificationIntegration } from '../../ngrx';
import { IProjects } from '@proxy/models/logs-models';
import { isEqual } from 'lodash';
import { rootActions } from '../../ngrx/actions';
import { ONLY_INTEGER_REGEX } from '@proxy/regex';

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
    public timeUnit: Array<string> = ['Hour', 'Day'];
    public position: Array<string> = ['exactMatch', 'endsWith', 'startsWith'];
    public isVerfiacationDisable = false;
    public selectedButton: String;
    public forwardToNum: number;
    public updateForm: boolean = false;
    public singleEndpointData: any;
    public projectId: number;
    public projectName: string;
    public endpointId: number;
    public projectSlug: string;
    public selectedValue: string;
    public updateEndpoint: boolean = false;
    public getVerficationIntgration$: Observable<IPaginatedResponse<IProjects[]>>;
    public logInData$: Observable<IFirebaseUserModel>;
    public endpointForm = new FormGroup({
        endpoint: new FormControl<string>(null, [Validators.required]),
        methodType: new FormControl<string>(null, [Validators.required]),
        sameAsProject: new FormControl<boolean>(false),
        verificationMethod: new FormControl<string>(null),
        position: new FormControl<string>(null),
        rateLimitHit: new FormControl<number>(null, [Validators.required]),
        rateLimitMinute: new FormControl<number>(null, [Validators.required]),

        sessionTime: new FormControl<string>(null, [Validators.required, Validators.pattern(ONLY_INTEGER_REGEX)]),
        timeUnit: new FormControl<string>(null, Validators.required),
    });
    constructor(
        public dialog: MatDialog,
        private componentStore: CreateEndpointComponentStore,
        private activatedRoute: ActivatedRoute,
        private store: Store<IAppState>
    ) {
        super();

        this.getVerficationIntgration$ = this.store.pipe(
            select(selectAllVerificationIntegration),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }
    public singleEndpointData$: Observable<any> = this.componentStore.singleEndpointData$;

    ngOnInit(): void {
        this.loadPolicyData();
        this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            this.extractParams(params);
        });
        this.singleEndpointData$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            if (data) {
                this.setUpdateFormData(data);
                this.singleEndpointData = data;
            }
        });
    }
    public loadPolicyData() {
        this.store.dispatch(rootActions.getVerificationIntegration());
    }
    private extractParams(params) {
        this.projectId = params?.projectId;
        this.projectSlug = params?.projectSlug;
        this.projectName = params?.projectName;

        if (params?.endpointId) {
            this.endpointId = params.endpointId;
            this.updateEndpoint = true;
            this.editEndpoint(this.endpointId);
        }
    }
    private setUpdateFormData(data: any): void {
        this.endpointForm.patchValue({
            endpoint: data.endpoint,
            methodType: data.request_type,
            sameAsProject: data.use_config_from === 'project',
            position: data.position,
        });
    }

    isSelected(value: string): boolean {
        console.log(value);
        const test = this.selectedButton === value;
        console.log(test);
        return test;
    }

    public showdialog(value): void {
        this.dialog.open(NewMethodDialogComponent, {
            panelClass: ['mat-dialog', 'mat-right-dialog', 'mat-dialog-xlg'],
            height: 'calc(100vh - 20px)',
            data: { value },
        });
    }
    onSelectionChange(event: any): void {
        this.selectedValue = event.value;
        if (this.selectedValue === this.defineNewMethod) {
            this.showdialog({ type: 'newMethod', projectSlug: this.projectSlug });
        }
    }
    selectButton(value: any): void {
        this.selectedButton = value;
        console.log(this.selectedButton);
        if (this.selectedButton === 'Configure Viasocket') {
            this.forwardToNum = 2;
            this.showdialog({ type: 'viasocket' });
        }
        if ((this.selectedButton = 'Perform operation')) {
            this.forwardToNum = 3;
        }
        if ((this.selectedButton = 'Same as Endpoint')) {
            this.forwardToNum = 1;
        }
    }
    onChange(event: any) {
        if (event.checked) {
            this.isVerfiacationDisable = true;
        } else {
            this.isVerfiacationDisable = false;
        }
    }
    public onSaveUpdate() {
        console.log(this.endpointForm.value.endpoint);
        const endpointFromData = this.endpointForm.value;
        const payload = {
            ...endpointFromData,
            use_config_from: endpointFromData.sameAsProject ? 'project' : this.selectedValue,
            request_type: endpointFromData.methodType,
            forward_to: this.forwardToNum,
            session_time: endpointFromData.sessionTime,
            rate_limiter: `${endpointFromData.rateLimitHit}:${endpointFromData.rateLimitMinute}`,
        };
        if (!this.updateEndpoint) {
            this.componentStore.createEndpoint({ id: this.projectId, body: payload });
        }
        if (this.updateEndpoint) {
            this.componentStore.updateEndpoint({
                projectId: this.projectId,
                endpointId: this.endpointId,
                body: payload,
            });
        }
    }
    public editEndpoint(endPointId: number) {
        this.componentStore.getSingleEndpoint({ projectId: this.projectId, endpointId: endPointId });
    }
}
