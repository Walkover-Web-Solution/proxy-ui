import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

@Pipe({
    name: 'relativeTime',
    pure: true,
})
export class RelativeTimePipe implements PipeTransform {
    transform(date: string, format: string): string {
        if (date) {
            const time = format && format?.length ? dayjs(date).format(format) : dayjs(date);
            const relativeTime = dayjs(time).fromNow();
            return relativeTime;
        } else {
            return '--';
        }
    }
}

@NgModule({
    imports: [],
    declarations: [RelativeTimePipe],
    exports: [RelativeTimePipe],
})
export class PipesRelativeTimePipeModule {
    public static forRoot(): ModuleWithProviders<PipesRelativeTimePipeModule> {
        return {
            ngModule: PipesRelativeTimePipeModule,
            providers: [RelativeTimePipe],
        };
    }
}
