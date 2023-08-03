import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'proxy-custom-tooltip',
    templateUrl: './custom-tooltip.component.html',
    styleUrls: ['./custom-tooltip.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('tooltip', [
            transition(':enter', [style({ opacity: 0 }), animate(30, style({ opacity: 1 }))]),
            transition(':leave', [animate(300, style({ opacity: 0 }))]),
        ]),
    ],
})
export class CustomTooltipComponent {
    /** Key value pair to be shown in tooltip */
    @Input() toolTipValue: [];
    /** True, if close button needs to be shown on tooltip */
    @Input() showCloseButton: boolean = false;
    /** Emits when the user clicks the close button */
    @Output() public closeTooltip: EventEmitter<void> = new EventEmitter();
    /** Type of toolTipValue must be one of object(because array are just regular object) or string */
    @Input() toolTipValueType = 'object';

    constructor() {}
}
