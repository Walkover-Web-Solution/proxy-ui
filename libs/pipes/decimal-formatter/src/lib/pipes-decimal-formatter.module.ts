import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { decimalNumberSystem, numberSystem } from '@proxy/constant';
import { PipesFieldValuePipeModule, FieldValuePipe } from '@proxy/pipes/FieldValuePipe';

@Pipe({ name: 'decimalFormatter' })
export class DecimalFormatterPipe implements PipeTransform {
    constructor(private fieldValuePipe: FieldValuePipe) {}
    /**
     *
     * @param value to format according to separatorId or decimalDigitsLength
     * @param separatorId for use to format value.
     * @param decimalDigitsLength value to fixed for decimal point.
     * @param decimal to use decimalNumberSystem or numberSystem constant
     * @returns string
     */
    transform(
        value: string,
        separatorId: number | null,
        decimalDigitsLength: number = 2,
        decimal: boolean = true
    ): string {
        if (separatorId && value) {
            const findFormatter = this.fieldValuePipe.transform(
                decimal ? decimalNumberSystem : numberSystem,
                separatorId?.toString(),
                'value',
                'key'
            ) as string;
            if (findFormatter?.length) {
                if (separatorId === 2) {
                    return (+value).toLocaleString('en-IN', {
                        minimumFractionDigits: decimalDigitsLength,
                        maximumFractionDigits: decimalDigitsLength,
                    });
                }
                value = (+value).toFixed(decimalDigitsLength) + '';
                let x = value.split('.');
                let x1 =
                    x[0]?.length >= 5
                        ? this.convert(x[0].split('').reverse(), this.returnSeparator(separatorId), 3)
                        : x[0];
                let x2 = x.length > 1 ? '.' + x[1] : '';
                return x1 + x2;
            }
        }
        return value ? (+value).toFixed(decimalDigitsLength) : value;
    }

    private returnSeparator(separatorId: number) {
        switch (separatorId) {
            case 1:
            case 2:
                return ',';
            case 3:
                return '’';
            case 4:
                return ' ';
            default:
                break;
        }
    }

    public convert(x: string[], joinWith: string, i?: number) {
        let subStrings = [];
        while (x.length) {
            subStrings.push(x.splice(0, i).reverse().join(''));
        }
        return subStrings.reverse().join(joinWith);
    }
}
@NgModule({
    declarations: [DecimalFormatterPipe],
    exports: [DecimalFormatterPipe],
    imports: [PipesFieldValuePipeModule],
    providers: [FieldValuePipe],
})
export class PipesDecimalFormatterModule {
    public static forRoot(): ModuleWithProviders<PipesDecimalFormatterModule> {
        return {
            ngModule: PipesDecimalFormatterModule,
            providers: [DecimalFormatterPipe],
        };
    }
}
