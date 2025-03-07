import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { leaveCompany } from '../../store/actions/otp.action';
import { Observable, take } from 'rxjs';
import { leaveCompanyData } from '../../store/selectors';

@Component({
    selector: 'proxy-confirmation-dialog',
    templateUrl: './user-dialog.component.html',
    styleUrls: ['./user-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
    deleteCompany$: Observable<any>;
    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { companyId: any; authToken },
        private store: Store
    ) {
        this.deleteCompany$ = this.store.pipe(select(leaveCompanyData));
    }

    confirmleave() {
        this.store.dispatch(
            leaveCompany({
                companyId: this.data.companyId,
                authToken: this.data.authToken,
            })
        );

        this.deleteCompany$.pipe(take(1)).subscribe((res) => {
            console.log({ res });
            this.dialogRef.close('confirmed');
        });
    }

    closeDialog(action: string): void {
        this.dialogRef.close(action);
    }
}
