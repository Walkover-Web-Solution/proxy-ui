import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateRange, MatCalendar } from '@angular/material/datepicker';
import { MatMenuTrigger } from '@angular/material/menu';
import { DEFAULT_SELECTED_DATE_RANGE, JS_START_DATE, SelectDateRange } from '@proxy/constant';
import { DATE_FORMAT_REGEX } from '@proxy/regex';
import * as dayjs from 'dayjs';
import * as quarterOfYear from 'dayjs/plugin/quarterOfYear';
import * as advancedFormat from 'dayjs/plugin/advancedFormat';
import { cloneDeep } from 'lodash-es';
import { Subject } from 'rxjs';
dayjs.extend(quarterOfYear);
dayjs.extend(advancedFormat);

@Component({
    selector: 'date-range-picker',
    templateUrl: './date-range-picker.component.html',
    styleUrls: ['./date-range-picker.component.scss'],
    host: {
        '(window:resize)': 'onResize($event)',
    },
})
export class DateRangePickerComponent implements OnInit, OnChanges, OnDestroy {
    @ViewChild('calendar', { static: false }) calendar: MatCalendar<Date>;
    @ViewChild('trigger') trigger: MatMenuTrigger;
    @Input() selectedRangeValue: DateRange<Date> | undefined;
    @Input() placeholder = 'Date range';
    @Input() selectedDefaultDateRange: SelectDateRange = null;
    @Output() selectedRangeValueChange: any = new EventEmitter<DateRange<Date>>();
    @Output() menuClosedEvent = new EventEmitter<boolean>();
    @Input() floatLabelBackground: string = '#ffffff';
    @Input() minDate: Date = JS_START_DATE;
    @Input() public customOptionActive: boolean = true;
    @Input() public openMenu: boolean = false;
    @Input() public cssClass: string = '';
    private _destroy$: Subject<any>;
    public showRangePicker: boolean = false;
    public range = new UntypedFormGroup({
        start: new UntypedFormControl('', [Validators.required, Validators.pattern(DATE_FORMAT_REGEX)]),
        end: new UntypedFormControl('', [Validators.required, Validators.pattern(DATE_FORMAT_REGEX)]),
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
        if (!this.selectedRangeValue || !this.selectedRangeValue.start) {
            this.setDateRange(dayjs(), dayjs());
            this.selectedDateValue = 'Select Date Range';
        }
        this.innerWidth = window.innerWidth;
        this.initialSelectedDateRange = cloneDeep(this.selectedRangeValue);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes['selectedRangeValue']) {
            if (
                new Date(this.selectedRangeValue.start).getTime() ===
                    new Date(DEFAULT_SELECTED_DATE_RANGE.start).getTime() &&
                new Date(this.selectedRangeValue.end).getTime() === new Date(DEFAULT_SELECTED_DATE_RANGE.end).getTime()
            ) {
                this.monthSelected = 'current';
                this.quarterSelected = null;
            }
            this.setInputDate();
        }

        if (changes && changes['openMenu']?.currentValue) {
            this.trigger?.openMenu();
        }
        if (changes?.selectedDefaultDateRange) {
            switch (this.selectedDefaultDateRange) {
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
        }
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
        this.calenderDateRange =
            this.selectedRangeValue && this.selectedRangeValue.start
                ? cloneDeep(this.selectedRangeValue)
                : new DateRange<Date>(new Date(), new Date());
        this.setDateRange(this.calenderDateRange.start, this.calenderDateRange.end);
        if (this.selectedRangeValue && this.selectedRangeValue.start) {
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
        this.selectedRangeValue = cloneDeep(this.calenderDateRange);
        this.selectedRangeValueChange.emit(this.calenderDateRange);
        this.showRangePicker = false;
        this.trigger?.closeMenu();
    }

    public closeDialog(): void {
        this.trigger.closeMenu();
    }

    public resetDate(): void {
        this.selectedRangeValue = cloneDeep(this.initialSelectedDateRange);
        if (this.initialSelectedDateRange.start) {
            this.setInputDate();
            this.applyDateRange();
        } else {
            this.selectedDateValue = 'Select Date Range';
            this.selectedRangeValueChange.emit(this.selectedDateValue);
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
            if (startDate < this.minDate || endDate < this.minDate) {
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
