import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatPaginatorGotoComponent } from './mat-paginator-goto/mat-paginator-goto.component';

@NgModule({
    declarations: [MatPaginatorGotoComponent],
    imports: [CommonModule, MatPaginatorModule, MatFormFieldModule, MatSelectModule, FormsModule, ScrollingModule],
    exports: [MatPaginatorGotoComponent],
})
export class UiMatPaginatorGotoModule {}
