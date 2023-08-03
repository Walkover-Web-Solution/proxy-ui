import { CommonModule } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, Input, NgModule, OnChanges, SimpleChanges } from '@angular/core';
import { escapeRegExp, isEqual } from 'lodash-es';

@Directive({
    selector: '[proxyHighlight]',
})
export class HighlightDirective implements OnChanges, AfterViewInit {
    /** Color mapping array for showing entries along with color */
    @Input() colorMapping: Array<{ name: string; id?: number; color: string }> = [];

    /** Message instance */
    private message: string;

    constructor(private elementRef: ElementRef) {}

    /**
     * Re-renders the list if input changes
     *
     * @param {SimpleChanges} changes
     * @memberof HighlightDirective
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (
            'colorMapping' in changes &&
            !isEqual(changes.colorMapping.currentValue, changes.colorMapping.previousValue) &&
            this.message
        ) {
            this.renderElements();
        }
    }

    /**
     * Renders the element
     *
     * @memberof HighlightDirective
     */
    ngAfterViewInit(): void {
        this.renderElements();
    }

    /**
     * Function to render the elements
     *
     * @private
     * @memberof HighlightDirective
     */
    private renderElements(): void {
        let message = this.elementRef.nativeElement.innerHTML?.trim() ?? this.message ?? '';
        this.message = message;
        const originalMessage = String(message);
        this.colorMapping.forEach((color) => {
            const colorIndexes = [...originalMessage.matchAll(new RegExp(escapeRegExp(color.name), 'g'))].map(
                (a) => a.index
            );
            colorIndexes.forEach(() => {
                message = message.replaceAll(
                    color.name,
                    `<span class="proxy-highlight-text" style="background-color: ${color.color};">${color.name}</span>`
                );
            });
        });
        this.elementRef.nativeElement.innerHTML = `${message}`;
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [HighlightDirective],
    exports: [HighlightDirective],
})
export class HighlightDirectiveModule {}
