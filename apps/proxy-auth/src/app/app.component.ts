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
                referenceId: '4512365m176216342869087ae458e09',
                type: 'authorization',
                // loginRedirectUrl: 'https://www.google.com',
                // showCompanyDetails: false,
                authToken:
                    'clV0YUt4UURVbzJYZTRwMHdBNkZ6QjZoay9qMmRRcjZhMGVXMGtCT1ZtdGNaelFxMmlNaGdNcEJuRy9UWmFSZHQvMHc0YnJYUHExakh5NDNGVjZMOEdXVmg3OG82R094Yk5tdE9XckxjUTV1dlNzUERXRWxaOWIwWm5JRmlMVHl5UmpZUHVDK2piOURJUi9IdytncFZBRWc5QnRyRDRVeUFOZlBCY1FST0FOZStISUVtK055VWNxaGduZWpGeUZxVWxYWjd6YXI2YTF0aGxHZTNka1BlQT09',
                // type: 'user-management',
                isHidden: true,
                theme: 'light',
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
