import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceTimezoneAutocompleteComponent } from './voice-timezone-autocomplete/voice-timezone-autocomplete.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { VoiceLibServiceModule } from '@msg91/service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatIconModule,
        VoiceLibServiceModule,
        MatProgressSpinnerModule,
    ],
    declarations: [VoiceTimezoneAutocompleteComponent],
    exports: [VoiceTimezoneAutocompleteComponent],
})
export class UiComponentsVoiceTimezoneAutocompleteModule {}
