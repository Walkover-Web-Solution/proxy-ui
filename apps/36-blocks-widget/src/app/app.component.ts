import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';
import { WidgetTheme, PublicScriptType, WidgetConfig, PROXY_DOM_ID } from '@proxy/constant';
import { WidgetThemeService } from './otp/service/widget-theme.service';

const REFERENCE_ID = '4512365c177425472369c0fa8351a15';
const THEME: WidgetTheme = WidgetTheme.System;
const TYPE: PublicScriptType = PublicScriptType.Authorization;
const AUTH_TOKEN =
    'ZHN5YlVZcjRDR3U5NjNGSk5rVGFRejI0MEdCZWg3RWpUK0xVYzlvajJFMlM4a2F4NUpxaWJjcnJkVzZSeW5RMStZaWJaV1JYandHOXpsTlBVZXBnNUZWbzl5MFJHU0xyNEtMWUkxVjRSS0RiRXBOcER4czlxakJUdThLNUhnOFJGOHV3bXBHclAwN241d3dDM0JmZE9JMlhzNHZHaVZ6cGdvTkdIenJzbnNiMHFGNmhVMUpQbkZPUWRWOVFGcTRPQ2NBU1plM0lKUUFPTmI0cUVSUEJTdz09';

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

    protected readonly showAuthentication: boolean = true;
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
                // isHidden: true,
                // loginRedirectUrl: 'https://www.google.com',
                target: '_self',
                success: (data) => {
                    console.log('success response', data);
                },
                failure: (error) => {
                    console.log('failure reason', error);
                },
            };
            if (!this.showAuthentication) {
                if (TYPE) {
                    widgetConfig['type'] = TYPE;
                    if (TYPE === PublicScriptType.Authorization) {
                        widgetConfig['isPreview'] = true;
                    } else {
                        widgetConfig['authToken'] = AUTH_TOKEN;

                        if (TYPE === PublicScriptType.UserManagement) {
                            // True If you want show Role and Permission tab
                            widgetConfig['isRolePermission'] = true;
                        }
                    }
                }
            }
            if (THEME) {
                widgetConfig['theme'] = THEME;
            }
            console.log('widgetConfig', widgetConfig);
            window.initVerification(widgetConfig);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
