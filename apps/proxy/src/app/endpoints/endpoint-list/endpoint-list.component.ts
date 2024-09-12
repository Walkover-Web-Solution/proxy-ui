import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PAGE_SIZE_OPTIONS } from '@proxy/constant';
import { BaseComponent } from '@proxy/ui/base-component';
import { filter, Observable, takeUntil } from 'rxjs';
import { EndPointListComponentStore } from './endpoint-list.store';
import { IPaginatedResponse } from '@proxy/models/root-models';
import { FormwardToNum, IEndpointsRes } from '@proxy/models/endpoint';
import { NewMethodDialogComponent } from '../new-method-dialog/new-method-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'proxy-endpoint-list',
    templateUrl: './endpoint-list.component.html',
    styleUrls: ['./endpoint-list.component.scss'],
    providers: [EndPointListComponentStore],
})
export class EndpointListComponent extends BaseComponent implements OnInit {
    public displayedColumns: string[] = ['endpoint', 'forward_to', 'rate_limit', 'status', 'manage'];
    public projectId: number;
    public projectName: string;
    public envProjectId: number;
    public pageSizeOptions = PAGE_SIZE_OPTIONS;
    public forwardTo: FormwardToNum;
    public environmentParams = {
        itemsPerPage: 10,
        pageNo: 1,
    };
    public params: any = {};
    public loading$: Observable<{ [key: string]: boolean }> = this.componentStore.loading$;
    public statusUpdat$: Observable<boolean> = this.componentStore.statusupdate$;

    constructor(
        private activatedRoute: ActivatedRoute,
        private componentStore: EndPointListComponentStore,
        public dialog: MatDialog
    ) {
        super();
    }
    public endPointData$: Observable<IPaginatedResponse<IEndpointsRes[]>> = this.componentStore.endPointData$;
    public deleteEndpoint$: Observable<boolean> = this.componentStore.deleteEndpoint$;

    ngOnInit(): void {
        this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            this.projectName = params?.projectName;
            this.envProjectId = params?.envProjectId;

            if (params?.projectId) {
                this.projectId = params.projectId;
                this.showEndpoint();
            }
        });
        this.deleteEndpoint$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((value) => {
            this.showEndpoint();
        });
        this.statusUpdat$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
            this.showEndpoint();
        });
    }
    endpointToggle(value, projectId: number, id: number) {
        event.stopPropagation();

        const payload = {
            is_active: value,
        };
        this.componentStore.updateEndpoint({
            envProjectId: projectId,
            endpointId: id,
            body: payload,
        });
    }
    public getSingleEndpointData(value: string, projectId: number, endPointId: number) {
        this.showdialog({ type: value, projectId: projectId, endpointId: endPointId });
    }
    public showdialog(value): void {
        this.dialog.open(NewMethodDialogComponent, {
            panelClass: ['mat-dialog', 'mat-right-dialog', 'mat-dialog-xlg'],
            height: 'calc(100vh - 20px)',
            data: value,
        });
    }

    public showEndpoint() {
        this.componentStore.getEndpointData({ id: this.projectId });
    }
    public stopPropagation(event) {
        event.stopPropagation();
    }
    public deleteSingleEndpoint(id: number) {
        event.stopPropagation();
        this.componentStore.deleteEndpoint({ projectId: this.envProjectId, endpointId: id });
    }
}
