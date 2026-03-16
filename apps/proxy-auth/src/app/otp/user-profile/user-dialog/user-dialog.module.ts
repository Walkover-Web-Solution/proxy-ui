import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmationDialogComponent } from '../user-dialog/user-dialog.component';
import { OtpService } from '../../service/otp.service';

@NgModule({
    declarations: [ConfirmationDialogComponent],
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    exports: [ConfirmationDialogComponent, MatDialogModule],
    providers: [OtpService],
})
export class UserDialogModule {}
