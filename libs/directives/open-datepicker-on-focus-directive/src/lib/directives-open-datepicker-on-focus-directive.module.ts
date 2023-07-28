import { NgxMatDatetimePicker } from '@angular-material-components/datetime-picker';
import { AfterViewInit, Directive, ElementRef, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepicker } from '@angular/material/datepicker';

@Directive({ selector: '[msg91OpenDatepickerOnFocus]', exportAs: 'msg91OpenDatepickerOnFocus' })
export class OpenDatepickerOnFocusDirective implements AfterViewInit {
    @Input() msg91OpenDatepickerOnFocus: MatDatepicker<any> | NgxMatDatetimePicker<any>;
    @Input() restoreFocus = false;

    constructor(private elRef: ElementRef) {}

    ngAfterViewInit(): void {
        this.elRef?.nativeElement?.addEventListener('focus', () => {
            this.msg91OpenDatepickerOnFocus?.open();
            if (!this.restoreFocus) {
                this.elRef?.nativeElement?.blur();
            }
        });
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [OpenDatepickerOnFocusDirective],
    exports: [OpenDatepickerOnFocusDirective],
})
export class DirectivesOpenDatepickerOnFocusDirectiveModule {}
