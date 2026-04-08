import { Pipe, PipeTransform } from '@angular/core';
import { keyValuePair } from '@proxy/models/root-models';

type valueType = string | number | boolean | keyValuePair<any> | any[];

@Pipe({
    name: 'typeof',
    standalone: true,
})
export class TypeOf implements PipeTransform {
    public transform(value: valueType): string {
        if (Array.isArray(value)) {
            return 'array';
        }
        return typeof value;
    }
}
