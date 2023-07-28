import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizableComponent } from './resizable.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [ResizableComponent],
    imports: [CommonModule, DragDropModule],
    exports: [ResizableComponent],
})
export class ResizableModule {}
