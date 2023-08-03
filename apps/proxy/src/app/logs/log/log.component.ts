import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import { DEFAULT_END_DATE, DEFAULT_SELECTED_DATE_RANGE, DEFAULT_START_DATE, SelectDateRange, PAGE_SIZE_OPTIONS } from '@proxy/constant';
import { MatSort } from '@angular/material/sort';
import { LogsComponentStore } from './logs.component.store';
import { Observable } from 'rxjs';
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
@Component({
    selector: 'proxy-logs',
    templateUrl: './log.component.html',
    styleUrls: ['./log.component.scss'],
    providers: [LogsComponentStore],
})
export class LogComponent extends BaseComponent implements OnDestroy, OnInit {
    @ViewChild(MatSort) matSort: MatSort;
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    public displayedColumns: string[] = ['created_at', 'endpoint', 'request_type', 'status_code', 'response_time'];
    public params: any = {};
    public selectedRangeValue = DEFAULT_SELECTED_DATE_RANGE;
    public selectedDefaultDateRange = SelectDateRange;
    public selectedDateRange = {
        startDate: DEFAULT_START_DATE,
        endDate: DEFAULT_END_DATE,
    };
    public requestTypes: Array<string> = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    public pageSizeOptions = PAGE_SIZE_OPTIONS;

    // Observable
    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public logs$: Observable<IPaginatedResponse<ILogsRes[]>> = this.componentStore.logsData$;
    public envProjects$: Observable<IPaginatedResponse<IEnvProjects[]>> = this.componentStore.envProjects$;

    /* Logs Filter Form */
    public logsFilterForm = new FormGroup({
      requestType: new FormControl<string[]>(this.requestTypes),
      // startDate: new FormControl<string | Date>(DEFAULT_START_DATE),
      // endDate: new FormControl<string | Date>(DEFAULT_END_DATE),
      range: new FormControl<string>(''),
      from: new FormControl<number>({ value: null, disabled: true }, [
          Validators.pattern(ONLY_INTEGER_REGEX),
          Validators.maxLength(6),
      ]),
      to: new FormControl<number>({ value: null, disabled: true }, [
          Validators.pattern(ONLY_INTEGER_REGEX),
          Validators.maxLength(6),
      ]),
  });

    constructor(private componentStore: LogsComponentStore) {
        super();
    }
    ngOnInit(): void {
        this.params = {
          ...this.params,
          ...this.formatDateRange()
        }
        this.getLogs();
        this.componentStore.getEnvProjects();
    }

    public onEnter(searchKeyword: string) {
        if(searchKeyword?.length){
          this.params = {
            ...this.params,
            slug: searchKeyword.trim()
          }
        }else{
          this.params = {...omit(this.params, ['slug'])};
        }
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
        }else {
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
        ...this.formatDateRange()
      }
      this.getLogs();
    }

    /**
     * Filter select by env project
     * @param event 
     */
    public selectEnvProject(event:MatSelectChange): void {
      if(event.value){
        console.log(event.value)
      }
    }

    public toggleSelectAll(change: MatCheckboxChange){
      const requestTypeControl = this.logsFilterForm.controls.requestType;
      if (change.checked) {
          requestTypeControl.patchValue(this.requestTypes);
      } else {
          requestTypeControl.patchValue([]);
      }
    }

    public changeRangeType(value){
      if (value) {
          this.logsFilterForm.controls.from.enable();
          this.logsFilterForm.controls.to.enable();
      } else {
          this.logsFilterForm.controls.from.setValue(null);
          this.logsFilterForm.controls.to.setValue(null);
          this.logsFilterForm.controls.from.disable();
          this.logsFilterForm.controls.to.disable();
      }
    }

    public resetForm(){
      this.logsFilterForm.patchValue({
          // startDate: dayjs(DEFAULT_START_DATE).format('YYYY-MM-DD'),
          // endDate: dayjs(DEFAULT_END_DATE).format('YYYY-MM-DD'),
          range: null,
          from: null,
          to: null,
          requestType: this.requestTypes,
      });
    }

    public resetParam():void {
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
      this.trigger?.closeMenu();
    } 

    public applyFilter(){
      if (this.logsFilterForm.value) {
        this.params = CustomValidators.removeNullKeys({
              ...this.params,
              // startDate: dayjs(this.logsFilterForm.value.startDate).format('YYYY-MM-DD'),
              // endDate: dayjs(this.logsFilterForm.value.endDate).format('YYYY-MM-DD'),
              range: this.logsFilterForm.value.range ? this.logsFilterForm.value.range : null,
              from: this.logsFilterForm.value.from ? this.logsFilterForm.value.from : null,
              to: this.logsFilterForm.value.to ? this.logsFilterForm.value.to : null,
              request_type: this.logsFilterForm.value.requestType?.length
                  ? this.logsFilterForm.value.requestType.join(',')
                  : null,
          });
      }
      this.params.pageNo = 1;
      console.log(this.params)
      this.getLogs();
      this.closeMyMenu();
    }

    public pageChange(event: PageEvent): void{
      console.log('Page Event', event);
      this.params = {
        ...this.params,
        pageNo: event.pageIndex + 1,
        itemsPerPage: event.pageSize
      }
      this.getLogs();
    }

    /**
     * Get Logs
     */
    public getLogs(): void {
        this.componentStore.getLogs({ ...this.params });
    }
}
