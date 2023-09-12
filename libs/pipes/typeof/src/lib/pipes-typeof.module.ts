import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { keyValuePair } from '@proxy/models/root-models';

type valueType = string | number | boolean | keyValuePair<any> | any[];

@Pipe({
    name: 'typeof',
})
export class TypeOf implements PipeTransform {
    public transform(value: valueType): string {
        if (Array.isArray(value)) {
            return 'array';
        }
        return typeof value;
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [TypeOf],
    exports: [TypeOf],
})
export class PipesTypeofModule {}
