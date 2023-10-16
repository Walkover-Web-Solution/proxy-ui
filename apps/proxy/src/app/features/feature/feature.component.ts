import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import { PAGE_SIZE_OPTIONS } from '@proxy/constant';
import { omit } from 'lodash';
import { PageEvent } from '@angular/material/paginator';
import { FeatureComponentStore } from './feature.store';
import { Observable } from 'rxjs';
import { IFeature } from '@proxy/models/features-model';
import { IPaginatedResponse } from '@proxy/models/root-models';
@Component({
    selector: 'proxy-features',
    templateUrl: './feature.component.html',
    styleUrls: ['./feature.component.scss'],
    providers: [FeatureComponentStore],
})
export class FeatureComponent extends BaseComponent implements OnDestroy, OnInit {
    /** Store Feature Data */
    public feature$: Observable<IPaginatedResponse<IFeature[]>> = this.componentStore.feature$;
    /** Store current API Inprogress State */
    public loading$: Observable<{ [key: string]: boolean }> = this.componentStore.loading$;
    /** User has created any feature or not */
    public hasSomeFeatures$: Observable<boolean> = this.componentStore.hasSomeFeatures$;
    /** Store display column */
    public displayedColumns: string[] = ['name', 'reference_id', 'method', 'type', 'manage'];
    /** Params for fetching feature data */
    public params: any = {};
    /** Store page size option */
    public pageSizeOptions = PAGE_SIZE_OPTIONS;

    constructor(private componentStore: FeatureComponentStore) {
        super();
    }
    ngOnInit(): void {
        this.getFeatures();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
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
        this.getFeatures();
    }

    /**
     * Handle Page Changes
     * @param event
     */
    public pageChange(event: PageEvent): void {
        this.params = {
            ...this.params,
            pageNo: event.pageIndex + 1,
            itemsPerPage: event.pageSize,
        };
        this.getFeatures();
    }

    /**
     * Get Feature
     */
    public getFeatures(): void {
        this.componentStore.getFeature({ ...this.params });
    }
}
