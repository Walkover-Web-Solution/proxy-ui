import { Component, Inject, OnDestroy } from '@angular/core';
import {
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
    MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { ILogDetailRes } from '@proxy/models/logs-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { Observable } from 'rxjs';

@Component({
    selector: 'proxy-log-details-side-dialog',
    templateUrl: './log-details-side-dialog.component.html',
    styleUrls: ['./log-details-side-dialog.component.scss'],
})
export class LogsDetailsSideDialogComponent extends BaseComponent implements OnDestroy {
    constructor(
        public dialogRef: MatDialogRef<LogsDetailsSideDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            logData$: Observable<ILogDetailRes>;
            isLoading$: Observable<boolean>;
            logSettings: { [key: string]: boolean };
        }
    ) {
        super();
    }

    public onCloseDialog(): void {
        this.dialogRef.close();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
