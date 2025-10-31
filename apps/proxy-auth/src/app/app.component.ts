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
                    'SWs4ZUplMzJyL1duSkpzM25zMHpzSHlTOG9KRWs4RndIOC9uMHJhWUcxZEZrMDhwSGpYZnF5WjR0Y1Z5ZWN1cnFLVFIvVis2TmJVQVVMdUNQVWM2VlRpSktqTHZwRHEzRUdOTGJTWkhYaGxERVVYbWYvMHFPZEwyMlVKa0FSM1RXOWlJWWNwWE9xblRuM09kaXJrL2pVVnkrVjZDM0tCNzZuYnRBNldFcUZXOUpxYXN4cjEzSlFKSlZNUzVmbk5PSzFkeWxKY2l4d1gwbEZWbzR4UGxUQT09',
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
