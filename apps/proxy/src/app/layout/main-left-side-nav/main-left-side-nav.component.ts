import { Component } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    selector: 'proxy-main-left-side-nav',
    templateUrl: './main-left-side-nav.component.html',
    styleUrls: ['./main-left-side-nav.component.scss'],
})
export class MainLeftSideNavComponent extends BaseComponent {
    constructor() {
        super();
    }
}
