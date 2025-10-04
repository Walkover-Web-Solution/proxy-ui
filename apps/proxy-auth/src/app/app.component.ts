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
                    'bjJRWDFhQUpsSnFCa3VPalAwdzdraW9ZV1M2ajNLamFVRzVzY2hKTHZJSjhDWmpRL1UzR2UreE90Ri85cGVCZ3c5ZVU0RFBMVi9aZWlsMDQwT29DUGNFekY4bUVmVWxyb2g2enVIWEVSOHhodmhQVzBCMCttZVRZWTBIV3BLMXBiUll0VXd1emt2SlpHT2hoSU1OZEhqbit3QkUvQ29CcVJlQjRxcC9TbzhCK1E3VjhhQ1BCU2VOTWlDQnIwVHFwYyt3UmdqM0kvd1AxTWl2c2FDMitZQT09',
                type: 'user-management',
                pass: '123456',
                isPreview: false,
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
