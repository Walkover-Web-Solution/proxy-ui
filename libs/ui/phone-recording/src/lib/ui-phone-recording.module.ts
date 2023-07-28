import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneRecordingComponent } from './phone-recording/phone-recording.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
    ],
    declarations: [PhoneRecordingComponent],
    exports: [PhoneRecordingComponent],
})
export class UiPhoneRecordingModule {}
