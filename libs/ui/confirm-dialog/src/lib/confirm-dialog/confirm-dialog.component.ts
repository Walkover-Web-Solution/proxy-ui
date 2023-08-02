import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'proxy-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
    /** Title of dialog */
    @Input() public title: string = 'Confirmation';
    /** Confirmation message of dialog */
    @Input() public confirmationMessage: string = 'Are you sure to perform this operation?';
    /** Confirm button text of dialog */
    @Input() public confirmButtonText: string = 'Yes';
    /** Cancel button text of dialog */
    @Input() public cancelButtonText: string = 'Cancel';
    /** Show Footer Action Button Position */
    @Input() public footerButtonPosition: string = 'justify-content-end';
    /** Confirm button color */
    @Input() public confirmButtonColor: string = 'warn';
    /** Cancel button color */
    @Input() public cancelButtonColor: string = '';
    /** True, if need to show confirm button */
    @Input() public showConfirmButton: boolean = true;
    /** True, if need to show cancel button */
    @Input() public showCancelButton: boolean = true;
    /** True, if need to change confirm button type */
    @Input() public confirmButtonClass: string = 'mat-flat-button';
    /** True, if need to change cancel button type*/
    @Input() public cancelButtonClass: string = 'mat-button';

    constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

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
