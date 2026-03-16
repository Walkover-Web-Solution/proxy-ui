import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { ConfirmationDialogComponent } from '../user-dialog/user-dialog.component';
import { OtpService } from '../../service/otp.service';

@NgModule({
    declarations: [ConfirmationDialogComponent],
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    exports: [ConfirmationDialogComponent, MatDialogModule],
    providers: [OtpService],
})
export class UserDialogModule {}
