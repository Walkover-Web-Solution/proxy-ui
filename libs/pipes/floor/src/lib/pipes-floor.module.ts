import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';

@Pipe({
    name: 'floor',
})
export class FloorPipe implements PipeTransform {
    transform(value: number): number {
        value = value ?? 0;
        return Math.floor(value);
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [FloorPipe],
    exports: [FloorPipe],
    providers: [FloorPipe],
})
export class PipesFloorModule {}
