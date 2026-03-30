import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DateRangePickerComponent } from '@proxy/date-range-picker';
import { NoRecordFoundComponent } from '@proxy/ui/no-record-found';
import { MatPaginatorGotoComponent } from '@proxy/ui/mat-paginator-goto';
import { SearchComponent } from '@proxy/ui/search';
import { SkeletonDirective } from '@proxy/directives/skeleton';
import { MarkdownModule } from 'ngx-markdown';
import { CopyButtonComponent } from '@proxy/ui/copy-button';
import { ManagementComponent } from '../management/management.component';
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
import dayjs from 'dayjs';
import { omit } from 'lodash-es';
import { PageEvent } from '@angular/material/paginator';
import { UserComponentStore } from './user.store';
import { IUser } from '@proxy/models/users-model';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureComponentStore } from '../../features/feature/feature.store';
import { IFeature } from '@proxy/models/features-model';
import { takeUntil } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-users',
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatTabsModule,
        MatSelectModule,
        MatDialogModule,
        MatMenuModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        DateRangePickerComponent,
        NoRecordFoundComponent,
        MatPaginatorGotoComponent,
        SearchComponent,
        SkeletonDirective,
        MarkdownModule,
        CopyButtonComponent,
        ManagementComponent,
    ],
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    providers: [UserComponentStore, FeatureComponentStore],
})
export class UserComponent extends BaseComponent implements OnDestroy, OnInit {
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    private componentStore = inject(UserComponentStore);
    private featureComponentStore = inject(FeatureComponentStore);
    private cdr = inject(ChangeDetectorRef);

    /** Store current API inprogress state */
    public loading$: Observable<{ [key: string]: boolean }> = this.componentStore.loading$;
    /** Store User data */
    public users$: Observable<IPaginatedResponse<IUser[]>> = this.componentStore.users$;
    /** Store display column */
    public displayedColumns: string[] = [
        'name',
        'email',
        'phone_number',
        'user_id',
        'block_name',
        'last_login',
        'created_at',
    ];
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

    constructor() {
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
                this.cdr.markForCheck();
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
