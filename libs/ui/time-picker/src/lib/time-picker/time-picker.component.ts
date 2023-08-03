import { takeUntil } from 'rxjs/operators';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { BaseComponent } from '@proxy/ui/base-component';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import * as dayjs from 'dayjs';

@Component({
    selector: 'proxy-time-picker',
    templateUrl: './time-picker.component.html',
    styleUrls: ['./time-picker.component.scss'],
})
export class TimePickerComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() appearance = 'outline';
    @Input() label = 'Select Time';
    @Input() timeFormControl: UntypedFormControl;
    @Input() showSeconds = false;
    @Input() enableMeridian = true;
    @Input() showSpinners = true;
    @Input() disabled = false;
    public defaultTime: string[];
    public timeGroup = new UntypedFormGroup({
        time: new UntypedFormControl(null),
    });
    constructor() {
        super();
    }

    public ngOnInit(): void {
        const defaultTime = this.timeFormControl?.value?.split(':');
        this.defaultTime =
            defaultTime?.length > 1
                ? [defaultTime[0], defaultTime[1], this.showSeconds ? defaultTime[2] ?? '0' : '0']
                : [];
        if (this.enableMeridian) {
            this.setTimeWithMeridian(this.timeFormControl?.value);
            this.timeFormControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((res: string) => {
                this.setTimeWithMeridian(res);
            });
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public menuOpened() {
        document
            .querySelector('.custom-time-picker-menu.mat-menu-panel')
            ?.setAttribute(
                'style',
                'max-width: none; margin-top : -' +
                    getComputedStyle(document.querySelector('.custom-time-picker-form .mat-form-field-wrapper'))[
                        'padding-bottom'
                    ]
            );
    }

    public setTime() {
        this.timeFormControl.setValue(dayjs(this.timeGroup.value.time).format(this.timeFormat));
        this.timeFormControl.markAsDirty();
    }

    public clearField(): void {
        this.timeFormControl?.patchValue('');
        this.timeFormControl.markAsDirty();
    }

    public setTimeWithMeridian(time: string) {
        if (time && time.split(' ').length === 1) {
            this.timeFormControl.setValue(dayjs(time, 'hh:mm').format(this.timeFormat));
            this.timeFormControl.markAsDirty();
        }
    }

    public get timeFormat(): string {
        return (
            (this.enableMeridian ? 'hh' : 'HH') +
            ':mm' +
            (this.showSeconds ? ':ss' : '') +
            (this.enableMeridian ? ' A' : '')
        );
    }
}
