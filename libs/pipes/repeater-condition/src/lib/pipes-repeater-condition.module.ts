import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationsField } from '@proxy/models/segmento-models';
import * as dayjs from 'dayjs';

type KeyValue = { [key: string]: any };
type ReturnValue = string | KeyValue;
type DataType = KeyValue | Array<KeyValue>;

@Pipe({ name: 'repeaterCondition' })
export class RepeaterConditionPipe implements PipeTransform {
    private weeks = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    private months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    /**
     *
     * @param {any} element
     * @param {RepeaterFrequenciesResModel[]} frequencies
     * @returns string | { [key: string]: any }
     */
    transform(element: any, frequencies: Array<any>, includeNextPhase: boolean = false): any {
        if (element.id && frequencies?.length) {
            let str = 'Repeat ';
            const findFrequency = frequencies.find((frequency) => frequency.id === element.repeater_frequency_id);
            // console.log('findFrequency', findFrequency);
            if (findFrequency?.id) {
                findFrequency.name === 'Day' ? (str += 'in every') : (str += ' every');
                if (findFrequency.name !== 'Day') {
                    str += ` ${findFrequency.name.toLowerCase()}`;
                }
                if (includeNextPhase) {
                    str += '- ';
                }
                /** this field is belong to all frequencies array */
                const { fields } = findFrequency.configurations.setup;
                /** these frequency_configurations is belong to particular element */
                const { fields: frequency_configurations } = element.frequency_configurations.setup;
                fields.forEach((field: ConfigurationsField) => {
                    if (field.name !== 'day') {
                        str += ` ${field.prefix_label}`;
                    }
                    const fieldsValueInConfiguration = frequency_configurations[field.name];
                    if (Array.isArray(fieldsValueInConfiguration)) {
                        if (field.name !== 'days') {
                            fieldsValueInConfiguration.forEach((value: number) => {
                                str += ` ${this?.[field.name][value - 1]}, `;
                            });
                        } else {
                            str += ` ${fieldsValueInConfiguration.join(', ')}`;
                        }
                    } else {
                        if (field.name === 'time') {
                            if (!includeNextPhase) {
                                str += ` ${this.getHourFromTime(fieldsValueInConfiguration)} o'clock`;
                            } else {
                                str += ` ${this.getHourFromTime(fieldsValueInConfiguration, includeNextPhase)}`;
                            }
                        } else {
                            str += ` ${fieldsValueInConfiguration}`;
                        }
                    }
                    if (field.name !== 'time') {
                        str += ` ${field.name === 'day' ? 'days' : field.name}`;
                    }
                });
                if (includeNextPhase) {
                    /** need to continue from here for show extra msg */
                    str += '\n';
                    str += 'Start date - ' + dayjs(element.start_date).format('D MMM YYYY');
                    str += `${
                        '\n' +
                        'End date - ' +
                        (element.end_date ? dayjs(element.end_date).format('D MMM YYYY') : 'No expiry')
                    }`;
                }
            }
            return str;
        }
        return '';
    }

    private getHourFromTime(time: string, includeNextPhase: boolean = false) {
        const hourPart = time.split(':');
        let hour = hourPart[0][0] === '0' ? hourPart[0][1] : hourPart[0];
        if (!includeNextPhase) {
            return hour;
        }
        return hourPart[0] + ':' + hourPart[1] + (+hour > 12 ? ' PM' : ' AM');
    }

    private toMilliseconds = (hrs = 0, min = 0, sec = 0) => (hrs * 60 * 60 + min * 60 + sec) * 1000;
}

@NgModule({
    imports: [CommonModule],
    declarations: [RepeaterConditionPipe],
    exports: [RepeaterConditionPipe],
})
export class PipesRepeaterConditionModule {
    public static forRoot(): ModuleWithProviders<PipesRepeaterConditionModule> {
        return {
            ngModule: PipesRepeaterConditionModule,
            providers: [RepeaterConditionPipe],
        };
    }
}
