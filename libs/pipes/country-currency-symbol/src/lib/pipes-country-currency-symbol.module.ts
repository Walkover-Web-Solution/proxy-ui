import { getCurrencySymbol } from '@angular/common';
import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { PipesFieldValuePipeModule } from '@proxy/pipes/FieldValuePipe';

@Pipe({
    name: 'currencySymbol',
})
export class CustomDatePipe implements PipeTransform {
    constructor() {}

    transform(code: string, format: 'wide' | 'narrow' = 'narrow', locale?: string): any {
        return getCurrencySymbol(code, format, locale);
    }
}

@NgModule({
    declarations: [CustomDatePipe],
    exports: [CustomDatePipe],
    imports: [PipesFieldValuePipeModule],
})
export class PipesCountryCurrencySymbolModule {
    public static forRoot(): ModuleWithProviders<PipesCountryCurrencySymbolModule> {
        return {
            ngModule: PipesCountryCurrencySymbolModule,
            providers: [CustomDatePipe],
        };
    }
}
