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
                // referenceId: '4512365h176132430068fbad0ce6e37',
                // loginRedirectUrl: 'https://www.google.com',
                // showCompanyDetails: false,
                authToken:
                    'U2lGTC96c2FVSGVESzRxUUxCY3FjMlZRZkM5UDFpY1hmVHh2amo3ak5HVHlaOW1MOHJuclE4dGdST1pCMVAzMjZud0NtcVFxbGFxUTNvRjdWQW1iZ21RdjhidXhwcHZINlJJNTMyRWNZUGJXaHVLTEQ3WU9SVWtQeHdycTJOZkh4OTRzWlpReUZTS1FjZHIxK3pLRjhONEtaYkpwRVZ1aW4zKzNKTmlmUHdGdk80eXp6Y3hxd0s2TXQzSVdTbitGOTFsTnZXNnRCZWVtaDJ0Skd2SVpIdz09',
                type: 'user-management',
                // isPreview: true,
                isLogin: true,
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
