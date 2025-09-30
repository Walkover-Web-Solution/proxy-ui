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
                    'cGplTURaeXgxV0JqdkRKV0ZuenhhNnBIMUk5Slg4OWxiVUtnV1EwOWs2RG45K2hvZTJuQWp5MHBIV043SEk2a0syd1k4VFYyME1jNGdGYjZuLzdlOTFQRmZlRDB5L3NGRHRrV3RUdUdhbzRRenQ1dmxvQU55R0RmVUdhVHJjOHZlcVRiKzZ4Qk1kcHA5RktvYk1JSlh1UFNvd2t6UTJVcnYvZStCWnh5VzhxTkFiMkNFRXBIajg2ZVNIcEVHUFp2OEFjczdBcitvQzZPRUl4WXN2Snc4UT09',
                pass: '123456',
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
