import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import {
    DEFAULT_END_DATE,
    DEFAULT_SELECTED_DATE_RANGE,
    DEFAULT_START_DATE,
    SelectDateRange,
    PAGE_SIZE_OPTIONS,
} from '@proxy/constant';
import { MatSort } from '@angular/material/sort';
import * as dayjs from 'dayjs';
import { omit } from 'lodash';
import { MatMenuTrigger } from '@angular/material/menu';
import { PageEvent } from '@angular/material/paginator';
@Component({
    selector: 'proxy-features',
    templateUrl: './feature.component.html',
    styleUrls: ['./feature.component.scss'],
    // providers: [UserComponentStore],
})
export class FeatureComponent extends BaseComponent implements OnDestroy, OnInit {
    @ViewChild(MatSort) matSort: MatSort;
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    public displayedColumns: string[] = ['name', 'reference_id', 'method', 'type'];
    public params: any = {};
    public selectedRangeValue = DEFAULT_SELECTED_DATE_RANGE;
    public selectedDefaultDateRange = SelectDateRange;
    public selectedDateRange = {
        startDate: DEFAULT_START_DATE,
        endDate: DEFAULT_END_DATE,
    };
    public pageSizeOptions = PAGE_SIZE_OPTIONS;

    constructor() {
        super();
    }
    ngOnInit(): void {
        this.params = {
            ...this.params,
            ...this.formatDateRange(),
        };
        this.getLogs();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public onEnter(searchKeyword: string) {
        if (searchKeyword?.length) {
            this.params = {
                ...this.params,
                endpoint: searchKeyword.trim(),
            };
        } else {
            this.params = { ...omit(this.params, ['endpoint']) };
        }
        this.params.pageNo = 1;
        this.getLogs();
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
        this.getLogs();
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
        this.getLogs();
    }

    /**
     * Get Logs
     */
    public getLogs(): void {}
}
