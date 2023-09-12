import { CommonModule } from '@angular/common';
import {
    Directive,
    EventEmitter,
    HostListener,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    Self,
    TemplateRef,
} from '@angular/core';
import { ControlContainer, FormGroup, FormGroupDirective } from '@angular/forms';

@Directive({
    selector: '[proxyMarkAllAsTouched]',
})
export class MarkAllAsTouchedDirective implements OnInit, OnDestroy {
    /** Button reference to handle custom form submit where submit event is not listened */
    @Input() buttonRef: TemplateRef<any>;
    /** Emits when the form is valid */
    @Output() valid: EventEmitter<void> = new EventEmitter();

    /** Listener instance to unsubscribe for memory optimization */
    private unsubscribeListener;

    constructor(
        @Self() private container: ControlContainer,
        @Self() private formGroupDirective: FormGroupDirective,
        private renderer: Renderer2
    ) {}

    @HostListener('submit')
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
        if (this.buttonRef?.['_elementRef']?.nativeElement) {
            if (this.unsubscribeListener) {
                this.unsubscribeListener();
            }
            this.unsubscribeListener = this.renderer.listen(
                this.buttonRef?.['_elementRef']?.nativeElement,
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

@NgModule({
    imports: [CommonModule],
    declarations: [MarkAllAsTouchedDirective],
    exports: [MarkAllAsTouchedDirective],
})
export class DirectivesMarkAllAsTouchedModule {}
