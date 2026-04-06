import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';
import { WidgetTheme, PublicScriptType, WidgetConfig, PROXY_DOM_ID } from '@proxy/constant';
import { WidgetThemeService } from './otp/service/widget-theme.service';

const REFERENCE_ID = '4512365c177425472369c0fa8351a15';
const THEME: WidgetTheme = WidgetTheme.Dark;
const TYPE: PublicScriptType = PublicScriptType.UserProfile;
const AUTH_TOKEN =
    'dGRjOE0wSlhuNWwyOFRrNzkvMzYyZVBwTnBTQythNmdScXl2VmtGNnZScDdCdXhsSGdBb2hPam5mWkg0RnoyN040cGlQbnJueWhUZEx4TVg4cU0wQ1pQSGdtQjVZVjVYUng2cUU5Q2R2eUl5V2p4aGlBZGEyUlVLM0tnS016ZXdXTnZ6MEJnYU9QRFNHR2pFa29OMmlmT2VqczdEUU5MRzR5MElKMklCK3JUU2w2Qmt0b1V6L0dpclJYTVJBVzk3YjE4L3RtUk15NVk3Z0RmY2g5Rm50QT09';

@Component({
    selector: 'proxy-root',
    imports: [CommonModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    host: { '(window:beforeunload)': 'ngOnDestroy()' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends BaseComponent implements OnInit, OnDestroy {
    private readonly themeService = inject(WidgetThemeService);

    protected readonly showAuthentication: boolean = false;
    protected readonly referenceId: string = REFERENCE_ID;
    protected readonly theme: WidgetTheme = THEME;
    protected readonly authToken: string = AUTH_TOKEN;
    get containerId(): string {
        return this.showAuthentication ? REFERENCE_ID : PROXY_DOM_ID;
    }

    constructor() {
        super();
        effect(() => {
            const resolved = this.themeService.resolvedTheme();
            const themeClass = `${resolved ?? WidgetTheme.System}-theme`;
            document.body.classList.remove('light-theme', 'dark-theme', 'system-theme');
            document.body.classList.add(themeClass);
        });
    }

    ngOnInit(): void {
        this.initOtpProvider();
        // Add class in body 36-blocks-widget
        document.body.classList.add('36-blocks-widget');
    }

    public initOtpProvider(): void {
        if (customElements.get('h-captcha') || (window as any).__proxyWidgetInitialized) {
            return;
        }
        (window as any).__proxyWidgetInitialized = true;

        if (!environment.production) {
            const widgetConfig: WidgetConfig = {
                referenceId: REFERENCE_ID, // Always pass referenceId
                // showCompanyDetails: false,
                // loginRedirectUrl: 'https://www.google.com',
                target: '_self',
                success: (data: unknown) => {
                    console.log('success response', data);
                },
                failure: (error: unknown) => {
                    console.log('failure reason', error);
                },
            };
            if (!this.showAuthentication) {
                if (TYPE) {
                    widgetConfig['type'] = TYPE;
                    if (TYPE === PublicScriptType.Authorization) {
                        // Opens the widget directly in a dialog; used for Block Preview in the admin panel's Design & Code section
                        widgetConfig['isPreview'] = true;
                    } else {
                        widgetConfig['authToken'] = AUTH_TOKEN;

                        if (TYPE === PublicScriptType.UserManagement) {
                            // Enables the Role & Permission tab in the User Management widget
                            widgetConfig['isRolePermission'] = false;
                        }
                    }
                }
            } else {
                // Optional: Path to redirect after login (e.g., '/login') only used get proxy_auth_token in admin panel while preview
                // widgetConfig['redirect_path'] = '/login';
            }
            if (THEME) {
                widgetConfig['theme'] = THEME;
            }
            window.initVerification(widgetConfig);
        }
    }

    ngOnDestroy(): void {
        // Remove class in body 36-blocks-widget
        document.body.classList.remove('36-blocks-widget');
        super.ngOnDestroy();
    }
}
