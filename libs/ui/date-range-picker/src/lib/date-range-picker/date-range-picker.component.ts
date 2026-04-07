import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    effect,
    input,
    model,
    output,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateRange, MatCalendar } from '@angular/material/datepicker';
import { MatMenuTrigger } from '@angular/material/menu';
import { DEFAULT_SELECTED_DATE_RANGE, JS_START_DATE, SelectDateRange } from '@proxy/constant';
import { DATE_FORMAT_REGEX } from '@proxy/regex';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { cloneDeep } from 'lodash-es';
import { Subject } from 'rxjs';
dayjs.extend(quarterOfYear);
dayjs.extend(advancedFormat);

@Component({
    selector: 'date-range-picker',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    templateUrl: './date-range-picker.component.html',
    styleUrls: ['./date-range-picker.component.scss'],
    host: {
        '(window:resize)': 'onResize($event)',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePickerComponent implements OnInit, OnDestroy {
    @ViewChild('calendar', { static: false }) calendar: MatCalendar<Date>;
    @ViewChild('trigger') trigger: MatMenuTrigger;

    selectedRangeValue = model<DateRange<Date> | undefined>(undefined);
    placeholder = input<string>('Date range');
    selectedDefaultDateRange = input<SelectDateRange>(null);
    menuClosedEvent = output<boolean>();
    floatLabelBackground = input<string>('#ffffff');
    minDate = input<Date>(JS_START_DATE);
    public customOptionActive = input<boolean>(true);
    public openMenu = input<boolean>(false);
    public cssClass = input<string>('');

    constructor() {
        effect(() => {
            if (this.openMenu()) {
                this.trigger?.openMenu();
            }
        });

        effect(() => {
            switch (this.selectedDefaultDateRange()) {
                case SelectDateRange.CurrentMonth:
                    this.selectThisMonth();
                    break;
                case SelectDateRange.PreviousMonth:
                    this.selectLastMonth();
                    break;
                case SelectDateRange.CurrentQuarter:
                    this.selectThisQuarter();
                    break;
                case SelectDateRange.PreviousQuarter:
                    this.selectLastQuarter();
                    break;
                default:
                    break;
            }
        });

        effect(() => {
            const rv = this.selectedRangeValue();
            if (rv) {
                if (
                    new Date(rv.start).getTime() === new Date(DEFAULT_SELECTED_DATE_RANGE.start).getTime() &&
                    new Date(rv.end).getTime() === new Date(DEFAULT_SELECTED_DATE_RANGE.end).getTime()
                ) {
                    this.monthSelected = 'current';
                    this.quarterSelected = null;
                }
                this.setInputDate();
            }
        });
    }
    private _destroy$: Subject<any>;
    public showRangePicker: boolean = false;
    public range = new FormGroup({
        start: new FormControl<string>('', [Validators.required, Validators.pattern(DATE_FORMAT_REGEX)]),
        end: new FormControl<string>('', [Validators.required, Validators.pattern(DATE_FORMAT_REGEX)]),
    });
    public today: Date = new Date();
    public startDate: any;
    public endDate: any;
    public selectedDateValue: string;
    public calenderDateRange: DateRange<Date>;
    public monthSelected: 'current' | 'last' | null = null;
    public quarterSelected: 'current' | 'last' | null = null;
    public innerWidth: number;
    public initialSelectedDateRange: DateRange<Date> | undefined;
    public selectedDateIsGreaterThenToday: boolean = false;
    public selectedDateIsSmallerThenMinDate: boolean = false;
    private rangeValue: { start: null | Date; end: null | Date } = {
        start: null,
        end: null,
    };

    public ngOnInit(): void {
        const rv = this.selectedRangeValue();
        if (!rv || !rv.start) {
            this.setDateRange(dayjs(), dayjs());
            this.selectedDateValue = 'Select Date Range';
        }
        this.innerWidth = window.innerWidth;
        this.initialSelectedDateRange = cloneDeep(rv);
    }

    public ngOnDestroy(): void {
        if (this._destroy$) {
            this._destroy$.next(true);
            this._destroy$.complete();
        }
    }

    public onResize(event): void {
        this.innerWidth = event.target.innerWidth;
    }

    public setInputDate(): void {
        const rv = this.selectedRangeValue();
        this.calenderDateRange = rv && rv.start ? cloneDeep(rv) : new DateRange<Date>(new Date(), new Date());
        this.setDateRange(this.calenderDateRange.start, this.calenderDateRange.end);
        if (rv && rv.start) {
            this.selectedDateValue =
                dayjs(this.calenderDateRange.start).format('Do MMM YY') +
                ' - ' +
                dayjs(this.calenderDateRange.end).format('Do MMM YY');
        } else {
            this.selectedDateValue = 'Select Date Range';
        }
        if (this.calendar) {
            this.calendar._goToDateInView(new Date(this.calenderDateRange.start), 'month');
        }
    }

    public selectedChange(m: any): void {
        let start, end;
        if (this.rangeValue.start && this.rangeValue.end) {
            this.rangeValue = {
                start: null,
                end: null,
            };
        }

        this.monthSelected = null;
        this.quarterSelected = null;

        if (!this.rangeValue.start && !this.rangeValue.end) {
            this.rangeValue.start = m;
            start = this.rangeValue.start;
            end = this.calenderDateRange?.end;
            if (start > end) {
                const temp = start;
                start = end;
                end = temp;
            }
        } else if (this.rangeValue.start && !this.rangeValue.end) {
            this.rangeValue.end = m;
            start = this.rangeValue.start;
            end = this.rangeValue.end;
            if (start > end) {
                const temp = start;
                start = end;
                end = temp;
            }
        }
        this.calenderDateRange = new DateRange<Date>(end, start);
        this.setDateRange(start, end);
        // if (!this.calenderDateRange?.start || this.calenderDateRange?.end) {
        //     this.calenderDateRange = new DateRange<Date>(m, null);
        // } else {
        //     const start = this.calenderDateRange.start;
        //     const end = m;
        //     if (end < start) {
        //         this.calenderDateRange = new DateRange<Date>(end, start);
        //         this.setDateRange(end, start);
        //     } else {
        //         this.calenderDateRange = new DateRange<Date>(start, end);
        //         this.setDateRange(start, end);
        //     }
        // }
    }

    public toggleRangePicker() {
        this.showRangePicker = !this.showRangePicker;
        this.monthSelected = null;
    }

    public selectThisMonth(): void {
        const start = dayjs().clone().startOf('month');
        const end = dayjs();
        this.monthSelected = 'current';
        this.quarterSelected = null;
        this.setDateRange(start, end);
        // For mobile view
        if (this.innerWidth <= 600) {
            this.applyDateRange();
        }
    }

    public selectLastMonth(): void {
        const previousMonth = dayjs().subtract(1, 'month').clone();
        const start = cloneDeep(previousMonth).startOf('month');
        const end = cloneDeep(previousMonth).endOf('month');
        this.monthSelected = 'last';
        this.quarterSelected = null;
        this.setDateRange(start, end);
        // For mobile view
        if (this.innerWidth <= 600) {
            this.applyDateRange();
        }
    }

    public selectThisQuarter(): void {
        const start = dayjs().quarter(dayjs().quarter()).startOf('quarter');
        const end = dayjs();
        this.quarterSelected = 'current';
        this.monthSelected = null;
        this.setDateRange(start, end);
        // For mobile view
        if (this.innerWidth <= 600) {
            this.applyDateRange();
        }
    }

    public selectLastQuarter(): void {
        const previousQuarter = dayjs().quarter(dayjs().quarter()).subtract(1, 'quarter');
        const start = cloneDeep(previousQuarter).startOf('quarter');
        const end = cloneDeep(previousQuarter).endOf('quarter');
        this.quarterSelected = 'last';
        this.monthSelected = null;
        this.setDateRange(start, end);
        // For mobile view
        if (this.innerWidth <= 600) {
            this.applyDateRange();
        }
    }

    private setDateRange(start, end): void {
        this.calenderDateRange = new DateRange<Date>(new Date(start), new Date(end));
        this.startDate = dayjs(start).format('YYYY-MM-DD');
        this.endDate = dayjs(end).format('YYYY-MM-DD');
        this.range.patchValue({ start: dayjs(start).format('DD/MM/YYYY'), end: dayjs(end).format('DD/MM/YYYY') });
        if (this.calendar) {
            this.calendar._goToDateInView(new Date(this.startDate), 'month');
        }
    }

    public applyDateRange(): void {
        if (!this.calenderDateRange.end) {
            this.calenderDateRange = new DateRange<Date>(
                new Date(this.calenderDateRange.start),
                new Date(this.calenderDateRange.start)
            );
        }
        this.selectedDateValue =
            dayjs(this.calenderDateRange.start).format('Do MMM YY') +
            ' - ' +
            dayjs(this.calenderDateRange.end).format('Do MMM YY');
        this.selectedRangeValue.set(cloneDeep(this.calenderDateRange));
        this.showRangePicker = false;
        this.trigger?.closeMenu();
    }

    public closeDialog(): void {
        this.trigger.closeMenu();
    }

    public resetDate(): void {
        if (this.initialSelectedDateRange.start) {
            this.calenderDateRange = cloneDeep(this.initialSelectedDateRange);
            this.setDateRange(this.initialSelectedDateRange.start, this.initialSelectedDateRange.end);
            this.applyDateRange();
        } else {
            this.selectedDateValue = 'Select Date Range';
            this.selectedRangeValue.set(undefined);
            this.showRangePicker = false;
            this.trigger.closeMenu();
        }
        this.monthSelected = null;
        this.quarterSelected = null;
    }

    public checkFromToDate(fromDateChange: boolean): void {
        this.selectedDateIsGreaterThenToday = false;
        this.selectedDateIsSmallerThenMinDate = false;
        if (this.range.valid) {
            const startDateParts = this.range.value.start.split('/');
            const endDateParts = this.range.value.end.split('/');
            const startDate = new Date(`${startDateParts[1]}/${startDateParts[0]}/${startDateParts[2]}`);
            const endDate = new Date(`${endDateParts[1]}/${endDateParts[0]}/${endDateParts[2]}`);
            if (startDate > this.today || endDate > this.today) {
                this.selectedDateIsGreaterThenToday = true;
                return;
            }
            if (startDate < this.minDate() || endDate < this.minDate()) {
                this.selectedDateIsSmallerThenMinDate = true;
                return;
            }
            if (startDate < endDate) {
                this.setDateRange(startDate, endDate);
            } else {
                if (fromDateChange) {
                    this.setDateRange(startDate, startDate);
                } else {
                    this.setDateRange(endDate, endDate);
                }
            }
        }
    }

    public menuClosed(): void {
        this.menuClosedEvent.emit(true);
    }
}
