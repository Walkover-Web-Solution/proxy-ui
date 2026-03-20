import { ApplicationRef, DoBootstrap, Injector, NgModule, inject } from '@angular/core';
import { PublicScriptType } from '@proxy/constant';
import { createCustomElement, NgElement, WithProperties } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProxyAuthWidgetComponent } from './otp/widget/widget.component';
import { omit } from 'lodash-es';
import { UserProfileComponent } from './otp/user-profile/user-profile.component';
import { ConfirmationDialogComponent } from './otp/user-profile/user-dialog/user-dialog.component';
import { interval } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule } from '@angular/common/http';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { reducers } from './otp/store/app.state';
import { OtpEffects } from './otp/store/effects';
import { OtpService } from './otp/service/otp.service';
import { OtpUtilityService } from './otp/service/otp-utility.service';
import { OtpWidgetService } from './otp/service/otp-widget.service';
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
                document.body.removeChild(findOtpProvider);
            }
            const sendOtpElement = document.createElement('proxy-auth') as NgElement &
                WithProperties<ProxyAuthWidgetComponent>;
            sendOtpElement.referenceId = config?.referenceId;
            sendOtpElement.type = config?.type;
            sendOtpElement.authToken = config?.authToken;
            sendOtpElement.showCompanyDetails = config?.showCompanyDetails;
            sendOtpElement.userToken = config?.userToken;
            sendOtpElement.isRolePermission = config?.isRolePermission;
            sendOtpElement.isPreview = config?.isPreview;
            sendOtpElement.isLogin = config?.isLogin;
            sendOtpElement.loginRedirectUrl = config?.loginRedirectUrl;
            sendOtpElement.theme = config?.theme;
            sendOtpElement.version = config?.version;
            sendOtpElement.input_fields = config?.input_fields;
            sendOtpElement.show_social_login_icons = config?.show_social_login_icons;
            sendOtpElement.exclude_role_ids = config?.exclude_role_ids;
            sendOtpElement.include_role_ids = config?.include_role_ids;
            sendOtpElement.isHidden = config?.isHidden;
            sendOtpElement.isRegisterFormOnly = config?.isRegisterFormOnly || isRegisterFormOnlyFromParams;
            sendOtpElement.target = config?.target ?? '_self';
            if (!config.success || typeof config.success !== 'function') {
                throw Error('success callback function missing !');
            }
            sendOtpElement.successReturn = config.success;
            sendOtpElement.failureReturn = config.failure;

            // omitting keys which are not required in API payload; query params fill in missing values
            sendOtpElement.otherData = { ...paramsData, ...omit(config, RESERVED_KEYS) };
            if (document.getElementById('proxyContainer') && config?.type !== PublicScriptType.UserManagement) {
                document.getElementById('proxyContainer').append(sendOtpElement);
            } else if (config?.type === PublicScriptType.UserManagement) {
                // Master element always stays in body (hidden) for window events
                sendOtpElement.style.display = 'none';
                sendOtpElement.setAttribute('data-master', 'true');
                document.body.append(sendOtpElement);

                // Helper to create a fresh configured element for the container
                const createContainerElement = () => {
                    const el = document.createElement('proxy-auth') as NgElement &
                        WithProperties<ProxyAuthWidgetComponent>;
                    el.referenceId = config?.referenceId;
                    el.type = config?.type;
                    el.authToken = config?.authToken;
                    el.showCompanyDetails = config?.showCompanyDetails;
                    el.userToken = config?.userToken;
                    el.isRolePermission = config?.isRolePermission;
                    el.isPreview = config?.isPreview;
                    el.isLogin = config?.isLogin;
                    el.loginRedirectUrl = config?.loginRedirectUrl;
                    el.theme = config?.theme;
                    el.version = config?.version;
                    el.input_fields = config?.input_fields;
                    el.show_social_login_icons = config?.show_social_login_icons;
                    el.exclude_role_ids = config?.exclude_role_ids;
                    el.include_role_ids = config?.include_role_ids;
                    el.isHidden = config?.isHidden;
                    el.target = config?.target ?? '_self';
                    el.successReturn = config.success;
                    el.failureReturn = config.failure;
                    el.otherData = omit(config, RESERVED_KEYS);
                    return el;
                };

                // Watch for container to appear/disappear
                const containerCheck$ = interval(100).pipe(
                    map(() => document.getElementById('userProxyContainer')),
                    distinctUntilChanged()
                );

                containerCheck$.subscribe((targetContainer) => {
                    // Remove any existing container element (not the master)
                    const existingContainerElement = document.querySelector('proxy-auth:not([data-master])');
                    if (existingContainerElement) {
                        existingContainerElement.remove();
                    }

                    if (targetContainer) {
                        // Container exists - create fresh element and append
                        targetContainer.append(createContainerElement());
                    }
                });
            } else if (document.getElementById('userProxyContainer')) {
                document.getElementById('userProxyContainer').append(sendOtpElement);
            } else {
                document.getElementsByTagName('body')[0].append(sendOtpElement);
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
        ConfirmationDialogComponent,
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
