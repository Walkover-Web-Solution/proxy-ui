import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Input, NgModule, OnInit } from '@angular/core';

@Directive({ selector: '[proxyAutofocus]' })
export class AutoFocusDirective implements OnInit {
    private host: HTMLElement;
    private focused: Element;
    private autoFocus = true;

    @Input()
    set autofocus(value: boolean) {
        this.autoFocus = coerceBooleanProperty(value);
    }

    constructor(private elRef: ElementRef, @Inject(DOCUMENT) private document: HTMLDocument) {
        this.host = elRef.nativeElement;
        this.focused = document.activeElement;
    }

    ngOnInit(): void {
        if (this.autoFocus && this.host && this.host !== this.focused) {
            setTimeout(() => this.host.focus());
        }
    }
}

@NgModule({
    imports: [],
    declarations: [AutoFocusDirective],
    exports: [AutoFocusDirective],
})
export class DirectivesAutoFocusDirectiveModule {}
