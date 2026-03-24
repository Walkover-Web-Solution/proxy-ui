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
    protected theme: WidgetTheme = WidgetTheme.System;
    protected readonly WidgetTheme = WidgetTheme;
    protected readonly authToken =
        'YmNmTDJYYnBZdUZtQk5SQUc5ZHc5dE1UMHBkeFRuWjI1emVJNzhRaXYvc0UrVmFOTDFzQk9oa0V3bXdxU3N4MDRtZlBoRVI4Y1JJVGJkREM4NktpRGJBUVJ0RXJ6MGVaKy9jbUd2QnArZnQyVnQvd3dKMFlEcDVIaFFpK2h1WnVneXpaSDhodWFpNUFheUk5L3pWcmdGTG5qR3MrZkx1RDIwV2J2RGYybGkvNDgzeTJPbDB0cllXM2JzUEZDbm5VN1FkVXlZbTB6b1A4NDFVd0M3YXNqZz09';

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
