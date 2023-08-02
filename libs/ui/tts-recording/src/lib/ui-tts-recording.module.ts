import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TtsRecordingComponent } from './tts-recording/tts-recording.component';
import { UiPlayerModule } from '@proxy/ui/player';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DirectivesAutoSelectDropdownModule } from '@proxy/directives/auto-select-dropdown';

@NgModule({
    imports: [
        CommonModule,
        UiPlayerModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        DirectivesAutoSelectDropdownModule,
    ],
    declarations: [TtsRecordingComponent],
    exports: [TtsRecordingComponent],
})
export class UiTtsRecordingModule {}
