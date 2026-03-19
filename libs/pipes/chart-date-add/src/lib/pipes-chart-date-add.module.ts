import { Pipe, PipeTransform } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import * as dayjs from 'dayjs';

@Pipe({
    name: 'dateadd',
    standalone: true,
})
export class DateAddPipe implements PipeTransform {
    constructor() {}

    transform(value: string): SafeHtml {
        let currentDate = dayjs(value).add(7, 'day').toDate();
        return currentDate;
    }
}
