import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RejectReasonComponent } from './reject-reason/reject-reason.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiLoaderModule } from '@proxy/ui/loader';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { UiComponentsSearchModule } from '@proxy/ui/search';
import { MatDialogModule } from '@angular/material/dialog';
import { UiConfirmDialogModule } from '@proxy/ui/confirm-dialog';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatDividerModule,
        MatFormFieldModule,
        MatTooltipModule,
        UiLoaderModule,
        MatButtonModule,
        MatRippleModule,
        MatInputModule,
        UiComponentsSearchModule,
        MatDialogModule,
        UiConfirmDialogModule,
    ],
    declarations: [RejectReasonComponent],
    exports: [RejectReasonComponent],
})
export class UiRejectReasonModule {}
