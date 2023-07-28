import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        NgxMatTimepickerModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatMenuModule,
        MatInputModule,
        MatButtonModule,
    ],
    declarations: [TimePickerComponent],
    exports: [TimePickerComponent],
})
export class UiTimePickerModule {}
