import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendlyDialogComponent } from './calendly-dialog/calendly-dialog.component';
import { PipesSafeUrlPipeModule } from '@proxy/pipes/SafeURLPipe';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { ClipboardModule } from '@angular/cdk/clipboard';

@NgModule({
    declarations: [CalendlyDialogComponent],
    imports: [
        CommonModule,
        PipesSafeUrlPipeModule,
        MatDialogModule,
        MatIconModule,
        MatListModule,
        MatTooltipModule,
        MatButtonModule,
        ClipboardModule,
    ],
    exports: [CalendlyDialogComponent],
})
export class UiComponentsCalendlyDialogModule {}
