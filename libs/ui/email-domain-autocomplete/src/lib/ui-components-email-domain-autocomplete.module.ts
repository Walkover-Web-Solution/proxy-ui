import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailDomainAutocompleteComponent } from './email-domain-autocomplete/email-domain-autocomplete.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { UiVirtualScrollModule } from '@msg91/ui/virtual-scroll';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServicesSharedModule } from '@msg91/services/shared';
import { DirectivesAutoSelectDropdownModule } from '@msg91/directives/auto-select-dropdown';

@NgModule({
    imports: [
        CommonModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatIconModule,
        MatButtonModule,
        UiVirtualScrollModule,
        MatSelectModule,
        MatTooltipModule,
        ServicesSharedModule,
        DirectivesAutoSelectDropdownModule,
    ],
    declarations: [EmailDomainAutocompleteComponent],
    exports: [EmailDomainAutocompleteComponent],
})
export class UiComponentsEmailDomainAutocompleteModule {}
