import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import {
    DEFAULT_END_DATE,
    DEFAULT_SELECTED_DATE_RANGE,
    DEFAULT_START_DATE,
    SelectDateRange,
    PAGE_SIZE_OPTIONS,
} from '@proxy/constant';
import { Observable } from 'rxjs';
import { IPaginatedResponse } from '@proxy/models/root-models';
import * as dayjs from 'dayjs';
import { omit } from 'lodash';
import { PageEvent } from '@angular/material/paginator';
import { UserComponentStore } from './user.store';
import { IUser } from '@proxy/models/users-model';
@Component({
    selector: 'proxy-users',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    providers: [UserComponentStore],
})
export class UserComponent extends BaseComponent implements OnDestroy, OnInit {
    /** Store current API inprogress state */
    public loading$: Observable<{ [key: string]: boolean }> = this.componentStore.loading$;
    /** Store User data */
    public users$: Observable<IPaginatedResponse<IUser[]>> = this.componentStore.users$;
    /** Store display column */
    public displayedColumns: string[] = ['name', 'email', 'phone_number', 'created_at'];
    /** Store params for fetching feature data */
    public params: any = {};
    /** Store default selected date range */
    public selectedRangeValue = DEFAULT_SELECTED_DATE_RANGE;
    /** Store selected date range */
    public selectedDefaultDateRange = SelectDateRange;
    /** Store page size options */
    public pageSizeOptions = PAGE_SIZE_OPTIONS;
    // public selectedDateRange = {
    //     startDate: DEFAULT_START_DATE,
    //     endDate: DEFAULT_END_DATE,
    // };

    constructor(private componentStore: UserComponentStore) {
        super();
    }
    ngOnInit(): void {
        this.params = {
            ...this.params,
            ...this.formatDateRange(),
        };
        this.getUsers();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    /**
     * Search by searchKeyword
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
        this.getUsers();
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
        this.getUsers();
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
        this.getUsers();
    }

    /**
     * Get Users
     */
    public getUsers(): void {
        this.componentStore.getUsers({ ...this.params });
    }
}
