import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { LoaderComponent } from '@proxy/ui/loader';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ILogDetailRes } from '@proxy/models/logs-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { Observable } from 'rxjs';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-log-details-side-dialog',
    imports: [AsyncPipe, NgTemplateOutlet, MatButtonModule, MatIconModule, MatDialogModule, LoaderComponent],
    templateUrl: './log-details-side-dialog.component.html',
    styleUrls: ['./log-details-side-dialog.component.scss'],
})
export class LogsDetailsSideDialogComponent extends BaseComponent implements OnDestroy {
    public dialogRef = inject<MatDialogRef<LogsDetailsSideDialogComponent>>(MatDialogRef);
    public data = inject<{
        logData$: Observable<ILogDetailRes>;
        isLoading$: Observable<boolean>;
        logSettings: any;
    }>(MAT_DIALOG_DATA);

    constructor() {
        super();
    }

    public onCloseDialog(): void {
        this.dialogRef.close();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
