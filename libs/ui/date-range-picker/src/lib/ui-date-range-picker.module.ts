import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { DateRangePickerComponent } from './date-range-picker/date-range-picker.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [DateRangePickerComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    exports: [DateRangePickerComponent],
})
export class UiDateRangePickerModule {}
