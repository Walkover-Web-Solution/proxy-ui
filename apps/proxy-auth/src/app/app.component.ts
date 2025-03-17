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
                authToken:
                    'ZlRVek91eHhINmtibG5DV1pFMmxlSGY5dmhqVlAyQmc5TFBYU0xLNWQrWFdISk1aTjM1b0JmVjBFSjlBY0NsVk8vMWhhNVJRU3NaaXRzdUh2STcxdjc4cXhxSTNoVHBLNDd3SkJFUktpODVKcEpXQXdOa2lWM3hJbjNGQ2VjU3NzTkh0WUJhNXhnam9pYjZ6enIwaUdtalVxWitZemRHVW8zRE5lUytnUWpzPQ==',
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
