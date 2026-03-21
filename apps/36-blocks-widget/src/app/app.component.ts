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
    protected readonly referenceId = '4512365e1772083784699fda48abd90';
    protected readonly authToken =
        'elpmRGYrZFh6TlRwbWJtU2psYU1nUUFta0hEN2FPZ3JUemVzTkphOVMvZjhLT2RCTUswR3AvN01nb3dsaHpRUmlNM1o3YTNpc3N0dTF1akdET2lhVG9MTEgvRVdUOWhDTElzMlhCajRZUnIyYTZiZ01yOUNxWWZ3TmpEZ0xxMGFwbTk0WEtXVnd3cXVSUmZkdEl4ekJIWWFkamt4RGdmL3Jza05STG5DMk8vRURKTkhITEdiM0NGdnJPcjZBNGNUWUhCZDZmaVVoaXUxc3JBRW5OQUhjZz09';

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
                authToken: this.authToken,
                type: PublicScriptType.UserManagement,
                // showCompanyDetails: false,
                // isHidden: true,
                isRolePermission: true,
                theme: PublicScriptTheme.System,
                // isPreview: true,
                // isLogin: true,
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
