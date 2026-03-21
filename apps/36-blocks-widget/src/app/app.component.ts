import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';
import { PublicScriptTheme, PublicScriptType, WidgetConfig } from '@proxy/constant';

@Component({
    selector: 'proxy-root',
    imports: [CommonModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    host: { '(window:beforeunload)': 'ngOnDestroy()' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends BaseComponent implements OnInit, OnDestroy {
    protected readonly referenceId = '4512365e177401652469bd580c9ad74';
    protected theme: PublicScriptTheme = PublicScriptTheme.Dark;
    protected readonly PublicScriptTheme = PublicScriptTheme;
    protected readonly authToken =
        'OVo5MStRSTN3NmFWL2sxSW9OYWR3WG1yUjN5VCt4OGd6N0dhSFdVdTlYcDQxV2gxdXVPa1RRSmkxN2czcEw2UjdDdSt5a1dJaXRLRlVMSWM1Uk9TS3FGUVB3eVQvTm91aUFrMWQvUHJXSVFnUDlFNy92R1ZzNjBkdTFwWWYzK3dTalNpdHF3MlZIbmVSUW9WWkdMVi80bGIydzBHMnB2NHloUDd0eE1RQzJJenMwK1JQaFpoVDZPT3JERktocWd4bU52WVdLNGVaeFZPbVBpdnhCZWYyQT09';

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
                type: PublicScriptType.Authorization,
                // showCompanyDetails: false,
                // isHidden: true,
                isRolePermission: false,
                theme: this.theme,
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
