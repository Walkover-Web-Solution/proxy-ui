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
                    'SVBTeUZkcmJ6aDlJdTh1QjMxLzFuRXZoOGo1OXJ1QndhWXFOM3cyUnFSdDdIRDV3M3FTNER6QlVlMlE0ZnhVVzAzZDJmeUFRWUprc2lzNnhDN1JTdVRwdHRxTkttOUhWdDlNUzBNZUpYalBPOGxjazcyaEUwb1dhZ1ZTK0wrRGlNZG9iN0h6VXdOVDdhbkc2TUVwWWpTT1prai9SY0FYM0ZuWThrL3BkZjFsbGU1YWN3Y21kWFlweE9JV0laVEhmTWdGa0hJanNRcml0UGtIbVlOeE5qZz09',
                pass: '123456',
                type: 'user-management',
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
