import { NgElement, WithProperties } from '@angular/elements';
import { ProxyAuthWidgetComponent } from './otp/widget/widget.component';
import { omit } from 'lodash-es';
import { PROXY_DOM_ID, PublicScriptType, WidgetEvent } from '@proxy/constant';

export const RESERVED_KEYS = ['referenceId', 'target', 'style', 'success', 'failure'];

declare global {
    interface Window {
        initVerification: any;
        intlTelInput: any;
        __proxyAuth: any;
        __proxyAuthLoaded: boolean;
    }
}

// Version metadata — helps clients debug CDN/cache issues
window.__proxyAuth = window.__proxyAuth || {};
window.__proxyAuth.version = '0.0.3';
window.__proxyAuth.buildTime = new Date().toISOString();

// Buffer any `openAddUserDialog` events fired before Angular bootstraps.
// UserManagementBridgeService drains this buffer on construction.
window.__proxyAuth.pendingDialogEvents = window.__proxyAuth.pendingDialogEvents || [];
window.addEventListener(WidgetEvent.OpenInviteMemberDialog, (e: Event) => {
    (window.__proxyAuth.pendingDialogEvents as Event[]).push(e);
});

function validateWidgetConfig(config: any): void {
    const validTypes = Object.values(PublicScriptType).filter((type) => type !== PublicScriptType.Subscription); // Subscription is deprecated
    if (!config?.type || !validTypes.includes(config.type)) {
        console.error(
            '[36Blocks] Invalid or missing "type" attribute.\n' +
                `  Received: ${JSON.stringify(config?.type)}\n` +
                `  Expected one of: ${validTypes.map((value) => `"${value}"`).join(', ')}`
        );
    }
    const authTokenRequiredTypes = [
        PublicScriptType.UserProfile,
        PublicScriptType.UserManagement,
        PublicScriptType.OrganizationDetails,
    ];
    if (authTokenRequiredTypes.includes(config?.type) && !config?.authToken) {
        console.error(
            `[36Blocks] "authToken" is required when type is "${config?.type}".\n` +
                `  Types that require authToken: ${authTokenRequiredTypes.map((value) => `"${value}"`).join(', ')}`
        );
    }
}

if (!window.initVerification) {
    window['initVerification'] = (config: any) => {
        // Validate widget config and show error in console
        validateWidgetConfig(config);

        // In case of no type, set default to Authorization
        if (!config?.type) {
            config = { ...config, type: PublicScriptType.Authorization };
        }
        const initFn = () => {
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
                widgetElement.isRegisterFormOnly = config?.isRegisterFormOnly || isRegisterFormOnlyFromParams;
                widgetElement.target = config?.target ?? '_self';
                if (!config.success || typeof config.success !== 'function') {
                    throw Error('success callback function missing !');
                }
                widgetElement.successReturn = config.success;
                widgetElement.failureReturn = config.failure;

                // Optional: Path to redirect after login (e.g., '/login') only used get proxy_auth_token in admin panel while preview
                if (config?.redirect_path) {
                    const { redirect_path, ...rest } = config;
                    config = { ...rest, addInfo: { redirect_path } };
                }

                // omitting keys which are not required in API payload; query params fill in missing values
                widgetElement.otherData = { ...paramsData, ...omit(config, RESERVED_KEYS) };

                // Determine the target container id:
                const targetId: string =
                    config?.type === PublicScriptType.Authorization ? config?.referenceId : PROXY_DOM_ID;

                const resolveContainer = (): HTMLElement | null => document.getElementById(targetId);

                // Mount helper — called exactly once when the container is found.
                const mountWidget = (container: HTMLElement): void => {
                    container.append(widgetElement);
                    window['libLoaded'] = true;
                };

                const container = resolveContainer();
                if (container) {
                    mountWidget(container);
                } else {
                    // SPA-safe retry strategy:
                    //   1. MutationObserver watches the entire document for the target element
                    //      being added at any depth (handles Angular/React/Next.js async renders).
                    //   2. A setInterval heartbeat runs in parallel as a safety net for cases
                    //      where MutationObserver misses the insertion (e.g. innerHTML swap).
                    //   3. Both are cancelled the moment the container is found.
                    //   4. After TIMEOUT_MS with no container, log a clear error and stop.

                    const RETRY_INTERVAL_MS = 150;
                    const TIMEOUT_MS = 30_000; // 30 s — covers slow/lazy SPA routes
                    let resolved = false;
                    const startTime = Date.now();

                    const cleanup = (observer: MutationObserver, intervalId: ReturnType<typeof setInterval>): void => {
                        observer.disconnect();
                        clearInterval(intervalId);
                    };

                    const tryMount = (
                        observer: MutationObserver,
                        intervalId: ReturnType<typeof setInterval>
                    ): boolean => {
                        if (resolved) return true;
                        const found = resolveContainer();
                        if (found) {
                            resolved = true;
                            cleanup(observer, intervalId);
                            mountWidget(found);
                            return true;
                        }
                        if (Date.now() - startTime >= TIMEOUT_MS) {
                            resolved = true;
                            cleanup(observer, intervalId);
                            console.error(
                                `[36Blocks] Container element with id="${targetId}" was not found in the document ` +
                                    `after ${TIMEOUT_MS / 1000} s. ` +
                                    `Ensure the element exists in the DOM before calling window.initVerification().`
                            );
                            return true;
                        }
                        return false;
                    };

                    // Placeholder interval id — replaced after both are created.
                    let intervalId: ReturnType<typeof setInterval>;

                    const observer = new MutationObserver(() => {
                        tryMount(observer, intervalId);
                    });

                    observer.observe(document.documentElement, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['id'],
                    });

                    intervalId = setInterval(() => {
                        tryMount(observer, intervalId);
                    }, RETRY_INTERVAL_MS);
                }
            } else {
                if (!config?.referenceId) {
                    throw Error('Reference Id is missing!');
                } else {
                    throw Error('Something went wrong!');
                }
            }
        };
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(initFn, 1);
        } else {
            document.addEventListener('DOMContentLoaded', initFn);
        }
    };
}
