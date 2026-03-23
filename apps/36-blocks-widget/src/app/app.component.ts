import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';
import { WidgetTheme, PublicScriptType, WidgetConfig } from '@proxy/constant';

@Component({
    selector: 'proxy-root',
    imports: [CommonModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    host: { '(window:beforeunload)': 'ngOnDestroy()' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends BaseComponent implements OnInit, OnDestroy {
    protected readonly referenceId = '4512365c177425472369c0fa8351a15';
    protected theme: WidgetTheme = WidgetTheme.Light;
    protected readonly WidgetTheme = WidgetTheme;
    protected readonly authToken =
        'VktWbDJjc3dYdUNjQXdVREQyL0N0dFMyRkZhNFYzbW9GcTE4dlFmSGp2VlF4djZSUGcwb2VPa0tqRFlYUCtaOFh4dW9KWVJUMHVMRTk4bWlaQzF2d290NDRlempQb0hSM1NkM0VNdGp1ZlFFS1kwV3FnSk9RWDIvelJEMFVRZ2plcTBGUnFyNWRRRHZsOCtacGpyczBUTkVWUzBFZURNcHlPa2o1d3dTa1R5QS9yWFo4blZHOWs2eFF5NG9UTkNnUUZZNUppVktDZ3FWbjZ0U01tMFVpUT09';

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
        if (customElements.get('h-captcha') || (window as any).__proxyWidgetInitialized) {
            return;
        }
        (window as any).__proxyWidgetInitialized = true;
        if (!environment.production) {
            const widgetConfig: WidgetConfig = {
                referenceId: this.referenceId,
                // authToken: this.authToken,
                // type: PublicScriptType.UserProfile,
                // showCompanyDetails: false,
                // isHidden: true,
                // isRolePermission: false,
                // theme: this.theme,
                // isPreview: true,
                // loginRedirectUrl: 'https://www.google.com',
                target: '_self',
                success: (data) => {
                    console.log('success response', data);
                },
                failure: (error) => {
                    console.log('failure reason', error);
                },
            };
            window.initVerification(widgetConfig);
        }
    }
}
