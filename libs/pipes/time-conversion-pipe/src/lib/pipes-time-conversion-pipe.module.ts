import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import * as advancedFormat from 'dayjs/plugin/advancedFormat';
import { ConvertToDigitTimeToken } from '@proxy/utils';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

@Pipe({
    name: 'timeConversion',
})
export class TimeConversionPipe implements PipeTransform {
    transform(
        value: number,
        format: 'longDate' | 'shortDate' | 'timeAgo' | 'shortTime' | 'longtime' | 'hrMinSec'
    ): string {
        if (value) {
            const timeToken = ConvertToDigitTimeToken(value);
            switch (format) {
                case 'longDate': {
                    if (
                        dayjs(timeToken).date() === dayjs().date() &&
                        dayjs(timeToken).month() === dayjs().month() &&
                        dayjs(timeToken).year() === dayjs().year()
                    ) {
                        return 'Today';
                    } else if (
                        dayjs(timeToken).date() === dayjs().date() - 1 &&
                        dayjs(timeToken).month() === dayjs().month() &&
                        dayjs(timeToken).year() === dayjs().year()
                    ) {
                        return 'Yesterday';
                    }
                    return dayjs(timeToken).format('LL');
                }
                case 'longtime': {
                    return dayjs(timeToken).format('hh:mm a z');
                }
                case 'shortDate': {
                    if (
                        dayjs(timeToken).date() === dayjs().date() &&
                        dayjs(timeToken).month() === dayjs().month() &&
                        dayjs(timeToken).year() === dayjs().year()
                    ) {
                        return 'Today';
                    } else if (
                        dayjs(timeToken).date() === dayjs().date() - 1 &&
                        dayjs(timeToken).month() === dayjs().month() &&
                        dayjs(timeToken).year() === dayjs().year()
                    ) {
                        return 'Yesterday';
                    }
                    return dayjs(timeToken).format('Do MMM, YYYY');
                }
                case 'shortTime': {
                    return dayjs(timeToken).format('hh:mm a');
                }
                case 'timeAgo': {
                    // return dayjs(ConvertToDigitTimeToken(value)).tz().fromNow();
                    return dayjs(timeToken).fromNow();
                }
                case 'hrMinSec': {
                    if (!value) return '0 hr 0 min 0 sec';
                    if (value < 60) return value + ' Seconds';
                    const h = Math.floor(value / 3600);
                    const m = Math.floor((value % 3600) / 60);
                    const s = Math.floor((value % 3600) % 60);
                    let str = '0 hr 0 min 0 sec';
                    if (h > 0) {
                        str = h + ' hr';
                        if (m > 0) str += ' ' + m + ' min';
                        if (s > 0) str += ' ' + s + ' sec';
                    } else if (m > 0) {
                        str = m + ' min';
                        if (s > 0) str += ' ' + s + ' sec';
                    }
                    return str;
                }
                default: {
                    return dayjs(timeToken).fromNow();
                }
            }
        }
        return '';
    }
}

@NgModule({
    declarations: [TimeConversionPipe],
    exports: [TimeConversionPipe],
})
export class PipesTimeConversionPipeModule {
    public static forRoot(): ModuleWithProviders<PipesTimeConversionPipeModule> {
        return {
            ngModule: PipesTimeConversionPipeModule,
            providers: [TimeConversionPipe],
        };
    }
}
