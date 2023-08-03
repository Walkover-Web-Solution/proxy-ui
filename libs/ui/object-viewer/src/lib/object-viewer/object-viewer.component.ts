import { Component, Input, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
    selector: 'proxy-object-viewer',
    templateUrl: './object-viewer.component.html',
    styleUrls: ['./object-viewer.component.scss'],
})
export class ObjectViewerComponent {
    /** reference of mat menu */
    @ViewChild('trigger') trigger: MatMenuTrigger;
    /** Data to show. */
    @Input() data: Object;
    /** class to add on icon button */
    @Input() buttonClass: string = 'mat-icon-button';
    /** Object key color.  */
    @Input() classesForKey: string = 'obj-key-color';
    /** Object value color. */
    @Input() classesForValue: string = 'obj-value-color';
}
