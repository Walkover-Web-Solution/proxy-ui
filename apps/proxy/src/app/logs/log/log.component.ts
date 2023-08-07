import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import {
    DEFAULT_END_DATE,
    DEFAULT_SELECTED_DATE_RANGE,
    DEFAULT_START_DATE,
    SelectDateRange,
    PAGE_SIZE_OPTIONS,
} from '@proxy/constant';
import { MatSort } from '@angular/material/sort';
import { LogsComponentStore } from './logs.component.store';
import { Observable, filter, take, takeUntil } from 'rxjs';
import { IEnvProjects, ILogsRes } from '@proxy/models/logs-models';
import { IPaginatedResponse } from '@proxy/models/root-models';
import * as dayjs from 'dayjs';
import { omit } from 'lodash';
import { MatSelectChange } from '@angular/material/select';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ONLY_INTEGER_REGEX } from '@proxy/regex';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CustomValidators } from '@proxy/custom-validator';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { LogsDetailsSideDialogComponent } from '../log-details-side-dialog/log-details-side-dialog.component';
@Component({
    selector: 'proxy-logs',
    templateUrl: './log.component.html',
    styleUrls: ['./log.component.scss'],
    providers: [LogsComponentStore],
})
export class LogComponent extends BaseComponent implements OnDestroy, OnInit {
    @ViewChild(MatSort) matSort: MatSort;
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    public displayedColumns: string[] = [
        'created_at',
        'project_name',
        'user_ip',
        'endpoint',
        'request_type',
        'status_code',
        'response_time',
    ];
    public params: any = {};
    public selectedRangeValue = DEFAULT_SELECTED_DATE_RANGE;
    public selectedDefaultDateRange = SelectDateRange;
    public selectedDateRange = {
        startDate: DEFAULT_START_DATE,
        endDate: DEFAULT_END_DATE,
    };
    public requestTypes: Array<string> = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    public pageSizeOptions = PAGE_SIZE_OPTIONS;
    public engProjectControl: FormControl<string> = new FormControl<string>('');
    public selectedRow: number;
    // Observable
    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public logs$: Observable<IPaginatedResponse<ILogsRes[]>> = this.componentStore.logsData$;
    public envProjects$: Observable<IPaginatedResponse<IEnvProjects[]>> = this.componentStore.envProjects$;
    public reqLogs$: Observable<any> = this.componentStore.reqLogs$;

    /* Logs Filter Form */
    public logsFilterForm = new FormGroup(
        {
            requestType: new FormControl<string[]>(this.requestTypes),
            range: new FormControl<string>(''),
            from: new FormControl<number>({ value: null, disabled: true }, [
                Validators.pattern(ONLY_INTEGER_REGEX),
                Validators.maxLength(6),
            ]),
            to: new FormControl<number>({ value: null, disabled: true }, [
                Validators.pattern(ONLY_INTEGER_REGEX),
                Validators.maxLength(6),
            ]),
        },
        CustomValidators.greaterThan('from', 'to')
    );

    constructor(private componentStore: LogsComponentStore, private dialog: MatDialog, private cdr: ChangeDetectorRef) {
        super();
    }
    ngOnInit(): void {
        this.params = {
            ...this.params,
            ...this.formatDateRange(),
        };
        this.getLogs();
        this.componentStore.getEnvProjects();
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
     * Sort Logs by column name with order 'asc' | 'desc'
     * @param event
     */
    public sortLogs(event: MatSort): void {
        if (event.direction !== '') {
            this.params = { ...this.params, sortBy: event.active, order: event.direction };
            this.getLogs();
        } else {
            this.params = omit(this.params, ['sortBy', 'order']);
            this.getLogs();
        }
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
     * Filter select by env project
     * @param event
     */
    public selectEnvProject(event: MatSelectChange): void {
        if (event.value) {
            this.params = {
                ...this.params,
                slug: event.value,
            };
        } else {
            this.params = omit(this.params, ['slug']);
        }
        this.getLogs();
    }

    /**
     * Select All Request Type
     * @param change
     */
    public toggleSelectAllReqType(change: MatCheckboxChange) {
        const requestTypeControl = this.logsFilterForm.controls.requestType;
        if (change.checked) {
            requestTypeControl.patchValue(this.requestTypes);
        } else {
            requestTypeControl.patchValue([]);
        }
    }

    /**
     * Range Type Changes
     * @param value
     */
    public changeRangeType(value) {
        const { from, to } = this.logsFilterForm.controls;
        if (value) {
            from.enable();
            to.enable();
        } else {
            from.reset();
            to.reset();
            from.disable();
            to.disable();
        }
    }

    /**
     * Reset Filter Form
     */
    public resetForm() {
        this.logsFilterForm.patchValue({
            range: '',
            from: null,
            to: null,
            requestType: this.requestTypes,
        });
    }

    /**
     * Reset Param
     */
    public resetParam(): void {
        this.resetForm();
        this.changeRangeType(null);
        this.closeMyMenu();
        this.applyFilter();
    }
    /**
     * Close the menu
     * @memberof LogsComponent
     */
    public closeMyMenu(): void {
        if (this.logsFilterForm.value.requestType?.length === 0) {
            this.logsFilterForm.controls.requestType.setValue(this.requestTypes);
            this.logsFilterForm.controls.requestType.updateValueAndValidity();
        }
        this.trigger?.closeMenu();
    }

    /**
     * Apply Filter
     */
    public applyFilter() {
        const formValue = this.logsFilterForm.value;
        if (formValue) {
            this.params = CustomValidators.removeNullKeys({
                ...this.params,
                range: formValue.range ? formValue.range : null,
                from: formValue.from ? formValue.from : null,
                to: formValue.to ? formValue.to : null,
                request_type:
                    formValue.requestType?.length && formValue.requestType.length !== this.requestTypes.length
                        ? formValue.requestType.join(',')
                        : null,
            });
        }
        this.params.pageNo = 1;
        this.getLogs();
        this.closeMyMenu();
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
     * View Logs By Logs Id
     * @param id
     */
    public viewLogsDetails(id) {
        this.selectedRow = id;
        this.componentStore.getLogsById(id);
        this.reqLogs$.pipe(filter(Boolean), take(1)).subscribe((res) => {
            if (res?.request_body) {
                const dialogRef = this.dialog.open(LogsDetailsSideDialogComponent, {
                    panelClass: ['mat-right-dialog', 'mat-dialog-lg'],
                    data: JSON.parse(res.request_body),
                    autoFocus: false,
                });

                dialogRef.afterClosed().subscribe(() => {
                    this.selectedRow = 0;
                    this.cdr.detectChanges();
                });
            }
        });
    }

    /**
     * Get Logs
     */
    public getLogs(): void {
        this.componentStore.getLogs({ ...this.params });
    }
}
