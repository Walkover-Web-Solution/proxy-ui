import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Pipe({ name: 'utcDateTime' })
export class UtcToLocalDatePipe implements PipeTransform {
    transform(value: string, format: string = 'ddd MMM DD YYYY HH:mm:ss'): string {
        if (value) {
            if (format === 'atFormat') {
                return (
                    dayjs.utc(value).local().format('MMM DD, YYYY') +
                    ' at ' +
                    dayjs.utc(value).local().format('hh:mm A')
                );
            } else {
                return dayjs.utc(value).local().format(format);
            }
        }
        return '';
    }
}

@NgModule({
    imports: [],
    declarations: [UtcToLocalDatePipe],
    exports: [UtcToLocalDatePipe],
})
export class PipesUtcToLocalDatePipeModule {
    public static forRoot(): ModuleWithProviders<PipesUtcToLocalDatePipeModule> {
        return {
            ngModule: PipesUtcToLocalDatePipeModule,
            providers: [UtcToLocalDatePipe],
        };
    }
}
