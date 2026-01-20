import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement, NgElement, WithProperties } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OtpModule } from './otp/otp.module';
import { SendOtpComponent } from './otp/send-otp/send-otp.component';
import { omit } from 'lodash-es';
import { UserProfileComponent } from './otp/user-profile/user-profile.component';
import { ConfirmationDialogComponent } from './otp/user-profile/user-dialog/user-dialog.component';
import { interval } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

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
        if (config?.referenceId || config?.authToken || config?.showCompanyDetails) {
            const findOtpProvider = document.querySelector('proxy-auth');
            if (findOtpProvider) {
                document.body.removeChild(findOtpProvider);
            }
            const sendOtpElement = document.createElement('proxy-auth') as NgElement & WithProperties<SendOtpComponent>;
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
            sendOtpElement.target = config?.target ?? '_self';
            sendOtpElement.css = config.style;
            if (!config.success || typeof config.success !== 'function') {
                throw Error('success callback function missing !');
            }
            sendOtpElement.successReturn = config.success;
            sendOtpElement.failureReturn = config.failure;

            // omitting keys which are not required in API payload
            sendOtpElement.otherData = omit(config, RESERVED_KEYS);
            if (document.getElementById('proxyContainer') && config?.type !== 'user-management') {
                document.getElementById('proxyContainer').append(sendOtpElement);
            } else if (config?.type === 'user-management') {
                const container = document.getElementById('userProxyContainer');
                if (container) {
                    // Container exists, append directly
                    container.append(sendOtpElement);
                } else {
                    // Container not found - mount to body with display:none
                    sendOtpElement.style.display = 'none';
                    document.body.append(sendOtpElement);

                    // Observable to watch for userProxyContainer to appear/disappear in the DOM
                    const containerCheck$ = interval(100).pipe(
                        map(() => document.getElementById('userProxyContainer')),
                        distinctUntilChanged() // Emit when container reference changes (including null)
                    );

                    containerCheck$.subscribe((targetContainer) => {
                        if (targetContainer) {
                            // Container exists - move element there and show it
                            sendOtpElement.style.display = '';
                            targetContainer.append(sendOtpElement);
                        } else {
                            // Container doesn't exist - move element back to body and hide it
                            sendOtpElement.style.display = 'none';
                            document.body.append(sendOtpElement);
                        }
                    });
                }
            } else if (document.getElementById('userProxyContainer')) {
                document.getElementById('userProxyContainer').append(sendOtpElement);
            } else {
                document.getElementsByTagName('body')[0].append(sendOtpElement);
            }

            window['libLoaded'] = true;

            // } else if (config?.authToken) {
            //     const findOtpProvider = document.querySelector('user-profile');
            //     if (findOtpProvider) {
            //         document.body.removeChild(findOtpProvider);
            //     }
            //     const sendOtpElement = document.createElement('user-profile') as NgElement &
            //         WithProperties<UserProfileComponent>;
            //     sendOtpElement.authToken = config.authToken;
            //     sendOtpElement.target = config?.target ?? '_self';
            //     sendOtpElement.css = config.style;
            //     if (!config.success || typeof config.success !== 'function') {
            //         throw Error('success callback function missing !');
            //     }
            //     sendOtpElement.successReturn = config.success;
            //     sendOtpElement.failureReturn = config.failure;

            //     // omitting keys which are not required in API payload
            //     // sendOtpElement.otherData = omit(config, RESERVED_KEYS);

            //     document.getElementsByTagName('body')[0].append(sendOtpElement);
            //     window['libLoaded'] = true;
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
    imports: [BrowserModule, BrowserAnimationsModule, OtpModule],
    exports: [OtpModule],
})
export class ElementModule implements DoBootstrap {
    constructor(private injector: Injector) {
        if (!customElements.get('proxy-auth')) {
            const sendOtpComponent = createCustomElement(SendOtpComponent, {
                injector: this.injector,
            });
            customElements.define('proxy-auth', sendOtpComponent);
        }

        // if (!customElements.get('user-profile')) {
        //     const userProfileComponent = createCustomElement(UserProfileComponent, {
        //         injector: this.injector,
        //     });
        //     customElements.define('user-profile', userProfileComponent);
        // }
    }

    ngDoBootstrap(appRef: ApplicationRef) {
        if (!customElements.get('proxy-auth')) {
            const sendOtpComponent = createCustomElement(SendOtpComponent, {
                injector: this.injector,
            });
            customElements.define('proxy-auth', sendOtpComponent);
        }
        // if (!customElements.get('user-details')) {
        //     const userProfileComponent = createCustomElement(UserProfileComponent, {
        //         injector: this.injector,
        //     });
        //     customElements.define('user-details', userProfileComponent);
        // }
    }
}
