import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import * as dayjs from 'dayjs';

@Pipe({
    name: 'dateadd',
})
export class DateAddPipe implements PipeTransform {
    constructor() {}

    transform(value: string): SafeHtml {
        let currentDate = dayjs(value).add(7, 'day').toDate();
        return currentDate;
    }
}

@NgModule({
    declarations: [DateAddPipe],
    exports: [DateAddPipe],
})
export class PipesChartDateAddModule {
    public static forRoot(): ModuleWithProviders<PipesChartDateAddModule> {
        return {
            ngModule: PipesChartDateAddModule,
            providers: [DateAddPipe],
        };
    }
}
