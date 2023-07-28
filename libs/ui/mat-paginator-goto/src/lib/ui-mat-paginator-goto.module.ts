import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorGotoComponent } from './mat-paginator-goto/mat-paginator-goto.component';

@NgModule({
    declarations: [MatPaginatorGotoComponent],
    imports: [CommonModule, MatPaginatorModule, MatFormFieldModule, MatSelectModule, FormsModule, ScrollingModule],
    exports: [MatPaginatorGotoComponent],
})
export class UiMatPaginatorGotoModule {}
