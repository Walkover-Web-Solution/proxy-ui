import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseComponent } from '@proxy/ui/base-component';
import { IUser } from '@proxy/models/users-model';

@Component({
    selector: 'proxy-user-details-dialog',
    templateUrl: './user-details-dialog.component.html',
    styleUrls: ['./user-details-dialog.component.scss'],
})
export class UserDetailsDialogComponent extends BaseComponent implements OnDestroy {
    constructor(
        public dialogRef: MatDialogRef<UserDetailsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { user: IUser }
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
