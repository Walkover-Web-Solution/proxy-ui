import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_SELECT_CONFIG } from '@angular/material/select';
import { DEBOUNCE_TIME } from '@proxy/constant';
import { BaseComponent } from '@proxy/ui/base-component';
import { isEqual } from 'lodash-es';
import { debounceTime, takeUntil } from 'rxjs';

import { MultiSelectGroupOptions } from './multi-select.model';

@Component({
    selector: 'proxy-multi-select',
    templateUrl: './multi-select.component.html',
    styleUrls: ['./multi-select.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: MultiSelectComponent,
            multi: true,
        },
        {
            provide: MAT_SELECT_CONFIG,
            useValue: { overlayPanelClass: 'multi-select-below-position' },
        },
    ],
})
export class MultiSelectComponent extends BaseComponent implements OnChanges, OnInit, OnDestroy, ControlValueAccessor {
    /** Input field label */
    @Input() multiSelectLabelValue = '';
    /** Input placeholder text */
    @Input() multiSelectPlaceholder = '';
    /** Custom CSS class */
    @Input() multiSelectClass = '';
    /** Stores the records to be shown as mat-option */
    @Input() multiSelectValues: Array<MultiSelectGroupOptions> | Array<any> = [];
    /** Stores the label key which is to be shown to the user in dropdown */
    @Input() multiSelectValuesLabel: string;
    /** Stores the value ID with which the comparison will be made between option and selected value of the dropdown */
    @Input() multiSelectValuesId: string;
    /** If true, then a 'All' entry will be displayed in the dropdown */
    @Input() showSelectAll: boolean;
    /** Stores the label text to be shown for 'All' option */
    @Input() selectAllLabel = 'All';
    /** If true, mat select options will be grouped based on the provided 'multiSelectValuesLabel' */
    @Input() shouldGroupOptions: boolean;
    /** Stores the debounce time before which select event should not be triggered */
    @Input() debounceTime: number = DEBOUNCE_TIME;
    /** If true, will emit the value after menu close  */
    @Input() emitSelectedValueOnMenuClose: boolean;

    /** Form control instance to store selected values */
    public multiSelectControl: FormControl<Array<any>> = new FormControl([]);
    /** Stores the all grouped values, required to set the 'All' option in checked state for group scenario*/
    public allGroupedValues: Array<any>;
    /** True, if touched */
    public touched: boolean;
    /** Stores the previously selected values, required to compare the current value and previous value to only
     * emit selected event when user has made a change
     */
    private previousSelectedValues: Array<MultiSelectGroupOptions> | Array<any> = [];

    constructor() {
        super();
    }

    /** Stores the touch handler funciton obtained in registerOnTouched */
    public onTouch = () => {};
    /** Stores the touch handler funciton obtained in registerOnTouched */
    public onChange = (value) => {};

    writeValue(value: Array<MultiSelectGroupOptions> | Array<any>): void {
        this.setControlValue(value, false);
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
        if (!this.emitSelectedValueOnMenuClose) {
            this.multiSelectControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(this.onChange);
        }
    }
    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }
    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.multiSelectControl.disable();
        } else {
            this.multiSelectControl.enable();
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (
            changes.multiSelectValues &&
            !isEqual(changes.multiSelectValues.currentValue, changes.multiSelectValues.previousValue)
        ) {
            if (this.showSelectAll) {
                // 'All' options is enabled, set the form value with all the values
                this.setControlValue(this.multiSelectValues);
            }
        }
    }

    public ngOnInit(): void {
        this.multiSelectControl.valueChanges
            .pipe(debounceTime(this.debounceTime), takeUntil(this.destroy$))
            .subscribe(() => {
                if (!isEqual(this.previousSelectedValues, this.multiSelectControl.value)) {
                    // Only emit when there is a difference between the previous value and the current value
                    if (!this.emitSelectedValueOnMenuClose) {
                        this.previousSelectedValues = this.multiSelectControl.value;
                        // Only emit on change of selection when parent has not opted to emit on mat select menu close
                        this.onChange(this.multiSelectControl.value);
                    }
                }
            });
    }

    public toggleSelectAll(event: MatCheckboxChange): void {
        if (event.checked) {
            if (!this.shouldGroupOptions) {
                this.multiSelectControl.setValue(this.multiSelectValues);
            } else {
                this.multiSelectControl.setValue(this.allGroupedValues);
            }
        } else {
            this.multiSelectControl.setValue([]);
        }
    }

    /**
     * Compares the item values conditionally. If multiSelectValuesLabel
     * is provided then that is used to compare otherwise the two items are
     * compared directly
     *
     * @param {*} firstValue First value for comparison
     * @param {*} secondValue Second value for comparison
     * @return {boolean} True, if values are equal
     * @memberof MultiSelectComponent
     */
    public compareConditionally = (firstValue: any, secondValue: any): boolean => {
        return this.multiSelectValuesId
            ? firstValue[this.multiSelectValuesId] === secondValue[this.multiSelectValuesId]
            : firstValue === secondValue;
    };

    /**
     * Mat select 'opened' change handler, emits the selected value
     * on mat select close if 'emitSelectedValueOnMenuClose' is true
     *
     * @param {boolean} isOpen True, if mat select is in open state
     * @memberof MultiSelectComponent
     */
    public handleStateChange(isOpen: boolean): void {
        this.markAsTouched();
        if (!isOpen && !isEqual(this.previousSelectedValues, this.multiSelectControl.value)) {
            // Only emit when parent has opted for menu close and there is a difference between previous and current value
            this.previousSelectedValues = this.multiSelectControl.value;
            this.onChange(this.multiSelectControl.value);
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private markAsTouched(): void {
        if (!this.touched) {
            this.onTouch();
            this.touched = true;
        }
    }

    private setControlValue(val: Array<MultiSelectGroupOptions> | Array<any>, shouldEmit: boolean = true): void {
        const currentValue = val || [];
        if (!this.shouldGroupOptions) {
            // Grouping of options is not enabled, directly assign the values to the form control
            this.multiSelectControl.setValue(val);
        } else {
            // Grouping of options is enabled, find all the values of groups and then assign the values to the form control
            this.allGroupedValues = [];
            (currentValue as Array<MultiSelectGroupOptions>).forEach((value) => {
                this.allGroupedValues.push(...value.value);
            });
            this.multiSelectControl.setValue(this.allGroupedValues);
        }
        if (shouldEmit) {
            this.onChange(this.multiSelectControl.value);
        }
        this.previousSelectedValues = this.multiSelectControl.value;
    }
}
