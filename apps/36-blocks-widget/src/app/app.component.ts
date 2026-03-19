import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';
import { PublicScriptType, SendOtpConfig } from '@proxy/constant';

@Component({
    selector: 'proxy-root',
    imports: [CommonModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    host: { '(window:beforeunload)': 'ngOnDestroy()' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends BaseComponent implements OnInit, OnDestroy {
    protected readonly referenceId = '4512365e1772083784699fda48abd90';
    protected readonly authToken =
        'dERVbGpiRy9WVTliV0M3L2NNYjdSQ21DZDdiVERvZ2xrU3ZSUFJ4T2JIZFBJT2hXZFdqNWRJVzZwemZLV3Q0bnkwSTF3Ui8vaGMrUEMwdjhYSFFYdHdEUnd1c2o0U1VhOXV5SExEV0Q3dEF3VEovRlZLeWRuWkV5ZFl6RDVHcnhlRnhtN2FYRm1jZ2ZhVWZHNGxDSTRDMWIxbXlkMkgyTUgxSS9sQlV0dVRxL01IdUFVTnlPUVE5b3NqczEyZ0dUcXFDenMyY3pGa3JnUHRVQlFWUndVQT09';

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
            const sendOTPConfig: SendOtpConfig = {
                referenceId: this.referenceId,
                authToken: this.authToken,
                type: PublicScriptType.UserManagement,
                showCompanyDetails: false,
                // isHidden: true,
                // theme: 'dark',
                isPreview: true,
                isLogin: true,
                // loginRedirectUrl: 'https://www.google.com',
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
