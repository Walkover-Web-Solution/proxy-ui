import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import { dateFormat, timeFormat } from '@proxy/constant';
import { PipesFieldValuePipeModule, FieldValuePipe } from '@proxy/pipes/FieldValuePipe';

@Pipe({
    name: 'customDate',
})
export class CustomDatePipe implements PipeTransform {
    constructor(private fieldValuePipe: FieldValuePipe) {}

    transform(value: any, dateFormatId?: string, timeFormatId?: string): any {
        if (value) {
            let formatter = dateFormatId
                ? (this.fieldValuePipe.transform(dateFormat, dateFormatId.toString(), 'value', 'key') as string)
                : 'YYYY-MM-DD';
            if (timeFormatId)
                formatter += ' ' + this.fieldValuePipe.transform(timeFormat, timeFormatId.toString(), 'value', 'key');
            const date = dayjs(value, 'YYYY-MM-DD HH:mm:ss');
            if (date.isValid()) {
                return date.format(formatter);
            } else {
                return value;
            }
        }
        return value;
    }
}

@NgModule({
    declarations: [CustomDatePipe],
    exports: [CustomDatePipe],
    imports: [PipesFieldValuePipeModule],
    providers: [FieldValuePipe],
})
export class PipesCustomDatePipeModule {
    public static forRoot(): ModuleWithProviders<PipesCustomDatePipeModule> {
        return {
            ngModule: PipesCustomDatePipeModule,
            providers: [CustomDatePipe],
        };
    }
}
