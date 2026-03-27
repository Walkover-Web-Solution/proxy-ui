import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';
import { WidgetTheme, PublicScriptType, WidgetConfig } from '@proxy/constant';
import { WidgetThemeService } from './otp/service/widget-theme.service';

const REFERENCE_ID = '4512365c177425472369c0fa8351a15';
const THEME: WidgetTheme = WidgetTheme.System;
const TYPE: PublicScriptType = PublicScriptType.OrganizationDetails;
const AUTH_TOKEN =
    'a1hZNmtkYWJRUStXV25MdVpkeVN1YTZ1QlhDajNMdjdkZklMaEpLa1plMktUTVRZZklxRnV2SkZkVTJNQ1NDQWVUdlFpY3hUSHM0SHBpbCtjcVZxMmgzVHJNbnQ1K0d2NU1Ra1BrSTk0V0NWa1lVbEw1em5XbFVGL3VLSCsrb2JnalhObnlyN2pmNnFwdlgzeDQyRHVhSGFEZkY1eU55TDNSTElqaGo4UW5kb3o3WVU4Z3AyNzdlK0YwSlJ3S09kb1pPZXJhY1k5Q01JeWY1UkZkVk9yQT09';

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

    get isDarkTheme(): boolean {
        return this.themeService.isDark(THEME);
    }
    public readonly referenceId: string = REFERENCE_ID;
    public readonly theme: WidgetTheme = THEME;
    public readonly authToken: string = AUTH_TOKEN;

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.initOtpProvider();

        console.log('Widget initialized', this.themeService.isDark());
    }

    public initOtpProvider(): void {
        if (customElements.get('h-captcha') || (window as any).__proxyWidgetInitialized) {
            return;
        }
        (window as any).__proxyWidgetInitialized = true;

        if (!environment.production) {
            const widgetConfig: WidgetConfig = {
                // referenceId: REFERENCE_ID,
                authToken: AUTH_TOKEN,
                type: TYPE,
                showCompanyDetails: false,
                // isHidden: true,
                // isRolePermission: false,
                theme: THEME,
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

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
