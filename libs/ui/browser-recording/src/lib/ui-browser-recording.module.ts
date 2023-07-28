import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UiPlayerModule } from '@msg91/ui/player';
import { DirectivesRemoveCharacterDirectiveModule } from '@msg91/directives/RemoveCharacterDirective';
import { BrowserRecordingComponent } from './browser-recording/browser-recording.component';

@NgModule({
    declarations: [BrowserRecordingComponent],
    imports: [
        CommonModule,
        UiPlayerModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        DirectivesRemoveCharacterDirectiveModule,
    ],
    exports: [BrowserRecordingComponent],
})
export class UiBrowserRecordingModule {}
