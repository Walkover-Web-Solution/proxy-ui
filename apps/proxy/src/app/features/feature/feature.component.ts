import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import {
    DEFAULT_END_DATE,
    DEFAULT_SELECTED_DATE_RANGE,
    DEFAULT_START_DATE,
    SelectDateRange,
    PAGE_SIZE_OPTIONS,
} from '@proxy/constant';
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
    public feature$: Observable<IPaginatedResponse<IFeature[]>> = this.componentStore.feature$;
    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public displayedColumns: string[] = ['name', 'reference_id', 'method', 'type'];
    public params: any = {};
    public selectedRangeValue = DEFAULT_SELECTED_DATE_RANGE;
    public selectedDefaultDateRange = SelectDateRange;
    public selectedDateRange = {
        startDate: DEFAULT_START_DATE,
        endDate: DEFAULT_END_DATE,
    };
    public pageSizeOptions = PAGE_SIZE_OPTIONS;

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

    public onEnter(searchKeyword: string) {
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
