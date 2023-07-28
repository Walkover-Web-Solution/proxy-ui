import { Component, Input } from '@angular/core';

@Component({
    selector: 'msg91-no-record-found',
    templateUrl: './no-record-found.component.html',
    styleUrls: ['./no-record-found.component.scss'],
})
export class NoRecordFoundComponent {
    @Input() showBtn: boolean = false;
    @Input() title: string;
}
