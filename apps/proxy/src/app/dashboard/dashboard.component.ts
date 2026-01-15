import { Component } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    selector: 'proxy-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends BaseComponent {
    constructor() {
        super();
    }
}
