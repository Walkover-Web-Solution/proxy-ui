import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PlayerComponent } from './player/player.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [PlayerComponent],
    imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule],
    exports: [PlayerComponent],
})
export class UiPlayerModule {}
