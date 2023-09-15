import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import { DEFAULT_SELECTED_DATE_RANGE, SelectDateRange, PAGE_SIZE_OPTIONS } from '@proxy/constant';
import * as dayjs from 'dayjs';
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
    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    /** Store display column */
    public displayedColumns: string[] = ['name', 'reference_id', 'method', 'type'];
    /** Params for fetching feature data */
    public params: any = {};
    /** Store default selected date */
    public selectedRangeValue = DEFAULT_SELECTED_DATE_RANGE;
    /** Store date range */
    public selectedDefaultDateRange = SelectDateRange;
    /** Store page size option */
    public pageSizeOptions = PAGE_SIZE_OPTIONS;
    // public selectedDateRange = {
    //     startDate: DEFAULT_START_DATE,
    //     endDate: DEFAULT_END_DATE,
    // };

    constructor(private componentStore: FeatureComponentStore) {
        super();
    }
    ngOnInit(): void {
        this.params = {
            ...this.params,
            ...this.formatDateRange(),
        };
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
     * Formate Date Range and convert into format
     * @returns
     */
    private formatDateRange(): any {
        return {
            startDate: dayjs(this.selectedRangeValue.start).format('DD-MM-YYYY'),
            endDate: dayjs(this.selectedRangeValue.end).format('DD-MM-YYYY'),
        };
    }

    /**
     * Set Selected Date Rage
     * @param event
     */
    public setDateRange(event) {
        this.selectedRangeValue = event;
        this.params = {
            ...this.params,
            ...this.formatDateRange(),
        };
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
