import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DaysAutocompleteChipListComponent } from './days-autocomplete-chip-list/days-autocomplete-chip-list.component';

@NgModule({
    imports: [
        CommonModule,
        MatAutocompleteModule,
        FormsModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
    ],
    declarations: [DaysAutocompleteChipListComponent],
    exports: [DaysAutocompleteChipListComponent],
})
export class UiComponentsDaysAutocompleteChipListModule {}
