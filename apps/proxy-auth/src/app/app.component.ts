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
                    'NE5VTmNRbFlwWlhqQ2hJNnNlY3p5QXlsRDByc09ibVFLTUhrTSs5Qm5iS0l0Mjh1cDRQVTM3OFBSWUE4ZTdCQ3NmZm01RW44WEdtbWltU2ZEZUs4Q2FvYndSSmRlU1FacVVsNUFQd1NOYzJUTXV0NURvT1lGSTg2R2tLbmJOdXZLT3RyOTFjaUpWRE12Q3h1dm9CdUpoRURMZ3YzMzFDWHk5aXpwRmhvRTQ4Q0o4ejI5YlpkMnpEMlo2Z3RCS2NSOVFyZ2hkMzVRWlZEeUVMbnR2elFUdz09',
                type: 'user-management',
                theme: 'fark',
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
