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
                referenceId: '4512365f177271329169a9754b71d4a',
                // type: 'organization-details',
                // loginRedirectUrl: 'https://www.google.com',
                // showCompanyDetails: false,
                authToken:
                    'UCtyL0ZtR3lWUUlqdWxzNC9ZWFpjNmlxdWZ0elBtb3ErUWc4UzJwNCt0TEg2djBGOTJWTENKSGRRbVNFU1pvZk1xU3dRZlZnY3R6T2p3Tlp2ZHRTSVY0WDR1S1ZZQVJzTlk1b1dGbS9Cano0THdOaldMejZqT05WQ3M4eXVVRG1pZ1NJOVB6QVNLYW9GdWlkTGxFczd0WnJuaW11MkpRMDBqZjBqRGQ0NEp6S0pvTG1WcEtPM3RrWVZ2Q2Y4UGlTT3hKaUlnNkplSEhrSGpyRWpGeU1DZz09',
                // type: 'user-management',
                // isHidden: true,
                theme: 'dark',
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
