import { ApplicationRef, DoBootstrap, Injector, NgModule, inject } from '@angular/core';
import { createCustomElement, NgElement, WithProperties } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProxyAuthWidgetComponent } from './otp/widget/widget.component';
import { omit } from 'lodash-es';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule } from '@angular/common/http';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { reducers } from './otp/store/app.state';
import { OtpEffects } from './otp/store/effects';
import { OtpService } from './otp/service/otp.service';
import { OtpUtilityService } from './otp/service/otp-utility.service';
import { OtpWidgetService } from './otp/service/otp-widget.service';
import { WidgetThemeService } from './otp/service/widget-theme.service';
import { ProxyBaseUrls } from '@proxy/models/root-models';
import { environment } from '../environments/environment';
import { OverlayContainer } from '@angular/cdk/overlay';
// import { ShadowDomOverlayContainer } from './shadow-dom-overlay-container';

export const RESERVED_KEYS = ['referenceId', 'target', 'style', 'success', 'failure'];

declare global {
    interface Window {
        initVerification: any;
        intlTelInput: any;
        showUserManagement: any;
        hideUserManagement: any;
    }
}

// Global function to show user management component (sets isHidden to false)
window['showUserManagement'] = () => {
    window.dispatchEvent(new CustomEvent('showUserManagement'));
};

// Global function to hide user management component (sets isHidden to true)
window['hideUserManagement'] = () => {
    window.dispatchEvent(new CustomEvent('hideUserManagement'));
};

function documentReady(fn: any) {
    // see if DOM is already available
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

window['initVerification'] = (config: any) => {
    documentReady(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const isRegisterFormOnlyFromParams = urlParams.get('isRegisterFormOnly') === 'true';
        const paramsData = {
            ...(urlParams.get('first_name') && { firstName: urlParams.get('first_name') }),
            ...(urlParams.get('last_name') && { lastName: urlParams.get('last_name') }),
            ...(urlParams.get('email') && { email: urlParams.get('email') }),
            ...(urlParams.get('signup_service_id') && { signupServiceId: urlParams.get('signup_service_id') }),
        };
        if (config?.referenceId || config?.authToken || config?.showCompanyDetails) {
            const findOtpProvider = document.querySelector('proxy-auth');
            if (findOtpProvider) {
                const parentContainer = findOtpProvider.parentElement;
                if (parentContainer) {
                    parentContainer.querySelectorAll('#skeleton-loader').forEach((el) => el.remove());
                }
                findOtpProvider.remove();
            }
            const widgetElement = document.createElement('proxy-auth') as NgElement &
                WithProperties<ProxyAuthWidgetComponent>;
            widgetElement.referenceId = config?.referenceId;
            widgetElement.type = config?.type;
            widgetElement.authToken = config?.authToken;
            widgetElement.showCompanyDetails = config?.showCompanyDetails;
            widgetElement.userToken = config?.userToken;
            widgetElement.isRolePermission = config?.isRolePermission;
            widgetElement.isPreview = config?.isPreview;
            widgetElement.isLogin = config?.isLogin;
            widgetElement.loginRedirectUrl = config?.loginRedirectUrl;
            widgetElement.theme = config?.theme;
            widgetElement.version = config?.version;
            widgetElement.input_fields = config?.input_fields;
            widgetElement.show_social_login_icons = config?.show_social_login_icons;
            widgetElement.exclude_role_ids = config?.exclude_role_ids;
            widgetElement.include_role_ids = config?.include_role_ids;
            widgetElement.isHidden = config?.isHidden;
            widgetElement.isRegisterFormOnly = config?.isRegisterFormOnly || isRegisterFormOnlyFromParams;
            widgetElement.target = config?.target ?? '_self';
            if (!config.success || typeof config.success !== 'function') {
                throw Error('success callback function missing !');
            }
            widgetElement.successReturn = config.success;
            widgetElement.failureReturn = config.failure;

            // omitting keys which are not required in API payload; query params fill in missing values
            widgetElement.otherData = { ...paramsData, ...omit(config, RESERVED_KEYS) };

            // All types: append to the element whose id matches config.referenceId.
            // Retry every 100 ms for up to 5 s. Never fall back to document.body.
            // UserManagementBridgeService (root singleton) handles openAddUserDialog
            // independently — no master/hidden element needed.
            const resolveContainer = (): HTMLElement | null =>
                config?.referenceId ? document.getElementById(config.referenceId) : null;

            const container = resolveContainer();
            if (container) {
                container.append(widgetElement);
            } else {
                const RETRY_INTERVAL_MS = 100;
                const MAX_RETRIES = 50; // 50 × 100 ms = 5 s
                let attempts = 0;
                const poll = setInterval(() => {
                    attempts++;
                    const found = resolveContainer();
                    if (found) {
                        clearInterval(poll);
                        found.append(widgetElement);
                    } else if (attempts >= MAX_RETRIES) {
                        clearInterval(poll);
                        console.warn('[proxy-auth] target container not found after 5 s — widget not mounted.');
                    }
                }, RETRY_INTERVAL_MS);
            }

            window['libLoaded'] = true;
        } else {
            if (!config?.referenceId) {
                throw Error('Reference Id is missing!');
            } else {
                throw Error('Something went wrong!');
            }
        }
    });
};

@NgModule({
    imports: [
        ProxyAuthWidgetComponent,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        NgHcaptchaModule.forRoot({ siteKey: environment.hCaptchaSiteKey }),
        EffectsModule.forRoot([OtpEffects]),
        StoreModule.forRoot(reducers, {
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
            },
        }),
    ],
    providers: [
        OtpService,
        OtpUtilityService,
        OtpWidgetService,
        WidgetThemeService,
        // { provide: OverlayContainer, useClass: ShadowDomOverlayContainer },
        { provide: ProxyBaseUrls.Env, useValue: environment.env },
        { provide: ProxyBaseUrls.BaseURL, useValue: environment.apiUrl + environment.msgMidProxy },
        { provide: ProxyBaseUrls.ClientURL, useValue: environment.apiUrl + environment.msgMidProxy },
    ],
})
export class ElementModule implements DoBootstrap {
    private injector = inject(Injector);

    constructor() {
        if (!customElements.get('proxy-auth')) {
            const sendOtpComponent = createCustomElement(ProxyAuthWidgetComponent, {
                injector: this.injector,
            });
            customElements.define('proxy-auth', sendOtpComponent);
        }
    }

    ngDoBootstrap(appRef: ApplicationRef) {}
}
