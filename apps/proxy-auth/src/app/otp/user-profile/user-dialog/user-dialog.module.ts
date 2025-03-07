import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmationDialogComponent } from '../user-dialog/user-dialog.component';

@NgModule({
    declarations: [ConfirmationDialogComponent],
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule, // Required for buttons in the dialog
    ],
    exports: [ConfirmationDialogComponent],
})
export class UserDialogModule {}
