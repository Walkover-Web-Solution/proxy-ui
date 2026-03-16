import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { NoRecordFoundComponent } from './no-record-found.component';

@NgModule({
    imports: [CommonModule, MatCardModule, MatButtonModule],
    exports: [NoRecordFoundComponent],
    declarations: [NoRecordFoundComponent],
})
export class UiNoRecordFoundModule {}
