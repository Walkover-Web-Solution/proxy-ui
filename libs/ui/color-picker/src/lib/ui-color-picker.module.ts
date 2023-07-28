import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibColorPickerModule } from './color-picker/color-picker.module';

@NgModule({
    imports: [CommonModule, LibColorPickerModule],
    exports: [LibColorPickerModule],
})
export class UiColorPickerModule {}
