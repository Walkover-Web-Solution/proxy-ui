import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as dayjs from 'dayjs';
import * as isYesterday from 'dayjs/plugin/isYesterday';
import * as isToday from 'dayjs/plugin/isToday';
dayjs.extend(isYesterday);
dayjs.extend(isToday);

@Pipe({
    name: 'showDaysFormate',
})
export class ShowDaysFormatePipe implements PipeTransform {
    transform(input: any): string {
        // const dayDiff = dayjs().diff(dayjs(input), 'day');

        if (dayjs(input).isToday()) {
            return 'today';
        } else if (dayjs(input).isYesterday()) {
            return 'yesterday';
        } else {
            return dayjs(input).format(dayjs(input).format('MMMM').length <= 4 ? 'DD MMMM YYYY' : 'DD MMM YYYY');
        }
        // else if (dayDiff > 1 && dayDiff < 7) {
        //     return dayjs(input).format('dddd');
        // } else if (dayDiff === 1 && dayDiff < 7) {
        //     return dayjs(input).format('dddd');
        // }
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [ShowDaysFormatePipe],
    exports: [ShowDaysFormatePipe],
})
export class PipesShowDaysFormatModule {
    public static forRoot(): ModuleWithProviders<PipesShowDaysFormatModule> {
        return {
            ngModule: PipesShowDaysFormatModule,
            providers: [ShowDaysFormatePipe],
        };
    }
}
