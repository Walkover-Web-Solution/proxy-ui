import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { leaveCompany } from '../../store/actions/otp.action';

@Component({
    selector: 'proxy-confirmation-dialog',
    templateUrl: './user-dialog.component.html',
    styleUrls: ['./user-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { companyId: any; authToken },
        private store: Store
    ) {}

    confirmleave() {
        console.log(this.data);
        this.store.dispatch(
            leaveCompany({
                companyId: this.data.companyId,
                authToken: this.data.authToken,
            })
        );
    }

    closeDialog(action: string): void {
        this.dialogRef.close(action);
    }
}
