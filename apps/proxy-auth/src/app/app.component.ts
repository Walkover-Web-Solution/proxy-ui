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
    public title = 'otp-provider';

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
                referenceId: '4512365e1772083784699fda48abd90',
                type: 'user-management', // 'user-management', 'organization-details'
                // loginRedirectUrl: 'https://www.google.com',
                // showCompanyDetails: false,
                authToken:
                    'VWVJOXVmR0NEcXlmbUJpcjd6M0dnN1YvbEJxcTNSSWp1cFd0U01mQmpZMHdzRW82N0w3QzZid3Y0eFpDNkx6UU1OWEsxNDdMQ0JLb1JSZzV0Y2dBc0ExbWxHaFVGa3FmQnpXcEpRT2ZndGczditFL1hpWXZKdEJha25DcVhxR1hWSFQvQVlZZE1LNThxWk9sTERhMnVwUkVyNWxDdkhUdWF1TDFKc0JiMG91eXhRUndxQjRLclpWL21OVXNxL0RYK0ZiZ005MU1RUlByQmo3aGxGdFpDZz09',
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
