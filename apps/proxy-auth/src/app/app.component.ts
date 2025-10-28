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
                referenceId: '4512365h176132430068fbad0ce6e37',
                loginRedirectUrl: 'https://www.google.com',
                showCompanyDetails: false,
                authToken:
                    'L3YzZzZtN2hCdVUvUzg4cHVMUzlYdHlGZ2lVUlVSZ3FzK0x1RldqMk1sd2x3ZUZpWk1BTGhnemZZNDdmamZldUQzNkMzaHFTNXUzYXBXa2xsWVZQbmlSSnJmR0lJSUlMbE1kQ0daalZJaGRNNVc1YzI1d2F4YUMrVTE0bHBrN2gycUNuU2w0U1hSb1ZFNmpFRXBNTUpNZVlXbllwYzQ4MzQ0MmxHcU84UnJPRHpWd3RQSXhhaldyZUYvOVg5UU5lcDNkdHV2b3JHTmVMZkkyUjF4MStFZz09',
                type: 'subscription',
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
