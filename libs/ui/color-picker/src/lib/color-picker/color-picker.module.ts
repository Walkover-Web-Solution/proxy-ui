import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextDirective, SliderDirective } from './helpers';

import { ColorPickerService } from './color-picker.service';
import { ColorPickerComponent } from './component/color-picker.component';
import { ColorPickerDirective } from './color-picker.directive';

@NgModule({
    imports: [CommonModule],
    exports: [ColorPickerDirective],
    providers: [ColorPickerService],
    declarations: [ColorPickerComponent, ColorPickerDirective, TextDirective, SliderDirective],
})
export class LibColorPickerModule {}
