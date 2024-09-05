import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PAGE_SIZE_OPTIONS } from '@proxy/constant';
import { BaseComponent } from '@proxy/ui/base-component';
import { filter, Observable, takeUntil } from 'rxjs';
import { EndPointListComponentStore } from './endpoint-list.store';
import { IPaginatedResponse } from '@proxy/models/root-models';
import { IProjects } from '@proxy/models/logs-models';

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
    public pageSizeOptions = PAGE_SIZE_OPTIONS;
    public environmentParams = {
        itemsPerPage: 10,
        pageNo: 1,
    };
    public params: any = {};
    public loading$: Observable<{ [key: string]: boolean }> = this.componentStore.loading$;

    constructor(private activatedRoute: ActivatedRoute, private componentStore: EndPointListComponentStore) {
        super();
    }
    public endPointData$: Observable<IPaginatedResponse<IProjects[]>> = this.componentStore.endPointData$;
    public deleteEndpoint$: Observable<any> = this.componentStore.deleteEndpoint$;

    ngOnInit(): void {
        this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            if (params?.projectId) {
                this.projectId = params.projectId;
                this.showEndpoint();
            }
            if (params?.projectName) {
                this.projectName = params.projectName;
            }
        });
        this.deleteEndpoint$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((value) => {
            if (value) {
                this.showEndpoint();
            }
        });
    }

    public showEndpoint() {
        this.componentStore.getEndpointData({ id: this.projectId });
    }
    public deleteSingleEndpoint(id: number) {
        this.componentStore.deleteEndpoint({ projectId: this.projectId, endpointId: id });
    }
}
