import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';
import { WidgetTheme, PublicScriptType, WidgetConfig } from '@proxy/constant';
import { WidgetThemeService } from './otp/service/widget-theme.service';

const showAuth = false;
const REFERENCE_ID = showAuth ? '4512365c177425472369c0fa8351a15' : '';
const THEME: WidgetTheme = WidgetTheme.System;
const TYPE: PublicScriptType = PublicScriptType.UserManagement;
const AUTH_TOKEN =
    'Sm5jL093OWNxRGpibHo1M05MTWxDbVZZcEVaU0hQc1UrcExWT1BqcTJSOFNyMEFTSzgwWUlxREczSFE5cnNmQTZScW5qdzdrUDZrZFltVWxJYnlaWE5DMklZN1Zoc1BhdFBHNlVwdC9tUURpdVJNdVNaSWNudld5dFBnYW5MdExpN1hhSlYzRG5UbHdsSTcwcTBuL0xHV1VZSjBFMWV6aVF2WldhQnBseHRab2d5ZlExM2prUnJMWGZHV1FFYUttNlhiYzNZR1F0Nm91NW5zc29JbHJCUT09';

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
                // showCompanyDetails: false,
                // isHidden: true,
                // isRolePermission: false,
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
            if (REFERENCE_ID) {
                widgetConfig['referenceId'] = REFERENCE_ID;
            } else if (AUTH_TOKEN) {
                widgetConfig['authToken'] = AUTH_TOKEN;
                if (TYPE) {
                    widgetConfig['type'] = TYPE;
                }
            }
            if (THEME) {
                widgetConfig['theme'] = THEME;
            }
            window.initVerification(widgetConfig);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
