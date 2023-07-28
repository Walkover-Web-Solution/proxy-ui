import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MicroServiceTypeDropdownComponent } from './microservice-type-dropdown/microservice-type-dropdown.component';
import { FormsModule } from '@angular/forms';
import { DirectivesAutoSelectDropdownModule } from '@msg91/directives/auto-select-dropdown';

@NgModule({
    declarations: [MicroServiceTypeDropdownComponent],
    imports: [CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, DirectivesAutoSelectDropdownModule],
    exports: [MicroServiceTypeDropdownComponent],
})
export class UiMicroserviceTypeDropdownModule {}
