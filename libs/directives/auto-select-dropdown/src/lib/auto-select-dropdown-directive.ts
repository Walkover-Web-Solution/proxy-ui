import { Directive, AfterViewInit, input, output, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';

@Directive({
    selector: '[proxyAutoSelectDropDown]',
    standalone: true,
    imports: [MatAutocomplete, MatSelect, NgControl],
})
export class AutoSelectDropDownDirective implements AfterViewInit {
    public disableAutoSelectDirective = input<boolean>(false);
    public setControlValue = output<any>();
    private autoCompleteInterval: any;
    private autoCompleteSelect = inject(MatAutocomplete, { optional: true });
    private matSelect = inject(MatSelect, { optional: true });
    private formControl = inject(NgControl, { optional: true });

    public ngAfterViewInit(): void {
        if (!this.disableAutoSelectDirective()) {
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
