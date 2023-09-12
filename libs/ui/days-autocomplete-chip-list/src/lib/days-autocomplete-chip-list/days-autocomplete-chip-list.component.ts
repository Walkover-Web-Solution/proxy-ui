import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WEEK_DAYS, WEEK_DAYS_FULL, WEEK_DAYS_LESS } from '@proxy/constant';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    selector: 'proxy-days-autocomplete-chip-list',
    templateUrl: './days-autocomplete-chip-list.component.html',
})
export class DaysAutocompleteChipListComponent extends BaseComponent implements OnChanges {
    @Input() appearance = 'outline';
    @Input() label = 'Days';
    @Input() placeholder = 'Select Days';
    @Input() isRequired = false;
    @Input() optionsType: 'full' | 'short' | 'letter' = 'full';
    @Input() markAsTouched = false;
    @Input() selectedDaysIndexes: number[];
    @Output() selectedDaysIndexesChange = new EventEmitter<number[]>();

    public dayList: string[];
    public dayOptions: string[];
    public selectedDays: string[] = [];
    public daysFormControl = new FormControl<string>('');

    constructor() {
        super();
        switch (this.optionsType) {
            case 'full':
                this.dayList = WEEK_DAYS_FULL;
                break;
            case 'short':
                this.dayList = WEEK_DAYS;
                break;
            case 'letter':
                this.dayList = WEEK_DAYS_LESS;
        }
        this.dayOptions = [...this.dayList];
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.selectedDaysIndexes && this.selectedDaysIndexes.length !== this.selectedDays.length) {
            this.filterDayOptions(false, true);
        }
        if (changes.markAsTouched) {
            if (this.markAsTouched) {
                this.daysFormControl.markAsTouched();
            } else {
                this.daysFormControl.markAsPristine();
            }
        }
    }

    public handleChipListSelection(event: any) {
        this.selectedDays.push(event.option.value);
        this.daysFormControl.setValue('');
        this.filterDayOptions();
    }

    public removeChipListSelection(index: number) {
        this.selectedDays.splice(index, 1);
        this.filterDayOptions();
    }

    public filterDayOptions(emitChanges: boolean = true, checkbyIndexes?: boolean) {
        const selectedDays = [];
        const selectedDaysIndexes = [];
        this.dayOptions = this.dayList.filter((val, index) => {
            if (checkbyIndexes ? this.selectedDaysIndexes.includes(index) : this.selectedDays.includes(val)) {
                selectedDays.push(val);
                selectedDaysIndexes.push(index);
            } else {
                return val;
            }
        });
        this.selectedDays = selectedDays;
        if (emitChanges) {
            this.selectedDaysIndexesChange.emit(selectedDaysIndexes);
        }
    }
}
