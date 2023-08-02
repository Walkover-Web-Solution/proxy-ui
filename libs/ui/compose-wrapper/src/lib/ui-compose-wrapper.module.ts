import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UiConfirmDialogModule } from '@proxy/ui/confirm-dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ComposeWrapperComponent } from './compose/compose.component';

@NgModule({
    declarations: [ComposeWrapperComponent],
    imports: [CommonModule, MatButtonModule, MatIconModule, UiConfirmDialogModule, MatTooltipModule],
    exports: [ComposeWrapperComponent],
})
export class UiComposeWrapperModule {}
