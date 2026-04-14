import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';
import { WidgetTheme, PublicScriptType, WidgetConfig, PROXY_DOM_ID } from '@proxy/constant';
import { WidgetThemeService } from './otp/service/widget-theme.service';

const REFERENCE_ID = '4512365o177529298869d0d23cc0453';
const THEME: WidgetTheme = WidgetTheme.System;
const TYPE: PublicScriptType = PublicScriptType.UserProfile;
const AUTH_TOKEN =
    'ZDZCVkV3SjltT0s4S0lxMWc2cnFVZ0lDU2hhVXRvdG1jckx4VHdrZXg2bXZ1dmVjb2FoSzY1VzJYK0J1eXAyZEQ3M2VzclBWckFVQ1ozbFZ3bWU3NE5GekpMOVRwSU92Ylp2SFYzaVRzQ1J0VXM0T3pEY3JyMUNPVG14TGF3cHVKQ2lHd0NPc1BzOEplcm15NEZEckJTN2tFakdVNmF2WTBNL2l4VjdrSnk1azJLTnZtVEhDa3Q1QzkvczlQalpzVEJsNCt1TlBSSWEvbzFqand0Y2pwZz09';

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

    protected readonly referenceId: string = REFERENCE_ID;
    protected readonly theme: WidgetTheme = THEME;
    protected readonly authToken: string = AUTH_TOKEN;
    get containerId(): string {
        return TYPE === PublicScriptType.Authorization ? REFERENCE_ID : PROXY_DOM_ID;
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
        document.body.classList.add('blocks-widget');
    }

    public initOtpProvider(): void {
        if (customElements.get('h-captcha') || (window as any).__proxyWidgetInitialized) {
            return;
        }
        (window as any).__proxyWidgetInitialized = true;

        if (!environment.production) {
            const widgetConfig: WidgetConfig = {
                referenceId: REFERENCE_ID, // Always pass referenceId
                target: '_self', // '_blank' | '_self'
                success: (data: unknown) => {
                    console.log('Success response:', data);
                },
                failure: (error: unknown) => {
                    console.log('Failure reason:', error);
                },
            };
            if (TYPE) {
                widgetConfig['type'] = TYPE;

                if (TYPE === PublicScriptType.Authorization) {
                    // Optional: Path to redirect after login (e.g., '/login') only used get proxy_auth_token in admin panel while preview
                    // widgetConfig['redirect_path'] = '/login';
                    // Used to show Company details in the signup/registration form, default is true
                    // showCompanyDetails: false,
                } else {
                    widgetConfig['authToken'] = AUTH_TOKEN;

                    if (TYPE === PublicScriptType.UserManagement) {
                        // Enables the Role & Permission tab in the User Management widget
                        widgetConfig['isRolePermission'] = false;
                    }

                    // Note: Currently Subscription widget is not in use.
                    if (TYPE === PublicScriptType.Subscription) {
                        // Use in Subscription widget to redirect
                        // loginRedirectUrl: 'https://www.google.com',
                        // widgetConfig['isPreview'] = true;
                    }
                }
            }
            if (THEME) {
                widgetConfig['theme'] = THEME;
            }
            // console.info('Widget Config:', widgetConfig);
            window.initVerification(widgetConfig);
        }
    }

    ngOnDestroy(): void {
        // Remove class in body 36-blocks-widget
        document.body.classList.remove('blocks-widget');
        super.ngOnDestroy();
    }
}
