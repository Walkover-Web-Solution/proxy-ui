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
import { LogsComponentStore } from './logs.store';
import { Observable, distinctUntilChanged, takeUntil } from 'rxjs';
import { IEnvironments, ILogDetailRes, ILogsRes, IProjects } from '@proxy/models/logs-models';
import { IClientSettings, IPaginatedResponse } from '@proxy/models/root-models';
import * as dayjs from 'dayjs';
import { isEqual, omit } from 'lodash';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ONLY_INTEGER_REGEX } from '@proxy/regex';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CustomValidators } from '@proxy/custom-validator';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LogsDetailsSideDialogComponent } from '../log-details-side-dialog/log-details-side-dialog.component';
import { Store, select } from '@ngrx/store';
import { IAppState, selectClientSettings } from '../../ngrx';

type FilterTypes = 'environments' | 'projects';

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
    public environmentParams = {
        itemsPerPage: 25,
        pageNo: 1,
    };
    public projectParams = {
        itemsPerPage: 25,
        pageNo: 1,
    };
    public activeList: FilterTypes = null;
    public selectedRangeValue = DEFAULT_SELECTED_DATE_RANGE;
    public selectedDefaultDateRange = SelectDateRange;
    public selectedDateRange = {
        startDate: DEFAULT_START_DATE,
        endDate: DEFAULT_END_DATE,
    };
    public requestTypes: Array<string> = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    public pageSizeOptions = PAGE_SIZE_OPTIONS;
    public engProjectFormGroup = new FormGroup({
        environments: new FormControl<IEnvironments | string>(''),
        projects: new FormControl<IProjects | string>(''),
    });
    // Observable
    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public logs$: Observable<IPaginatedResponse<ILogsRes[]>> = this.componentStore.logsData$;
    public environments$: Observable<IPaginatedResponse<IEnvironments[]>> = this.componentStore.environments$;
    public projects$: Observable<IPaginatedResponse<IProjects[]>> = this.componentStore.projects$;
    public reqLogs$: Observable<ILogDetailRes> = this.componentStore.reqLogs$;
    public clientSettings$: Observable<IClientSettings>;

    public logDetailDialogRef: MatDialogRef<LogsDetailsSideDialogComponent>;

    /* Logs Filter Form */
    public logsFilterForm = new FormGroup(
        {
            requestType: new FormControl<string[]>(this.requestTypes),
            range: new FormControl<string>({ value: 'status_code', disabled: true }),
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

    constructor(
        private componentStore: LogsComponentStore,
        private store: Store<IAppState>,
        private dialog: MatDialog
    ) {
        super();
        this.clientSettings$ = this.store.pipe(
            select(selectClientSettings),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.changeRangeType(this.logsFilterForm.controls.range.value);
    }
    ngOnInit(): void {
        this.params = {
            ...this.params,
            ...this.formatDateRange(),
        };
        this.getLogs();
        this.getEnvironment();
        this.getProject();
    }

    public ngOnDestroy(): void {
        this.logDetailDialogRef?.close();
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
        this.getLogs();
    }

    /**
     * Sort Logs by column name with order 'asc' | 'desc'
     * @param event
     */
    public sortLogs(event: MatSort): void {
        if (event.direction !== '') {
            this.params = { ...this.params, sortBy: event.active, order: event.direction };
        } else {
            this.params = omit(this.params, ['sortBy', 'order']);
        }
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
     * Filter select by Environment or Project
     * @param event
     */
    public selectEnvProject(type: FilterTypes): void {
        if (!this.activeList) {
            this.activeList = type;
        } else if (this.activeList === type) {
            const inactiveControl =
                this.engProjectFormGroup.controls[type === 'environments' ? 'projects' : 'environments'];
            inactiveControl.setValue('');
            inactiveControl.updateValueAndValidity();
            this.activeList = null;
        }
        const formData = this.engProjectFormGroup.value;
        const project_id = formData?.projects?.['id'] ?? null;
        const environment_id = formData?.environments?.['id'] ?? null;
        this.params = CustomValidators.removeNullKeys({
            ...this.params,
            project_id,
            environment_id,
        });
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
            range: 'status_code',
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
        this.changeRangeType(this.logsFilterForm.controls.range.value);
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
        const formValue = this.logsFilterForm.getRawValue();
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
        this.componentStore.getLogsById(id);
        if (!this.logDetailDialogRef) {
            const clientSettings: IClientSettings = this.getValueFromObservable(this.clientSettings$);
            this.logDetailDialogRef = this.dialog.open(LogsDetailsSideDialogComponent, {
                panelClass: ['mat-right-dialog', 'mat-dialog-lg'],
                data: {
                    logData$: this.reqLogs$,
                    isLoading$: this.componentStore.reqLogsInProcess$,
                    logSettings: clientSettings?.client?.settings?.logs,
                },
                autoFocus: false,
                hasBackdrop: false,
                enterAnimationDuration: '0ms',
                exitAnimationDuration: '0ms',
            });
            this.logDetailDialogRef.afterClosed().subscribe(() => {
                this.componentStore.resetReqLog();
                this.logDetailDialogRef = null;
            });
        }
    }

    /**
     * Get Logs
     */
    public getLogs(): void {
        this.componentStore.getLogs({ ...this.params });
    }

    /**
     * Get Environment
     */
    public getEnvironment(): void {
        this.componentStore.getEnvironment(this.environmentParams);
    }

    /**
     * Get Project
     */
    public getProject(): void {
        this.componentStore.getProjects(this.projectParams);
    }

    public fetchNextPage(type: FilterTypes): void {
        if (this.activeList === type) return;
        if (
            type === 'environments' &&
            this.getValueFromObservable(this.environments$)?.totalPageCount > this.environmentParams.pageNo
        ) {
            this.environmentParams = {
                ...this.environmentParams,
                pageNo: this.environmentParams.pageNo + 1,
            };
            this.getEnvironment();
        } else if (
            type === 'projects' &&
            this.getValueFromObservable(this.projects$)?.totalPageCount > this.projectParams.pageNo
        ) {
            this.projectParams = {
                ...this.projectParams,
                pageNo: this.projectParams.pageNo + 1,
            };
            this.getProject();
        }
    }

    public envProjectDisplayFunc(obj: IEnvironments | IProjects): string {
        return obj.name ?? 'All';
    }
}
