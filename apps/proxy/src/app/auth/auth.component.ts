import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';

@Component({
    selector: 'proxy-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
})
export class AuthComponent extends BaseComponent implements OnInit {
    constructor() {
        super();
    }

    ngOnInit(): void {}
}
