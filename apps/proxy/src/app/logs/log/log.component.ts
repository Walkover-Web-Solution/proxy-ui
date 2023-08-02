import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { BaseComponent } from "@proxy/ui/base-component";
import {DEFAULT_SEVEN_DAYS_DATE_RANGE} from '@proxy/constant';
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { LogsComponentStore } from "./logs.component.store";
import { Observable } from "rxjs";
import { ILogsData } from "@proxy/models/logs-models";
import { IPaginatedResponse } from "@proxy/models/root-models";

export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
  }
  
  const ELEMENT_DATA: PeriodicElement[] = [
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
    {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
    {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
    {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
    {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
    {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  ];

@Component({
    selector: 'proxy-logs',
    templateUrl: './log.component.html',
    styleUrls: ['./log.component.scss'],
    providers: [LogsComponentStore]
})
export class LogComponent extends BaseComponent implements  OnDestroy, OnInit {

    projectsList: any[] = [
        {value: 'steak-0', viewValue: 'Steak'},
        {value: 'pizza-1', viewValue: 'Pizza'},
        {value: 'tacos-2', viewValue: 'Tacos'},
      ];
    public selectedExportRangeValue = DEFAULT_SEVEN_DAYS_DATE_RANGE; 
    public displayedColumns: string[] = ['time', 'endpoint', 'request_type', 'status_code', 'response_time'];
    public dataSource = new MatTableDataSource(ELEMENT_DATA);
    @ViewChild(MatSort) matSort: MatSort;

    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public logs$: Observable<IPaginatedResponse<ILogsData[]>> = this.componentStore.logsData$;

    constructor(private componentStore: LogsComponentStore){
        super()
    }
    ngOnInit(): void {
      this.componentStore.getLogs(null)
    }
      

    public onEnter(e){
      console.log(e);
    } 

    public setExportDateRange(e) {
      console.log(e);
    }   
}
