import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureComponentStore } from '../../features/feature/feature.store';
import { IFeature } from '@proxy/models/features-model';
import { takeUntil } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
    selector: 'proxy-users',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    providers: [UserComponentStore, FeatureComponentStore],
})
export class UserComponent extends BaseComponent implements OnDestroy, OnInit {
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

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
    /** User filter form */
    public userFilterForm = new FormGroup({
        company_name: new FormControl<string>(''),
        feature_id: new FormControl<string>(null),
    });
    /** Features observable */
    public features$: Observable<IPaginatedResponse<IFeature[]>> = this.featureComponentStore.feature$;
    /** Features array */
    public features: IFeature[] = [];
    /** Feature params */
    public featureParams: any = {
        itemsPerPage: 1000,
        pageNo: 1,
    };
    // public selectedDateRange = {
    //     startDate: DEFAULT_START_DATE,
    //     endDate: DEFAULT_END_DATE,
    // };

    constructor(private componentStore: UserComponentStore, private featureComponentStore: FeatureComponentStore) {
        super();
    }
    ngOnInit(): void {
        this.params = {
            ...this.params,
            ...this.formatDateRange(),
        };

        // Load features
        this.featureComponentStore.getFeature({ ...this.featureParams });
        this.features$.pipe(takeUntil(this.destroy$)).subscribe((features) => {
            if (features) {
                this.filterFeatures(features.data);
            }
        });

        this.getUsers();
    }

    /**
     * Filter features (same logic as management component)
     */
    private filterFeatures(features: IFeature[]): void {
        this.features = features.filter((feature) => feature.feature_id === 1);
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
     * Apply Filter
     */
    public applyFilter() {
        const formValue = this.userFilterForm.getRawValue();
        if (formValue) {
            // Build params object
            const filterParams: any = {};

            if (formValue.company_name?.trim()) {
                filterParams.company_name = formValue.company_name.trim();
            }

            if (formValue.feature_id) {
                filterParams.feature_id = formValue.feature_id;
            }

            // Remove old filter params and add new ones (excluding search which is handled separately)
            this.params = {
                ...omit(this.params, ['company_name', 'feature_id']),
                ...filterParams,
            };
        }
        this.params.pageNo = 1;
        this.getUsers();
        this.closeMyMenu();
    }

    /**
     * Reset Filter Form
     */
    public resetParam(): void {
        this.userFilterForm.reset({
            company_name: '',
            feature_id: null,
        });
        this.closeMyMenu();
        this.applyFilter();
    }

    /**
     * Close the menu
     */
    public closeMyMenu(): void {
        this.trigger?.closeMenu();
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
