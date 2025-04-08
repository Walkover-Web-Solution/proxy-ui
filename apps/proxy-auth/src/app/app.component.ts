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
                    'ak9pZ3FHeVNhd2tBZzdLenc5UkFyaVV5Rk1DWU1kd3ZFeHJsVEJJSUxrTTJxT1hqNmorbVU4dU9HSGpsdW9wZm01R2E2UTM0VzNYb3QvZ1VEaFZwNGRkY3lCeU9xSGdUUGFlVDRXdStRT3BJR2JudFcrRVdiRGFoTFloRVdSTHlBQ0lXM2piNlZnY3JXOEFkSGcrWG9EM0NDcDNoTVN6SjNmZllvV1AyUXJjPQ==',
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
