import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { SortingBottomSheetComponent } from './sorting-bottom-sheet/sorting-bottom-sheet.component';

@NgModule({
    declarations: [SortingBottomSheetComponent],
    imports: [
        MatBottomSheetModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatListModule,
        MatRippleModule,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
    ],
    exports: [SortingBottomSheetComponent],
})
export class UiSortingBottomSheetModule {}
