import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';

@Pipe({
    name: 'replace',
})
export class ReplacePipe implements PipeTransform {
    transform(value: string, expression: any, replaceWith: string, replaceAll: boolean = true): string {
        if (value) {
            if (typeof expression === 'object') {
                let replacedValue = value;
                const keys = Object.keys(expression);
                if (keys.length) {
                    // expression is an object
                    keys.forEach((key) => {
                        replacedValue = replacedValue.replaceAll(key, expression[key] ?? '');
                    });
                    return replacedValue;
                } else {
                    // expression is a Regex
                    return replaceAll
                        ? value?.replaceAll(expression, replaceWith)
                        : value?.replace(expression, replaceWith);
                }
            } else {
                // expression is a string
                return replaceAll
                    ? value?.replaceAll(expression, replaceWith)
                    : value?.replace(expression, replaceWith);
            }
        }
        return value;
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [ReplacePipe],
    exports: [ReplacePipe],
    providers: [ReplacePipe],
})
export class PipesReplaceModule {}
