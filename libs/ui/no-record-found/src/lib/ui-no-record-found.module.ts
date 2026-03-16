import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NoRecordFoundComponent } from './no-record-found.component';

@NgModule({
    imports: [CommonModule, MatCardModule, MatButtonModule],
    exports: [NoRecordFoundComponent],
    declarations: [NoRecordFoundComponent],
})
export class UiNoRecordFoundModule {}
