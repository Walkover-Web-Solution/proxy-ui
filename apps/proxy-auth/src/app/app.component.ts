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
                    'ajhQa1MvVHRKMHlRUUVEcDhXNVMyNk5TZlBGWlVEaG1mNWV2ME9JZ0czdEdlLzNvZ1RUdThjY0Z3RW8yTmIyS3BiZVJNUVBhRVJCSGRkL3Y1SGw2dVBWZzdORlFRQTJpc2ZvZlh2VGY5VzlIRE9TZ0lzYnJsU1dMaU1pUE1VdEdSY0RPNnZhVFVHT05VY04vQnhJKzJqYm1veVZuczh3VTk0aGNka1ZtN1pJPQ==',
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
