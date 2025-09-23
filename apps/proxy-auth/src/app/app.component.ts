import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    selector: 'proxy-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent extends BaseComponent implements OnInit, OnDestroy {
    public title = 'otp-provider';

    constructor() {
        super();
    }

    ngOnInit() {
        this.initOtpProvider();
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public initOtpProvider() {
        if (!environment.production) {
            const sendOTPConfig = {
                userToken:
                    'SEFVbXNhWnEzQSttZFhNaWpxYVIrWFlETWk4djk0clV6NUJwNzBtYmZVM0xPYXFBL2ZQaXJtU2hxZVNBd054TWJMOFJpWFA3UkZRbzgyeVVNY1dYMmRiNXc4aVhlUU1YSkVEaDZxeFhiaXh5bXMwYlZZRE9VVTVtTTU5cGRzSmQ5NVdFM3VFS3ZDMXFwbHQrbGozSDlhRU9CcUptcnllZUtWYzVqclhHbGw0PQ==',
                target: '_self',
                success: (data) => {
                    console.log('success response', data);
                },
                failure: (error) => {
                    console.log('failure reason', error);
                },
            };
            window.initVerification(sendOTPConfig);
        }
    }
}
