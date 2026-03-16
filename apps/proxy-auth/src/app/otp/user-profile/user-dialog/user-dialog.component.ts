import { Component, Inject, ViewEncapsulation } from '@angular/core';
import {
    MatLegacyDialogRef as MatDialogRef,
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { select, Store } from '@ngrx/store';
import { leaveCompany } from '../../store/actions/otp.action';
import { Observable } from 'rxjs';
import { leaveCompanySuccess } from '../../store/selectors';
import { IAppState } from '../../store/app.state';

@Component({
    selector: 'proxy-confirmation-dialog',
    templateUrl: './user-dialog.component.html',
    styleUrls: ['./user-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ConfirmationDialogComponent {
    deleteCompany$: Observable<any>;
    theme: string;
    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { companyId: any; authToken: string; theme: string },
        private store: Store<IAppState>
    ) {
        this.deleteCompany$ = this.store.pipe(select(leaveCompanySuccess));
        this.theme = data.theme;
        if (this.theme === 'dark') {
            this.dialogRef.addPanelClass('confirm-dialog-dark');
        }
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
