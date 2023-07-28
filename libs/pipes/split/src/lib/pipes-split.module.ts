import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';

@Pipe({
    name: 'split',
})
export class SplitPipe implements PipeTransform {
    transform(value: string, character: string = ''): Array<string> {
        return typeof value === 'string' ? value.split(character) : [];
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [SplitPipe],
    exports: [SplitPipe],
    providers: [SplitPipe],
})
export class PipesSplitModule {}
