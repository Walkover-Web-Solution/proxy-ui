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
                // referenceId: '4512365m176216342869087ae458e09',
                type: 'organization-details',
                // loginRedirectUrl: 'https://www.google.com',
                // showCompanyDetails: false,
                authToken:
                    'ZVlWU2U4cnlOVUh5M1lYcTZLUUVaczZGdFlHN2lKOXNIU24rTWx3WWpnQzE5YXJVaTF0R215UkEvNGpIS2tJVC83Q01EQlk2QWZ6Z1UxYlQvZCtSeThxdDdiUHVuNm9RbVhPNDVnTFFUN3dKZkRIT294a3BvWFFNSGIxUFV6Wk5yZkpmYXk0MzVmUzlrTXp1bkRYTkRUdzBKMW9yRi8vTDgrak9ESzlKblVXU1hvWCtHSytkaW9nemYxTTFwNEVPSThlNk9ZRXd0YTJUanJqRk1sZUdGUT09',
                // type: 'user-management',
                isHidden: true,
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
