import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectViewerComponent } from './object-viewer/object-viewer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PipesTypeofModule } from '@proxy/pipes/typeof';

@NgModule({
    declarations: [ObjectViewerComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        PipesTypeofModule,
    ],
    exports: [ObjectViewerComponent],
})
export class UiObjectViewerModule {}
