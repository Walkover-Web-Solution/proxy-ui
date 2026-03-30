import { Directive, OnDestroy, OnInit, Renderer2, TemplateRef, inject, input, output } from '@angular/core';
import { ControlContainer, FormGroup, FormGroupDirective } from '@angular/forms';

@Directive({
    selector: '[proxyMarkAllAsTouched]',
    host: {
        '(submit)': 'markAllAsTouched()',
    },
})
export class MarkAllAsTouchedDirective implements OnInit, OnDestroy {
    /** Button reference to handle custom form submit where submit event is not listened */
    buttonRef = input<TemplateRef<any>>();
    /** Emits when the form is valid */
    valid = output<void>();

    /** Listener instance to unsubscribe for memory optimization */
    private unsubscribeListener;
    private container = inject(ControlContainer, { self: true });
    private formGroupDirective = inject(FormGroupDirective, { self: true });
    private renderer = inject(Renderer2);

    markAllAsTouched(): void {
        if (this.container) {
            this.container.control.markAllAsTouched();
        }
        if (this.formGroupDirective) {
            this.recursivelyMarkAsTouched(this.formGroupDirective.control);
        }
    }

    /**
     * Initializes the directive
     *
     * @memberof MarkAllAsTouchedDirective
     */
    public ngOnInit(): void {
        if (this.buttonRef()?.['_elementRef']?.nativeElement) {
            if (this.unsubscribeListener) {
                this.unsubscribeListener();
            }
            this.unsubscribeListener = this.renderer.listen(
                this.buttonRef()?.['_elementRef']?.nativeElement,
                'click',
                (event) => {
                    this.markAllAsTouched();
                    if (this.container.invalid) {
                        event.stopPropagation();
                        event.preventDefault();
                    } else {
                        this.valid.emit();
                    }
                }
            );
        }
    }

    /**
     * Unsubscribes to all the listeners
     *
     * @memberof MarkAllAsTouchedDirective
     */
    public ngOnDestroy(): void {
        if (this.unsubscribeListener) {
            this.unsubscribeListener();
        }
    }

    /**
     * Recursively mark as touched
     *
     * @private
     * @param {FormGroup} formGroup FormGroup instance
     * @memberof MarkAllAsTouchedDirective
     */
    private recursivelyMarkAsTouched(formGroup: FormGroup): void {
        Object.values(formGroup.controls).forEach((control: any) => {
            control.markAllAsTouched();
            if (control.controls) {
                this.recursivelyMarkAsTouched(control);
            }
        });
    }
}
