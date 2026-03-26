import { NgElement, WithProperties } from '@angular/elements';
import { ProxyAuthWidgetComponent } from './otp/widget/widget.component';
import { omit } from 'lodash-es';

export const RESERVED_KEYS = ['referenceId', 'target', 'style', 'success', 'failure'];

declare global {
    interface Window {
        initVerification: any;
        intlTelInput: any;
        showUserManagement: any;
        hideUserManagement: any;
        __proxyAuth: any;
        __proxyAuthLoaded: boolean;
    }
}

// Version metadata — helps clients debug CDN/cache issues
window.__proxyAuth = window.__proxyAuth || {};
window.__proxyAuth.version = '0.0.3';
window.__proxyAuth.buildTime = new Date().toISOString();

// Global function to show user management component (sets isHidden to false)
if (!window.showUserManagement) {
    window['showUserManagement'] = () => {
        window.dispatchEvent(new CustomEvent('showUserManagement'));
    };
}

// Global function to hide user management component (sets isHidden to true)
if (!window.hideUserManagement) {
    window['hideUserManagement'] = () => {
        window.dispatchEvent(new CustomEvent('hideUserManagement'));
    };
}

function documentReady(fn: any) {
    // see if DOM is already available
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

if (!window.initVerification) {
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
}
