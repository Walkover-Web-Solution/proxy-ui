import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';

@Component({
    selector: 'proxy-main-left-menu',
    templateUrl: './main-left-menu.component.html',
    styleUrls: ['./main-left-menu.component.scss'],
})
export class MainLeftMenuComponent extends BaseComponent implements OnInit {
    constructor() {
        super();
    }

    ngOnInit(): void {}
}
