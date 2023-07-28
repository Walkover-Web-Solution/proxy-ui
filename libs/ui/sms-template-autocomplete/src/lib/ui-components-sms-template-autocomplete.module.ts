import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UiVirtualScrollModule } from '@msg91/ui/virtual-scroll';
import { MatSelectModule } from '@angular/material/select';
import { smsTemplateAutocompleteComponent } from './sms-template-autocomplete/sms-template-autocomplete.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
        ScrollingModule,
        MatTooltipModule,
        ServicesSharedModule,
        DirectivesAutoSelectDropdownModule,
    ],
    declarations: [smsTemplateAutocompleteComponent],
    exports: [smsTemplateAutocompleteComponent],
})
export class UiComponentsSMSTemplateAutocompleteModule {}
