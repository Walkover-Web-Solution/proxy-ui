import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignAutocompleteComponent } from './campaign-autocomplete/campaign-autocomplete.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UiVirtualScrollModule } from '@msg91/ui/virtual-scroll';
import { MatMenuModule } from '@angular/material/menu';
import { DirectivesAutoSelectDropdownModule } from '@msg91/directives/auto-select-dropdown';
import { MatTooltipModule } from '@angular/material/tooltip';

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
        MatMenuModule,
        DirectivesAutoSelectDropdownModule,
        MatTooltipModule,
    ],
    declarations: [CampaignAutocompleteComponent],
    exports: [CampaignAutocompleteComponent],
})
export class UiComponentsCampaignAutocompleteModule {}
