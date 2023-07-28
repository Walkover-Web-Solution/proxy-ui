import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numberformat', pure: true })
export class NumberFormatPipe implements PipeTransform {
    transform(input: any, type: string = 'USA'): any {
        if (type === 'USA' || type === 'GBP') {
            let exp;
            const suffixes = ['k', 'M', 'B', 'T', 'P', 'E'];

            if (Number.isNaN(input)) {
                return null;
            }
            if (input < 1000) {
                return input;
            }

            exp = Math.floor(Math.log(input) / Math.log(1000));
            return Math.floor((input / Math.pow(1000, exp)) * Math.pow(10, 2)) / Math.pow(10, 2) + suffixes[exp - 1];
            //.toFixed(2) + suffixes[exp - 1];
        } else {
            const suffixes = ['k', 'L', 'Cr'];

            if (Number.isNaN(input)) {
                return null;
            }
            if (input < 1000) {
                return input;
            }
            if (input > 999 && input < 100000) {
                return Math.floor((input / 1000) * Math.pow(10, 2)) / Math.pow(10, 2) + suffixes[0];
            }
            if (input > 99999 && input < 10000000) {
                return Math.floor((input / 100000) * Math.pow(10, 2)) / Math.pow(10, 2) + suffixes[1];
            }

            if (input > 9999999) {
                return Math.floor((input / 10000000) * Math.pow(10, 2)) / Math.pow(10, 2) + suffixes[2];
            }
        }
    }
}

@NgModule({
    imports: [],
    declarations: [NumberFormatPipe],
    exports: [NumberFormatPipe],
})
export class PipesNumberFormatPipeModule {
    public static forRoot(): ModuleWithProviders<PipesNumberFormatPipeModule> {
        return {
            ngModule: PipesNumberFormatPipeModule,
            providers: [NumberFormatPipe],
        };
    }
}
