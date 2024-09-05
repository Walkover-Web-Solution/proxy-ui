import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import { omit } from 'lodash';
import { PAGE_SIZE_OPTIONS } from '@proxy/constant';
import { MatDialog } from '@angular/material/dialog';
import { NewMethodDialogComponent } from '../new-method-dialog/new-method-dialog.component';
import { EnvProjectComponentStore } from './env-project.store';
import { Observable } from 'rxjs';
import { IProjects } from '@proxy/models/logs-models';
import { IPaginatedResponse } from '@proxy/models/root-models';

@Component({
    selector: 'proxy-endpoints',
    templateUrl: './env-project.component.html',
    styleUrls: ['./env-project.component.scss'],
    providers: [EnvProjectComponentStore],
})
export class EndpointsComponent extends BaseComponent implements OnInit {
    public step = 1;
    public projectId: number;
    public projectName: string;
    public pageSizeOptions = PAGE_SIZE_OPTIONS;
    public environmentParams = {
        itemsPerPage: 10,
        pageNo: 1,
    };
    public displayedColumns: string[] = ['endpoint', 'forward_to', 'rate_limit', 'status', 'manage'];
    /** Params for fetching endPoint data */
    public params: any = {};
    public envProject$: Observable<IPaginatedResponse<IProjects[]>> = this.componentStore.envProject$;

    // /** Store current API inprogress state */
    public loading$: Observable<{ [key: string]: boolean }> = this.componentStore.loading$;

    constructor(public dialog: MatDialog, private componentStore: EnvProjectComponentStore) {
        super();
    }

    ngOnInit() {
        this.getEnvProject();
    }
    // public showdialog(value:string): void {
    //     this.dialog.open(NewMethodDialogComponent, {
    //         panelClass: ['mat-dialog', 'mat-right-dialog', 'mat-dialog-xlg'],
    //         height: 'calc(100vh - 20px)',
    //         data: { value }

    //     });
    // }
    // public changeStep(value) {
    //     this.step = value

    // }
    public getEnvProject() {
        this.componentStore.getEnvProject({ ...this.params });
    }
    public showEndpoints(id?: any, projectName?: string, slug?: string) {
        if (id) {
            this.projectId = id;
        }
        if (projectName) {
            this.projectName = projectName;
        }
        if (slug) {
        }
        this.step = 2;
    }
    /**
     *  Search by searchKeyword
     * @param searchKeyword
     */
    public search(searchKeyword: string) {
        if (searchKeyword?.length) {
            this.params = {
                ...this.params,
                search: searchKeyword.trim(),
            };
        } else {
            this.params = { ...omit(this.params, ['search']) };
        }
        this.params.pageNo = 1;
        this.getEnvProject();
    }
}
