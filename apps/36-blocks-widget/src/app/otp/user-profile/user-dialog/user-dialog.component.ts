import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { PublicScriptTheme } from '@proxy/constant';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { leaveCompany } from '../../store/actions/otp.action';
import { Observable } from 'rxjs';
import { leaveCompanySuccess } from '../../store/selectors';
import { IAppState } from '../../store/app.state';

@Component({
    selector: 'proxy-confirmation-dialog',
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    templateUrl: './user-dialog.component.html',
    styleUrls: ['./user-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
    deleteCompany$: Observable<any>;
    theme: string;
    protected readonly PublicScriptTheme = PublicScriptTheme;

    public dialogRef = inject<MatDialogRef<ConfirmationDialogComponent>>(MatDialogRef);
    public data = inject<{ companyId: any; authToken: string; theme: string }>(MAT_DIALOG_DATA);
    private store = inject<Store<IAppState>>(Store);

    constructor() {
        this.deleteCompany$ = this.store.pipe(select(leaveCompanySuccess));
        this.theme = this.data.theme;
        if (this.theme === PublicScriptTheme.Dark) {
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
