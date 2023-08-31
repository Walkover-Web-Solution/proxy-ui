import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import * as objectSupport from 'dayjs/plugin/objectSupport';
import { ConvertToDigitTimeToken } from '@proxy/utils';

dayjs.extend(objectSupport);
@Pipe({ name: 'timeToken' })
export class TimeTokenPipe implements PipeTransform {
    constructor() {}

    transform(
        value: string | number,
        atTimeFormat: boolean = false,
        currentTime: number = null,
        format: string
    ): string {
        if (typeof value === 'string' && value.includes(':')) {
            // Converts the time with AM and PM (meridian symbols)
            const [hours, minutes, seconds] = value.split(':');
            const date = dayjs({
                hour: Number(hours ?? 0),
                minute: Number(minutes ?? 0),
                second: Number(seconds ?? 0),
            });
            return date.format(format ?? 'hh:mm:ss A');
        } else if (value && !atTimeFormat && !currentTime) {
            return dayjs(ConvertToDigitTimeToken(value)).format('MM/DD/YY h:mm a');
        } else if (value && atTimeFormat) {
            return dayjs(value).format('MMM DD, YYYY') + ' at ' + dayjs(value).format('hh:mm A');
        } else if (value && currentTime) {
            let expireAfter = (+value - currentTime) / 1000;
            let expireAfterMins = Math.floor(expireAfter / 60);
            if (expireAfterMins > 0) {
                return expireAfterMins + ' mins';
            }
            return Math.floor(expireAfter) + ' secs';
        }
        return null;
    }
}

@NgModule({
    declarations: [TimeTokenPipe],
    exports: [TimeTokenPipe],
})
export class PipesTimeTokenPipeModule {
    public static forRoot(): ModuleWithProviders<PipesTimeTokenPipeModule> {
        return {
            ngModule: PipesTimeTokenPipeModule,
            providers: [TimeTokenPipe],
        };
    }
}
