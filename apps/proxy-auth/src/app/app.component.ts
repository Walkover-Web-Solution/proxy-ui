import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    selector: 'proxy-root',
    imports: [CommonModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    host: { '(window:beforeunload)': 'ngOnDestroy()' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends BaseComponent implements OnInit, OnDestroy {
    public title = 'Public Scripts';

    constructor() {
        super();
    }

    ngOnInit() {
        this.initOtpProvider();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public initOtpProvider() {
        if (customElements.get('h-captcha')) {
            return;
        }
        if (!environment.production) {
            const sendOTPConfig = {
                // referenceId: '4512365e1772083784699fda48abd90',
                type: 'organization-details', // 'user-management', 'organization-details'
                // loginRedirectUrl: 'https://www.google.com',
                // showCompanyDetails: false,
                authToken:
                    'dERVbGpiRy9WVTliV0M3L2NNYjdSQ21DZDdiVERvZ2xrU3ZSUFJ4T2JIZFBJT2hXZFdqNWRJVzZwemZLV3Q0bnkwSTF3Ui8vaGMrUEMwdjhYSFFYdHdEUnd1c2o0U1VhOXV5SExEV0Q3dEF3VEovRlZLeWRuWkV5ZFl6RDVHcnhlRnhtN2FYRm1jZ2ZhVWZHNGxDSTRDMWIxbXlkMkgyTUgxSS9sQlV0dVRxL01IdUFVTnlPUVE5b3NqczEyZ0dUcXFDenMyY3pGa3JnUHRVQlFWUndVQT09',
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
