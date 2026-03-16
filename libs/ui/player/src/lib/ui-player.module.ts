import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

import { PlayerComponent } from './player/player.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
    declarations: [PlayerComponent],
    imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule],
    exports: [PlayerComponent],
})
export class UiPlayerModule {}
