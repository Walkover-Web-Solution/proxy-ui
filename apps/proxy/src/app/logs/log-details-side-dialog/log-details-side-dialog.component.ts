import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    selector: 'proxy-log-details-side-dialog',
    templateUrl: './log-details-side-dialog.component.html',
    styleUrls: ['./log-details-side-dialog.component.scss'],
})
export class LogsDetailsSideDialogComponent extends BaseComponent implements OnInit, OnDestroy {
    constructor(
        public dialogRef: MatDialogRef<LogsDetailsSideDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        super();
    }

    public ngOnInit(): void {
        console.log(this.data);
    }

    public onCloseDialog(): void {
        this.dialogRef.close();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
