import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { leaveCompany } from '../../store/actions/otp.action';
import { distinctUntilChanged, Observable, take, takeUntil } from 'rxjs';
import { leaveCompanyData, leaveCompanyDataInProcess, leaveCompanySuccess } from '../../store/selectors';
import { IAppState } from '../../store/app.state';
import { isEqual } from 'lodash';

@Component({
    selector: 'proxy-confirmation-dialog',
    templateUrl: './user-dialog.component.html',
    styleUrls: ['./user-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
    deleteCompany$: Observable<any>;
    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { companyId: any; authToken: string },
        private store: Store<IAppState>
    ) {
        this.deleteCompany$ = this.store.pipe(select(leaveCompanySuccess));
    }

    confirmleave() {
        this.store.dispatch(
            leaveCompany({
                companyId: this.data.companyId,
                authToken: this.data.authToken,
            })
        );

        this.deleteCompany$.pipe().subscribe((res) => {
            if (res) {
                window.parent.postMessage(
                    { type: 'proxy', data: { event: 'userLeftCompany', companyId: this.data.companyId } },
                    '*'
                );
                this.dialogRef.close('confirmed');
            }
        });
    }

    closeDialog(action: string): void {
        this.dialogRef.close(action);
    }
}
