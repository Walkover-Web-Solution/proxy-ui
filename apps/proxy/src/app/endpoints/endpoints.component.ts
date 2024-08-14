import { Component, OnInit } from '@angular/core';
import { IProjects } from '@proxy/models/logs-models';
import { IPaginatedResponse } from '@proxy/models/root-models';
import { Observable } from 'rxjs';
import { IAppState, selectAllProjectList } from '../ngrx';
import { select, Store } from '@ngrx/store';

@Component({
    selector: 'proxy-endpoints',
    templateUrl: './endpoints.component.html',
    styleUrls: ['./endpoints.component.scss'],
})
export class EndpointsComponent implements OnInit {
    public step = 1;
    public displayedColumns: string[] = [
        'endpoint',
        'verification',
        'forward_to',
        'environment',
        'rate_limit',
        'status',
    ];
    public getProject$: Observable<IPaginatedResponse<IProjects[]>>;

    constructor(private store: Store<IAppState>) {
        this.getProject$ = this.store.pipe(select(selectAllProjectList));
    }

    ngOnInit() {
        this.getProject$.subscribe((res) => {
            console.log(res);
        });
    }
}
