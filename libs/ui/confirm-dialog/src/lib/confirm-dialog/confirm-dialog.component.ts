import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { A11yModule } from '@angular/cdk/a11y';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'proxy-confirm-dialog',
    imports: [MatButtonModule, A11yModule],
    templateUrl: './confirm-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
    public dialogRef = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef);

    /** Title of dialog */
    public title = input<string>('Confirmation');
    /** Confirmation message of dialog */
    public confirmationMessage = input<string>('Are you sure to perform this operation?');
    /** Confirm button text of dialog */
    public confirmButtonText = input<string>('Yes');
    /** Cancel button text of dialog */
    public cancelButtonText = input<string>('Cancel');
    /** Show Footer Action Button Position */
    public footerButtonPosition = input<string>('justify-content-end');
    /** Confirm button color */
    public confirmButtonColor = input<string>('warn');
    /** Cancel button color */
    public cancelButtonColor = input<string>('');
    /** True, if need to show confirm button */
    public showConfirmButton = input<boolean>(true);
    /** True, if need to show cancel button */
    public showCancelButton = input<boolean>(true);
    /** True, if need to change confirm button type */
    public confirmButtonClass = input<string>('mat-flat-button');
    /** True, if need to change cancel button type*/
    public cancelButtonClass = input<string>('mat-button');

    /**
     * Closes the dialog with user provided action
     *
     * @param {('yes' | 'no')} action User provided action
     * @memberof ConfirmDialogComponent
     */
    public closeDialog(action: 'yes' | 'no'): void {
        this.dialogRef.close(action);
    }
}
