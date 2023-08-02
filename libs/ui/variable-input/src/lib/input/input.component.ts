import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'proxy-input',
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true,
        },
    ],
})
export class InputComponent implements ControlValueAccessor {
    @Input() public placeholder = '';
    @Input() public disabled = false;
    @Input() public format = true;
    public value: any;
    public fileNameHasVar = false;

    onValueChange(val: string) {
        this.fileNameHasVar = /^\$\w+/g.test(val);
        this.onChange(val);
    }

    //////////// interface ControlValueAccessor ////////////
    public onChange = (v: any) => v;

    public onTouched: () => void = () => null;

    public writeValue(obj: any): void {
        if (obj) {
            this.value = obj;
            this.fileNameHasVar = /^\$\w+/g.test(obj);
        }
    }

    public registerOnChange(fn: (_: any) => any): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: () => any): void {
        this.onTouched = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
