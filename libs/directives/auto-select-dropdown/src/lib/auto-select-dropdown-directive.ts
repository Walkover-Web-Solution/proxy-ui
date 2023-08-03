import { Directive, Optional, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatAutocomplete, _MatAutocompleteBase } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';

@Directive({ selector: '[proxyAutoSelectDropdown]' })
export class AutoSelectDropDownDirective implements AfterViewInit {
    @Input() public disableAutoSelectDirective: boolean = false;
    @Output() public setControlValue = new EventEmitter<any>();
    private autoCompleteInterval: any;

    constructor(
        @Optional() private autoCompleteSelect: MatAutocomplete,
        @Optional() private matSelect: MatSelect,
        @Optional() private formControl: NgControl
    ) {}

    public ngAfterViewInit(): void {
        if (!this.disableAutoSelectDirective) {
            if (this.matSelect) {
                setTimeout(() => {
                    if (this.matSelect.options?.length === 1) {
                        if (this.formControl && !this.formControl?.value) {
                            this.setControlValue.emit(this.matSelect.options.first.value);
                            this.formControl.control.setValue(this.matSelect.options.first.value);
                            this.formControl.control.markAsDirty();
                        } else if (!this.formControl) {
                            this.setControlValue.emit(this.matSelect.options.first.value);
                        }
                    }
                }, 200);
            }
            if (this.autoCompleteSelect) {
                this.autoCompleteInterval = setInterval(() => {
                    if (this.autoCompleteSelect?.options?.first?.value) {
                        if (this.autoCompleteSelect.options?.length === 1) {
                            this.setControlValue.emit(this.autoCompleteSelect.options.first.value);
                        }
                        clearInterval(this.autoCompleteInterval);
                    }
                }, 500);
            }
        }
    }

    public ngOnDestroy(): void {
        clearInterval(this.autoCompleteInterval);
    }
}
