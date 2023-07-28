import { Component, Input } from '@angular/core';

@Component({
    selector: 'msg91-no-permission',
    templateUrl: './no-permission.component.html',
    styleUrls: ['./no-permission.component.scss'],
})
export class NoPermissionComponent {
    @Input() additionalMsg: string = null;
}
