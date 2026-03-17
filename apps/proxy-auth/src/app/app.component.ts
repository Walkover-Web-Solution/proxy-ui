import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    standalone: false,
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
                // referenceId: '4512365m176216342869087ae458e09',
                // type: 'organization-details',
                // loginRedirectUrl: 'https://www.google.com',
                // showCompanyDetails: false,
                authToken:
                    'ZGlYV0Z4ekRleUQwZEhXR2JvRllKaWh6cmhhb2hhTnhTMGdDdHlpa2ZaOU9LcGh5M3puLzZ6QTVRb3pGdGNPU0xlSC9SQjI3ckNweWk5cWg1aytpOVRTVmtUWXFRQW5rWEZ0c21KeEN6c0FmK1d5bWQxUk9lZHM4anlHSDI5Q3dxL0o3V0h6Yk9kMDBSVE5pc1FPekJkQVg3QXZ4K2xFbUViUGdhQ0Z6d3hGNXQreEN2dytUQW9GOEdseFFBU3FaNXYzbFVUalJDRitqc0EvQVduQUkrUT09',
                // type: 'user-management',
                // isHidden: true,
                // theme: 'dark',
                // isPreview: true,
                // isLogin: true,
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
