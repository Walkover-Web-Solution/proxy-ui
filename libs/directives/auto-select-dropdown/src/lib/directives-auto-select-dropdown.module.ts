import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoSelectDropDownDirective } from './auto-select-dropdown-directive';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
    imports: [CommonModule, MatAutocompleteModule, MatSelectModule],
    declarations: [AutoSelectDropDownDirective],
    exports: [AutoSelectDropDownDirective],
})
export class DirectivesAutoSelectDropdownModule {}
