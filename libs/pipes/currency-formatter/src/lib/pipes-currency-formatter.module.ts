import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { DecimalFormatterPipe, PipesDecimalFormatterModule } from '@proxy/pipes/DecimalFormatter';

@Pipe({ name: 'currencyFormatter' })
export class CurrencyFormatterPipe implements PipeTransform {
    constructor(private currencyPipe: CurrencyPipe, private decimalFormatterPipe: DecimalFormatterPipe) {}
    /**
     *
     * @param value to format according to currency
     * @param currencyCode currency code to use to formate value
     * @param separatorId for use to format value after currency change.
     * @param decimalDigitsLength value to fixed for decimal point.
     * @returns string
     */
    transform(
        value: string,
        currencyCode: string,
        separatorId: number | null,
        decimalDigitsLength: number = 2
    ): string {
        if (value) {
            let splittedValue = value.split(' ');
            let digitInfo = `${1}.${decimalDigitsLength}-${decimalDigitsLength}`;
            const convertedCurrency = this.currencyPipe.transform(splittedValue[0], currencyCode, true, digitInfo);
            if (separatorId) {
                const currencyWithoutLocalSeparator = convertedCurrency.replace(/[^0-9.]/g, '');
                // .slice(1, convertedCurrency.length - 1)
                let formattedInDecimal = this.decimalFormatterPipe.transform(
                    currencyWithoutLocalSeparator,
                    separatorId,
                    decimalDigitsLength
                );
                if (!formattedInDecimal?.length) {
                    formattedInDecimal = splittedValue[0];
                }
                return formattedInDecimal + ' ' + currencyCode;
            }
            return convertedCurrency.replace(/[^0-9.]/g, '') + ' ' + currencyCode;
        }
        return value;
    }
}
@NgModule({
    declarations: [CurrencyFormatterPipe],
    exports: [CurrencyFormatterPipe],
    imports: [CommonModule, PipesDecimalFormatterModule],
    providers: [CurrencyPipe, DecimalFormatterPipe],
})
export class PipesCurrencyFormatterModule {
    public static forRoot(): ModuleWithProviders<PipesCurrencyFormatterModule> {
        return {
            ngModule: PipesCurrencyFormatterModule,
            providers: [CurrencyFormatterPipe],
        };
    }
}
