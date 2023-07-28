import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceTemplateDropdownComponent } from './voice-template-dropdown/voice-template-dropdown.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UiVirtualScrollModule } from '@msg91/ui/virtual-scroll';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DirectivesAutoSelectDropdownModule } from '@msg91/directives/auto-select-dropdown';

@NgModule({
    declarations: [VoiceTemplateDropdownComponent],
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
        DirectivesAutoSelectDropdownModule,
    ],
    exports: [VoiceTemplateDropdownComponent],
})
export class UiComponentsVoiceTemplateDropdownModule {}
