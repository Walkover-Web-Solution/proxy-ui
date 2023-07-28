import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';

@Pipe({
    name: 'join',
})
export class JoinPipe implements PipeTransform {
    transform(value: Array<any>, character: string): string {
        return Array.isArray(value) ? value.join(character) : '';
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [JoinPipe],
    exports: [JoinPipe],
    providers: [JoinPipe],
})
export class PipesJoinModule {}
