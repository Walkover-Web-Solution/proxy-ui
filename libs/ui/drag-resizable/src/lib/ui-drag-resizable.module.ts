import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizableModule } from './resizable/resizable.module';

@NgModule({
    imports: [CommonModule, ResizableModule],
    exports: [ResizableModule],
})
export class UiDragResizableModule {}
