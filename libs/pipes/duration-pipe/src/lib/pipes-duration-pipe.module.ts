import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
    transform(value: number): string {
        return dayjs('2019-01-01').second(value).format('HH:mm:ss');
    }
}

@NgModule({
    declarations: [DurationPipe],
    exports: [DurationPipe],
})
export class PipesDurationPipeModule {
    public static forRoot(): ModuleWithProviders<PipesDurationPipeModule> {
        return {
            ngModule: PipesDurationPipeModule,
            providers: [DurationPipe],
        };
    }
}
