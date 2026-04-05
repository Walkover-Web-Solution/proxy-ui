import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';
import { WidgetTheme, PublicScriptType, WidgetConfig, PROXY_DOM_ID } from '@proxy/constant';
import { WidgetThemeService } from './otp/service/widget-theme.service';

const REFERENCE_ID = '4512365c177425472369c0fa8351a15';
const THEME: WidgetTheme = WidgetTheme.Dark;
const TYPE: PublicScriptType = PublicScriptType.OrganizationDetails;
const AUTH_TOKEN =
    'aklLUzlaSHhIMWFWYy9DM3RlcEtlUkJwNmNxb3pDK1ZuK0FBdlpNaGcybTNkeGY5TzVTNTV4Sk1JVUJSV0tja1BGQXgwSm12Y0JaMEkvNjIrZU95a1A1a3ZFQ1hwYnhXN21lbUg0OWhOVTh1TmxXMFkwaFRpeTJLa1pITjE1NHAzamJvNTFIaGxQaUFGRXFqdVpnMFgySVZZekJ1SzJVV3o1bmhSdFFjR2tHOWNNMFJ2ZGdDY25XWUdEeVZEYWZoRmpjWlJNaDZsZk9lSWhXWm9QRWxMZz09';

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
