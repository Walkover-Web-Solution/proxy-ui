import { OtpService } from './../service/otp.service';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../ui/progress-bar.component';
import { SendOtpCenterComponent } from '../component';
import { RegisterComponent } from '../component/register/register.component';
import { LoginComponent } from '../component/login/login.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { UserManagementComponent } from '../user-management/user-management.component';
import { OrganizationDetailsComponent } from '../organization-details/organization-details.component';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Renderer2,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
    ApplicationRef,
    EnvironmentInjector,
    computed,
    createComponent,
    effect,
    inject,
    signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { META_TAG_ID, WidgetTheme, PublicScriptType } from '@proxy/constant';
import { BaseComponent } from '@proxy/ui/base-component';
import { select, Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { distinctUntilChanged, filter, skip, take, takeUntil } from 'rxjs/operators';

import { getSubscriptionPlans, getWidgetData, upgradeSubscription } from '../store/actions/otp.action';
import { IAppState } from '../store/app.state';
import {
    selectGetOtpInProcess,
    selectResendOtpInProcess,
    selectVerifyOtpInProcess,
    selectWidgetData,
    selectWidgetTheme,
    subscriptionPlansData,
    upgradeSubscriptionData,
} from '../store/selectors';
import { FeatureServiceIds } from '@proxy/models/features-model';
import { OtpWidgetService } from '../service/otp-widget.service';
import { WidgetThemeService } from '../service/widget-theme.service';
import { OtpUtilityService } from '../service/otp-utility.service';
import { SubscriptionRendererService } from '../service/subscription-renderer.service';
import { ProxyAuthDomBuilderService } from '../service/proxy-auth-dom-builder.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SubscriptionCenterComponent } from '../component/subscription-center/subscription-center.component';
import { environment } from 'apps/36-blocks-widget/src/environments/environment';
import { InputFields, WidgetVersion } from './utility/model';
import { WidgetPortalRef, WidgetPortalService } from '../service/widget-portal.service';

import { THEME_COLORS, WIDGET_LAYOUT } from './theme.constants';
import { AuthButtonsComponent } from './auth-buttons/auth-buttons.component';
import { AuthFooterComponent } from './auth-footer/auth-footer.component';
import { InlineLoginComponent } from './inline-login/inline-login.component';

@Component({
    selector: 'proxy-auth-widget',
    imports: [
        CommonModule,
        ProgressBarComponent,
        SubscriptionCenterComponent,
        SendOtpCenterComponent,
        RegisterComponent,
        LoginComponent,
        UserProfileComponent,
        UserManagementComponent,
        OrganizationDetailsComponent,
    ],
    templateUrl: './widget.component.html',
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../../../styles.scss', './widget.component.scss'],
})
export class ProxyAuthWidgetComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public referenceId: string;
    @Input() public target: string;
    @Input() public showCompanyDetails: boolean;
    @Input() public userToken: string;
    @Input() public isRolePermission: boolean;
    @Input() public loginRedirectUrl: string;
    @Input() public authToken: string;
    @Input() public type: string;
    @Input() public isPreview: boolean = false;
    @Input() public isLogin: boolean = false;
    @Input() public theme: string;

    private readonly _authToken$ = signal<string | undefined>(undefined);
    private readonly _type$ = signal<string | undefined>(undefined);
    private readonly themeService = inject(WidgetThemeService);
    protected readonly WidgetTheme = WidgetTheme;
    protected readonly PublicScriptType = PublicScriptType;

    readonly viewMode = computed<PublicScriptType>(() => {
        const authToken = this._authToken$();
        const type = this._type$();
        if (authToken && type === PublicScriptType.UserManagement) {
            return PublicScriptType.UserManagement;
        }
        if (authToken && type === PublicScriptType.OrganizationDetails) {
            return PublicScriptType.OrganizationDetails;
        }
        if (authToken && type === PublicScriptType.UserProfile) {
            return PublicScriptType.UserProfile;
        }
        // TODO: Uncomment when subscription is implemented
        // if (type === PublicScriptType.Subscription) {
        //     return PublicScriptType.Subscription;
        // }
        return PublicScriptType.Authorization;
    });

    readonly isDarkTheme = computed(() => this.themeService.isDark$());

    @Input() public version: string = WidgetVersion.V1;
    @Input() public exclude_role_ids: any[] = [];
    @Input() public include_role_ids: any[] = [];
    @Input() public input_fields: string = InputFields.TOP;
    @Input() public show_social_login_icons: boolean = false;
    @Input() public isRegisterFormOnly: boolean = false;
    @Input() public successReturn: (arg: any) => any;
    @Input() public failureReturn: (arg: any) => any;
    @Input() public otherData: { [key: string]: any } = {};

    @ViewChild('dialogPortal') private dialogPortalEl?: ElementRef<HTMLElement>;
    private dialogPortalRef: WidgetPortalRef | null = null;
    private readonly widgetPortal = inject(WidgetPortalService);

    public readonly show = signal<boolean>(false);
    public readonly showRegistration = signal<boolean>(false);
    public readonly showForgotPassword = signal<boolean>(false);
    public readonly animate = signal<boolean>(false);
    public isCreateAccountTextAppended: boolean = false;
    public otpWidgetData;
    public loginWidgetData;
    public registrationViaLogin: boolean = true;
    public prefillDetails: string;
    public cameFromLogin: boolean = false;
    public cameFromSendOtpCenter: boolean = false;
    public referenceElement: HTMLElement = null;
    public subscriptionPlans: any[] = [];

    private readonly cdr = inject(ChangeDetectorRef);

    private readonly otpWidgetService = inject(OtpWidgetService);
    private readonly store = inject<Store<IAppState>>(Store);
    private readonly ngZone = inject(NgZone);
    private readonly renderer = inject(Renderer2);
    private readonly otpUtilityService = inject(OtpUtilityService);
    private readonly subscriptionRenderer = inject(SubscriptionRendererService);
    private readonly domBuilder = inject(ProxyAuthDomBuilderService);
    private readonly appRef = inject(ApplicationRef);
    private readonly envInjector = inject(EnvironmentInjector);
    private readonly mountedComponentRefs: any[] = [];
    private iconOnlyButtonsRef: any = null;
    private readonly otpService = inject(OtpService);

    readonly isOtpInProcess = toSignal(this.store.pipe(select(selectGetOtpInProcess), distinctUntilChanged(isEqual)), {
        initialValue: false,
    });
    readonly isResendOtpInProcess = toSignal(
        this.store.pipe(select(selectResendOtpInProcess), distinctUntilChanged(isEqual)),
        { initialValue: false }
    );
    readonly isVerifyOtpInProcess = toSignal(
        this.store.pipe(select(selectVerifyOtpInProcess), distinctUntilChanged(isEqual)),
        { initialValue: false }
    );
    readonly isOtpLoading = computed(
        () => this.isOtpInProcess() || this.isResendOtpInProcess() || this.isVerifyOtpInProcess()
    );
    readonly showLogin = toSignal(this.otpWidgetService.showlogin, { initialValue: false });

    readonly widgetTheme = toSignal(this.store.pipe(select(selectWidgetTheme), distinctUntilChanged(isEqual)), {
        initialValue: null,
    });

    private showSkeleton: boolean = false;
    public dialogBorderRadius: string = null;
    private createAccountTextAppended: boolean = false;
    private hcaptchaLoading: boolean = false;
    private hcaptchaRenderQueue: Array<() => void> = [];
    public isUserProxyContainer: boolean = true;

    constructor() {
        super();
        effect(() => {
            const dark = this.themeService.isDark$();
            this.reapplyInjectedButtonTheme(dark);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['authToken']) this._authToken$.set(this.authToken);
        if (changes['type']) this._type$.set(this.type);
        if (changes['theme']) this.themeService.setInputTheme(this.theme);
    }

    ngOnInit() {
        this._authToken$.set(this.authToken);
        this._type$.set(this.type);
        this.themeService.setInputTheme(this.theme);
        this.store
            .pipe(select(selectWidgetTheme), filter(Boolean), takeUntil(this.destroy$))
            .subscribe((theme: any) => {
                if (!this.theme && theme?.ui_preferences?.theme !== WidgetTheme.System) {
                    this.themeService.setThemeOverride(theme?.ui_preferences?.theme || theme);
                }
                this.loginWidgetData = theme?.registerState;
                this.version = theme?.ui_preferences?.version || 'v1';
                this.input_fields = theme?.ui_preferences?.input_fields || 'top';
                this.show_social_login_icons = theme?.ui_preferences?.icons || false;
                this.isCreateAccountTextAppended = theme?.ui_preferences?.create_account_link || false;
                this.dialogBorderRadius = this.getBorderRadiusCssValue(theme?.ui_preferences?.border_radius);
            });
        if (this.type === PublicScriptType.Subscription) {
            // Load subscription plans first
            this.store.dispatch(getSubscriptionPlans({ referenceId: this.referenceId, authToken: this.authToken }));
            this.store.pipe(select(subscriptionPlansData), takeUntil(this.destroy$)).subscribe((subscriptionPlans) => {
                if (subscriptionPlans) {
                    this.subscriptionPlans = subscriptionPlans.data;
                }
                if (this.isPreview) {
                    this.show.set(true);
                } else {
                    this.toggleSendOtp(true);
                }
            });

            // Fallback timeout in case subscription plans don't load
            setTimeout(() => {
                if (this.isPreview) {
                    this.show.set(true);
                } else if (!this.subscriptionPlans || this.subscriptionPlans.length === 0) {
                    this.toggleSendOtp(true);
                }
            }, 3000);
        } else {
            this.toggleSendOtp(true);
            if (this.isRegisterFormOnly) {
                this.registrationViaLogin = false;
                this.setShowRegistration(true);
            }
        }
        this.loadExternalFonts();
        if (!this.authToken) {
            if (this.referenceId) {
                this.store.dispatch(
                    getWidgetData({
                        referenceId: this.referenceId,
                        payload: this.otherData,
                    })
                );
            } else {
                console.error('Reference Id is undefined ! Please provide referenceId in the widget configuration.');
            }
        }
        this.store
            .pipe(select(selectWidgetData), filter(Boolean), takeUntil(this.destroy$))
            .subscribe((widgetData: any[]) => {
                this.otpWidgetData = widgetData?.find(
                    (widget) => widget?.service_id === FeatureServiceIds.Msg91OtpService
                );
                if (this.otpWidgetData) {
                    this.otpWidgetService.setWidgetConfig(
                        this.otpWidgetData?.widget_id,
                        this.otpWidgetData?.token_auth,
                        this.otpWidgetData?.state
                    );
                    this.otpWidgetService.loadScript();
                }
                if (!this.loginWidgetData) {
                    this.loginWidgetData = widgetData?.find(
                        (widget) => widget?.service_id === FeatureServiceIds.PasswordAuthentication
                    );
                }
            });
        this.otpWidgetService.otpWidgetToken.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((token) => {
            this.hitCallbackUrl(this.otpWidgetData.callbackUrl, { state: this.otpWidgetData?.state, code: token });
        });
    }

    ngOnDestroy() {
        this.dialogPortalRef?.detach();
        this.dialogPortalRef = null;
        if (this.referenceElement) {
            this.clearSubscriptionPlans(this.referenceElement);
        }
        if (this.referenceElement) {
            this.clearSubscriptionPlans(this.referenceElement);
        }
        super.ngOnDestroy();
        this.mountedComponentRefs.forEach((ref) => {
            ref.destroy();
        });
        this.mountedComponentRefs.length = 0;
        this.iconOnlyButtonsRef = null;
    }

    public closeOverlayDialog(): void {
        this.dialogPortalRef?.detach();
        this.dialogPortalRef = null;
        this.ngZone.run(() => {
            this.showRegistration.set(false);
            this.showForgotPassword.set(false);
            this.otpWidgetService.openLogin(false);
            this.otpWidgetService.closeForgotPassword();
            if (this.referenceElement) {
                this.show.set(false);
            }
            this.cameFromLogin = false;
            this.cameFromSendOtpCenter = false;
        });
    }

    private loadExternalFonts() {
        const node = document.querySelector('proxy-auth')?.shadowRoot;
        const styleElement = document.createElement('link');
        styleElement.rel = 'stylesheet';
        styleElement.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;600&display=swap';
        node?.appendChild(styleElement);

        const metaTag = document.createElement('meta');
        metaTag.name = 'viewport';
        metaTag.content = 'width=device-width, initial-scale=1';
        metaTag.id = META_TAG_ID;
        document.getElementsByTagName('head')[0].appendChild(metaTag);
    }

    public toggleSendOtp(intial: boolean = false) {
        this.referenceElement = document.getElementById(this.referenceId);
        if (!this.referenceElement) {
            this.ngZone.run(() => {
                const current = this.show();
                if (current) {
                    this.animate.set(true);
                    this.setShowLogin(false);
                    setTimeout(() => {
                        this.show.set(false);
                        this.animate.set(false);
                    }, 300);
                } else {
                    this.show.set(true);
                }
            });
        } else {
            this.setShowLogin(false);
            this.isUserProxyContainer = false;
            this.show.set(false);
            this.animate.set(false);
            this.createAccountTextAppended = false;

            if (intial) {
                if (this.type === PublicScriptType.Subscription) {
                    if (!this.isPreview && this.referenceElement) {
                        this.appendSubscriptionButton(this.referenceElement);
                    }
                } else {
                    this.showSkeleton = true;
                    this.domBuilder.appendSkeletonLoader(this.renderer, this.referenceElement);
                    this.addButtonsToReferenceElement(this.referenceElement);
                    setTimeout(() => {
                        if (this.showSkeleton) {
                            this.showSkeleton = false;
                            this.domBuilder.forceRemoveAllSkeletonLoaders(this.renderer, this.referenceElement);
                        }
                    }, 10000);
                }
            }
        }
    }
    public appendSubscriptionButton(element): void {
        try {
            if (!element) {
                return;
            }

            // Clear any existing subscription content (both Angular and JS generated)
            const existingContainers = element.querySelectorAll('.subscription-plans-container');
            existingContainers.forEach((container) => {
                this.renderer.removeChild(element, container);
            });

            // Also clear any Angular component containers
            const angularContainers = element.querySelectorAll('proxy-subscription-center');
            angularContainers.forEach((container) => {
                this.renderer.removeChild(element, container);
            });

            // Add CSS styles first
            this.addSubscriptionStyles();

            // Create the subscription center HTML structure
            const subscriptionHTML = this.createSubscriptionCenterHTML();

            // Create a container and set the HTML content
            const subscriptionContainer = this.renderer.createElement('div');
            subscriptionContainer.innerHTML = subscriptionHTML;

            // Add event listeners to the buttons
            this.addButtonEventListeners(subscriptionContainer);

            // Append the container to the element
            this.renderer.appendChild(element, subscriptionContainer);

            // IMPORTANT: Don't set this.type = 'subscription' to avoid triggering ngOnInit logic
            // The subscription plan is now rendered directly without going through the component lifecycle
        } catch (error) {
            console.error('Error appending subscription button:', error);
        }
    }

    private addButtonEventListeners(container: HTMLElement): void {
        const buttons = container.querySelectorAll('.plan-button');
        buttons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                if ((button as HTMLButtonElement).disabled || button.classList.contains('plan-button-disabled')) {
                    return;
                }

                // Check if it's an upgrade button
                if (button.classList.contains('upgrade-btn')) {
                    const planId = button.getAttribute('data-plan-id');
                    const planDataStr = button.getAttribute('data-plan-data');

                    if (planId && planDataStr) {
                        try {
                            const planData = JSON.parse(planDataStr);
                            this.upgradeSubscription(planData);
                        } catch (error) {
                            console.error('Error parsing plan data:', error);
                        }
                    }
                } else {
                    // Handle regular subscription buttons
                    const link = button.getAttribute('data-link');
                    if (link) {
                        window.open(link, '_blank');
                    }
                }
            });
        });
    }

    private createSubscriptionCenterHTML(): string {
        return this.subscriptionRenderer.buildContainerHTML(
            this.subscriptionPlans || [],
            this.themeService.isDark(),
            this.isLogin
        );
    }

    private addSubscriptionStyles(): void {
        this.subscriptionRenderer.injectSubscriptionStyles(this.themeService.isDark());
    }

    private addButtonsToReferenceElement(element): void {
        this.store
            .pipe(
                select(selectWidgetData),
                filter((e) => !!e),
                take(1)
            )
            .subscribe((widgetDataArray) => {
                let buttonsProcessed = 0;
                const totalButtons = widgetDataArray.length;

                if (totalButtons > 0 && this.showSkeleton) {
                    this.domBuilder.removeSkeletonLoader(this.renderer, element);
                    this.domBuilder.appendSkeletonLoader(this.renderer, element);
                } else if (totalButtons > 0 && !this.showSkeleton) {
                    this.domBuilder.removeSkeletonLoader(this.renderer, element);
                }

                if (totalButtons === 0) {
                    if (this.showSkeleton) {
                        this.showSkeleton = false;
                        this.domBuilder.removeSkeletonLoader(this.renderer, element);
                    }
                    if (!this.createAccountTextAppended) {
                        this.appendCreateAccountText(element);
                    }
                    return;
                }

                // Pre-render logo + title at the very top before any buttons,
                // so they always appear above all buttons.
                const hasPasswordAuth = widgetDataArray.some(
                    (b) => b?.service_id === FeatureServiceIds.PasswordAuthentication && this.version !== 'v1'
                );
                if (hasPasswordAuth) {
                    this.prependLogoAndTitle(element);
                }

                // Sort so PasswordAuthentication is rendered in correct DOM position:
                //   input_fields='top'    → form first, social buttons after  → sort PasswordAuth to front
                //   input_fields='bottom' → social buttons first, form after  → sort PasswordAuth to back
                const isInputFieldsTop = this.input_fields === 'top';
                const sortedDataArray = hasPasswordAuth
                    ? [...widgetDataArray].sort((a, b) => {
                          const aPw = a?.service_id === FeatureServiceIds.PasswordAuthentication;
                          const bPw = b?.service_id === FeatureServiceIds.PasswordAuthentication;
                          if (aPw === bPw) return 0;
                          return isInputFieldsTop ? (aPw ? -1 : 1) : aPw ? 1 : -1;
                      })
                    : widgetDataArray;

                let otpButtonProcessed = false;
                let otpTimeout: any = null;

                const fallbackTimeout = setTimeout(() => {
                    if (this.showSkeleton && !this.createAccountTextAppended) {
                        this.showSkeleton = false;
                        this.domBuilder.removeSkeletonLoader(this.renderer, element);
                        const allButtons = element.querySelectorAll('button');
                        allButtons.forEach((button) => {
                            button.style.visibility = 'visible';
                        });
                        if (otpButtonProcessed || !this.hasOtpButton(widgetDataArray)) {
                            this.appendCreateAccountText(element);
                        }
                    }
                }, 8000);

                const immediateFallback = setTimeout(() => {
                    if (this.showSkeleton && !this.createAccountTextAppended) {
                        this.showSkeleton = false;
                        this.domBuilder.removeSkeletonLoader(this.renderer, element);
                        this.domBuilder.forceRemoveAllSkeletonLoaders(this.renderer, this.referenceElement);
                        const allButtons = element.querySelectorAll('button');
                        allButtons.forEach((button) => {
                            button.style.visibility = 'visible';
                        });
                        if (otpButtonProcessed || !this.hasOtpButton(widgetDataArray)) {
                            this.appendCreateAccountText(element);
                        }
                    }
                }, 3000);

                for (const buttonsData of sortedDataArray) {
                    if (buttonsData?.service_id === FeatureServiceIds.Msg91OtpService) {
                        otpTimeout = setTimeout(() => {
                            if (!otpButtonProcessed) {
                                this.appendButton(element, buttonsData);

                                const otpButtons = element.querySelectorAll(
                                    'button[data-service-id="' + FeatureServiceIds.Msg91OtpService + '"]'
                                );
                                otpButtons.forEach((btn: HTMLElement) => {
                                    btn.style.visibility = 'visible';
                                });

                                buttonsProcessed++;
                                otpButtonProcessed = true;
                                this.checkAndAppendCreateAccountText(
                                    element,
                                    buttonsProcessed,
                                    totalButtons,
                                    fallbackTimeout,
                                    immediateFallback,
                                    otpTimeout
                                );
                            }
                        }, 4000);

                        setTimeout(() => {
                            const otpButtons = element.querySelectorAll(
                                'button[data-service-id="' + FeatureServiceIds.Msg91OtpService + '"]'
                            );
                            otpButtons.forEach((btn: HTMLElement) => {
                                if (btn.style.visibility === 'hidden') {
                                    btn.style.visibility = 'visible';
                                }
                            });
                        }, 3000);

                        this.otpWidgetService.scriptLoading
                            .pipe(
                                skip(1),
                                filter((e) => !e),
                                take(1)
                            )
                            .subscribe(() => {
                                if (!otpButtonProcessed) {
                                    if (otpTimeout) {
                                        clearTimeout(otpTimeout);
                                    }
                                    this.appendButton(element, buttonsData);

                                    const otpButtons = element.querySelectorAll(
                                        'button[data-service-id="' + FeatureServiceIds.Msg91OtpService + '"]'
                                    );
                                    otpButtons.forEach((btn: HTMLElement) => {
                                        btn.style.visibility = 'visible';
                                    });

                                    buttonsProcessed++;
                                    otpButtonProcessed = true;
                                    this.checkAndAppendCreateAccountText(
                                        element,
                                        buttonsProcessed,
                                        totalButtons,
                                        fallbackTimeout,
                                        immediateFallback,
                                        otpTimeout
                                    );
                                }
                            });
                    } else {
                        if (
                            buttonsData?.service_id !== FeatureServiceIds.PasswordAuthentication ||
                            (buttonsData?.service_id === FeatureServiceIds.PasswordAuthentication &&
                                this.version === 'v1')
                        ) {
                            this.appendButton(element, buttonsData);
                            buttonsProcessed++;
                            this.checkAndAppendCreateAccountText(
                                element,
                                buttonsProcessed,
                                totalButtons,
                                fallbackTimeout,
                                immediateFallback,
                                otpTimeout
                            );
                        } else {
                            this.appendPasswordAuthenticationButtonV2(element, buttonsData, totalButtons);
                            buttonsProcessed++;
                            this.checkAndAppendCreateAccountText(
                                element,
                                buttonsProcessed,
                                totalButtons,
                                fallbackTimeout,
                                immediateFallback,
                                otpTimeout
                            );
                        }
                    }
                }
            });
    }

    /**
     * Maps ui_preferences.border_radius to CSS value.
     * Values: 'none' | 'small' | 'medium' | 'large' -> 0 | 4px | 8px | 12px
     */
    private getBorderRadiusCssValue(borderRadius?: string): string {
        if (this.version !== WidgetVersion.V2) {
            return '8px';
        }
        switch (borderRadius) {
            case 'none':
                return '0';
            case 'small':
                return '4px';
            case 'medium':
                return '8px';
            case 'large':
                return '12px';
            default:
                return '8px';
        }
    }

    /**
     * Renders logo + title at the very top of the reference element
     * before any social/OTP/password buttons are appended.
     * This ensures logo and title always appear above all buttons.
     */
    private prependLogoAndTitle(element: HTMLElement): void {
        const selectWidgetTheme = this.widgetTheme() as any;
        const logoUrl: string = selectWidgetTheme?.ui_preferences?.logo_url || '';
        const titleText: string = selectWidgetTheme?.ui_preferences?.title || '';
        const primaryColor = this.getPrimaryColorForCurrentTheme(selectWidgetTheme?.ui_preferences);

        if (logoUrl) {
            const logoWrapper: HTMLDivElement = this.renderer.createElement('div');
            logoWrapper.style.cssText = `width:${WIDGET_LAYOUT.widthV2};display:flex;justify-content:center;margin:${WIDGET_LAYOUT.gutterH} ${WIDGET_LAYOUT.gutterH} 4px ${WIDGET_LAYOUT.gutterH};`;
            const logoEl: HTMLImageElement = this.renderer.createElement('img');
            logoEl.src = logoUrl;
            logoEl.alt = 'logo';
            logoEl.style.cssText = 'max-height:64px;width:auto;display:block;';
            logoWrapper.appendChild(logoEl);
            element.appendChild(logoWrapper);
        }

        if (titleText) {
            const titleEl: HTMLDivElement = this.renderer.createElement('div');
            titleEl.textContent = titleText;
            titleEl.setAttribute('data-widget-title', 'true');
            titleEl.style.cssText = `font-size:16px;line-height:20px;font-weight:600;color:${primaryColor};margin:0 ${WIDGET_LAYOUT.gutterH} 20px ${WIDGET_LAYOUT.gutterH};text-align:center;width:${WIDGET_LAYOUT.widthV2};font-family:${WIDGET_LAYOUT.fontFamily};`;
            element.appendChild(titleEl);
        }
    }

    /**
     * Returns primary color from ui_preferences for the current effective theme.
     * If theme is 'system', resolves via prefers-color-scheme.
     */
    private getPrimaryColorForCurrentTheme(uiPreferences?: {
        light_theme_primary_color?: string;
        dark_theme_primary_color?: string;
    }): string {
        const isDark = this.themeService.isDark();
        if (this.version !== WidgetVersion.V2) {
            return isDark ? THEME_COLORS.dark.primaryColorFallback : THEME_COLORS.light.primaryColorFallback;
        }
        const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
        return isDark
            ? (uiPreferences?.dark_theme_primary_color ?? colors.primaryColorFallback)
            : (uiPreferences?.light_theme_primary_color ?? colors.primaryColorFallback);
    }

    public appendPasswordAuthenticationButtonV2(element: HTMLElement, buttonsData: any, totalButtons: number): void {
        if (this.showSkeleton) {
            this.showSkeleton = false;
            this.domBuilder.removeSkeletonLoader(this.renderer, element);
        }
        const selectWidgetTheme = this.widgetTheme() as any;
        const borderRadius = this.getBorderRadiusCssValue(selectWidgetTheme?.ui_preferences?.border_radius);
        const primaryColor = this.getPrimaryColorForCurrentTheme(selectWidgetTheme?.ui_preferences);
        const isV2 = this.version === WidgetVersion.V2;
        const buttonColor = isV2 ? selectWidgetTheme?.ui_preferences?.button_color || '#3f51b5' : '#3f51b5';
        const buttonHoverColor = isV2 ? selectWidgetTheme?.ui_preferences?.button_hover_color || '#303f9f' : '#303f9f';
        const buttonTextColor = isV2 ? selectWidgetTheme?.ui_preferences?.button_text_color || '#ffffff' : '#ffffff';
        const isInputFieldsTop = this.input_fields === 'top';

        const ref = createComponent(InlineLoginComponent, { environmentInjector: this.envInjector });
        ref.setInput('buttonsData', buttonsData);
        ref.setInput('loginWidgetData', this.loginWidgetData);
        ref.setInput('version', this.version);
        ref.setInput('borderRadius', borderRadius);
        ref.setInput('primaryColor', primaryColor);
        ref.setInput('buttonColor', buttonColor);
        ref.setInput('buttonHoverColor', buttonHoverColor);
        ref.setInput('buttonTextColor', buttonTextColor);
        ref.setInput('totalButtons', totalButtons);
        ref.setInput('inputFieldsPosition', this.input_fields);
        ref.instance.forgotPasswordClicked.subscribe((_email: string) => this.setShowLogin(true));
        ref.instance.loginSuccess.subscribe((res: any) => this.returnSuccessObj(res));
        ref.instance.loginFailure.subscribe((err: any) => this.returnFailureObj(err));
        ref.instance.registrationRequired.subscribe((username: string) => this.setShowRegistration(true, username));
        this.appRef.attachView(ref.hostView);
        this.mountedComponentRefs.push(ref);
        const domNode = (ref.hostView as any).rootNodes[0] as HTMLElement;

        // Logo+title are pre-rendered at top via prependLogoAndTitle().
        // input_fields='top'    → form goes right after logo/title, divider after form, social buttons after divider
        // input_fields='bottom' → social buttons appended first (via appendButton), form appended last, divider before form
        if (isInputFieldsTop) {
            // Insert form right after logo/title (which are the only children so far when sorted first)
            element.appendChild(domNode);
        } else {
            // Social buttons were appended first; form goes at the end
            element.appendChild(domNode);
        }
        ref.changeDetectorRef.detectChanges();

        if (totalButtons > 1) {
            const dividerContainer = this.domBuilder.createOrDivider(this.renderer, primaryColor);
            if (isInputFieldsTop) {
                // Divider goes AFTER the form (social buttons will insert before divider via appendButton)
                const nextSibling = domNode.nextSibling;
                if (nextSibling) {
                    element.insertBefore(dividerContainer, nextSibling);
                } else {
                    element.appendChild(dividerContainer);
                }
            } else {
                // Divider goes BEFORE the form (social buttons were already appended before form)
                element.insertBefore(dividerContainer, domNode);
            }
        }
    }
    private checkAndAppendCreateAccountText(
        element,
        buttonsProcessed,
        totalButtons,
        fallbackTimeout?,
        immediateFallback?,
        otpTimeout?
    ): void {
        if (buttonsProcessed === totalButtons) {
            if (fallbackTimeout) {
                clearTimeout(fallbackTimeout);
            }
            if (immediateFallback) {
                clearTimeout(immediateFallback);
            }
            if (otpTimeout) {
                clearTimeout(otpTimeout);
            }

            if (this.showSkeleton) {
                this.showSkeleton = false;
                this.domBuilder.removeSkeletonLoader(this.renderer, element);
                this.domBuilder.forceRemoveAllSkeletonLoaders(this.renderer, this.referenceElement);

                const allButtons = element.querySelectorAll('button');
                allButtons.forEach((button) => {
                    button.style.visibility = 'visible';
                });
            }

            setTimeout(() => {
                this.appendCreateAccountText(element);
            }, 100);
        }
    }

    private appendButton(element: HTMLElement, buttonsData: any): void {
        if (this.showSkeleton) {
            this.showSkeleton = false;
            this.domBuilder.removeSkeletonLoader(this.renderer, element);
        }

        const selectWidgetTheme = this.widgetTheme() as any;
        const borderRadius = this.getBorderRadiusCssValue(selectWidgetTheme?.ui_preferences?.border_radius);
        const isOtpButton = buttonsData?.service_id === FeatureServiceIds.Msg91OtpService;
        const isInputFieldsTop = this.input_fields === 'top';

        if (this.show_social_login_icons) {
            // All icon-only buttons share one AuthButtonsComponent instance (single row)
            if (this.iconOnlyButtonsRef) {
                const current: any[] = this.iconOnlyButtonsRef.instance.buttons ?? [];
                this.iconOnlyButtonsRef.setInput('buttons', [...current, buttonsData]);
                this.iconOnlyButtonsRef.changeDetectorRef.detectChanges();
            } else {
                const ref = createComponent(AuthButtonsComponent, { environmentInjector: this.envInjector });
                ref.setInput('buttons', [buttonsData]);
                ref.setInput('version', this.version);
                ref.setInput('inputFields', this.input_fields);
                ref.setInput('showIconsOnly', true);
                ref.setInput('borderRadius', borderRadius);
                ref.setInput('otpButtonVisible', !isOtpButton);
                ref.instance.buttonClicked.subscribe((btn: any) => this.onButtonClick(btn));
                this.appRef.attachView(ref.hostView);
                this.mountedComponentRefs.push(ref);
                this.iconOnlyButtonsRef = ref;
                const domNode = (ref.hostView as any).rootNodes[0] as HTMLElement;
                element.appendChild(domNode);
                ref.changeDetectorRef.detectChanges();
            }
            return;
        }

        const ref = createComponent(AuthButtonsComponent, { environmentInjector: this.envInjector });
        ref.setInput('buttons', [buttonsData]);
        ref.setInput('version', this.version);
        ref.setInput('inputFields', this.input_fields);
        ref.setInput('showIconsOnly', false);
        ref.setInput('borderRadius', borderRadius);
        ref.setInput('otpButtonVisible', !isOtpButton);
        ref.instance.buttonClicked.subscribe((btn: any) => this.onButtonClick(btn));
        this.appRef.attachView(ref.hostView);
        this.mountedComponentRefs.push(ref);
        const domNode = (ref.hostView as any).rootNodes[0] as HTMLElement;
        // Logo+title are pre-rendered at top. Social buttons always append after them.
        // For input_fields='top': form was inserted at top of element before social buttons
        //   → buttons append after the form node (which is firstChild after logo/title).
        // For input_fields='bottom': social buttons appear between logo/title and the form.
        //   → buttons just append; form will be appended last.
        const orDivider = element.querySelector('[data-or-divider]');
        if (orDivider) {
            element.insertBefore(domNode, orDivider);
        } else {
            element.appendChild(domNode);
        }
        ref.changeDetectorRef.detectChanges();
    }
    private onButtonClick(btn: any): void {
        if (btn?.urlLink) {
            window.open(btn.urlLink, this.target);
        } else if (btn?.service_id === FeatureServiceIds.Msg91OtpService) {
            this.otpWidgetService.openWidget();
        } else if (btn?.service_id === FeatureServiceIds.PasswordAuthentication) {
            this.setShowLogin(true);
        }
    }

    private hasOtpButton(widgetDataArray: any[]): boolean {
        return widgetDataArray.some((widget) => widget?.service_id === FeatureServiceIds.Msg91OtpService);
    }

    private appendCreateAccountText(element: HTMLElement): void {
        if (!this.isCreateAccountTextAppended) {
            return;
        }
        const existingCreateAccountText = element.querySelector('p[data-create-account="true"]');
        if (existingCreateAccountText || this.createAccountTextAppended) {
            return;
        }
        this.createAccountTextAppended = true;

        const selectWidgetTheme = this.widgetTheme() as any;
        const primaryColor = this.getPrimaryColorForCurrentTheme(selectWidgetTheme?.ui_preferences);
        const signUpButtonText = selectWidgetTheme?.ui_preferences?.sign_up_button_text || 'Create an account';

        const ref = createComponent(AuthFooterComponent, { environmentInjector: this.envInjector });
        ref.setInput('version', this.version);
        ref.setInput('primaryColor', primaryColor);
        ref.setInput('signUpButtonText', signUpButtonText);
        ref.setInput('showCreateAccount', true);
        ref.instance.createAccount.subscribe(() => {
            this.cameFromLogin = false;
            this.cameFromSendOtpCenter = false;
            this.setShowRegistration(true);
        });
        this.appRef.attachView(ref.hostView);
        this.mountedComponentRefs.push(ref);
        const domNode = (ref.hostView as any).rootNodes[0] as HTMLElement;
        element.appendChild(domNode);
        ref.changeDetectorRef.detectChanges();
    }
    public hitCallbackUrl(callbackUrl: string, payload: { [key: string]: any }) {
        this.otpService.callBackUrl(callbackUrl, payload).subscribe(
            (res) => {
                this.successReturn(res);
                if (res?.data?.redirect_to) {
                    setTimeout(() => {
                        location.href = res?.data?.redirect_to;
                    }, 100);
                } else {
                    this.toggleSendOtp();
                }
            },
            (error: HttpErrorResponse) => {
                if (error?.status === 403) {
                    this.setShowRegistration(true);
                    this.show.set(true);
                    this.registrationViaLogin = false;
                }
            }
        );
    }

    public setShowRegistration(value: boolean, data?: string) {
        this.ngZone.run(() => {
            if (this.registrationViaLogin) {
                if (value) {
                    this.setShowLogin(false);
                    this.show.set(true);
                } else {
                    // Detach portal when closing
                    this.dialogPortalRef?.detach();
                    this.dialogPortalRef = null;
                    // When closing registration, go back to where user came from
                    if (this.cameFromLogin) {
                        // If user came from login, go back to login
                        this.setShowLogin(true);
                        this.show.set(true);
                    } else if (this.cameFromSendOtpCenter) {
                        // If user came from send-otp-center, go back to send-otp-center
                        // Only close login without affecting show - avoid race condition
                        this.otpWidgetService.openLogin(false);
                        this.show.set(true);
                    } else {
                        // If user came from dynamically appended buttons, just close without opening anything
                        this.setShowLogin(false);
                        this.show.set(false);
                    }
                    // Reset the flags
                    this.cameFromLogin = false;
                    this.cameFromSendOtpCenter = false;
                }
            } else {
                this.setShowLogin(false);
                if (this.referenceElement) {
                    this.show.set(value);
                }
            }
            this.showRegistration.set(value);
            if (data) {
                this.prefillDetails = data;
            }
            if (value) {
                this.cdr.detectChanges();
                if (this.dialogPortalEl?.nativeElement && !this.dialogPortalRef) {
                    this.dialogPortalRef = this.widgetPortal.attach(this.dialogPortalEl.nativeElement);
                }
            }
        });
    }
    public setShowLogin(value: boolean) {
        this.ngZone.run(() => {
            if (this.referenceElement) {
                this.show.set(value);
            }
            this.otpWidgetService.openLogin(value);
            if (value) {
                this.cdr.detectChanges();
                if (this.dialogPortalEl?.nativeElement && !this.dialogPortalRef) {
                    this.dialogPortalRef = this.widgetPortal.attach(this.dialogPortalEl.nativeElement);
                }
            } else {
                this.dialogPortalRef?.detach();
                this.dialogPortalRef = null;
            }
        });
    }

    public setShowRegistrationFromLogin(data?: string) {
        this.cameFromLogin = true; // Set flag to track that user came from login
        this.cameFromSendOtpCenter = false; // Reset other flags
        this.setShowRegistration(true, data);
    }

    public setShowRegistrationFromSendOtpCenter(data?: string) {
        this.cameFromSendOtpCenter = true; // Set flag to track that user came from send-otp-center
        this.cameFromLogin = false; // Reset other flags
        this.setShowRegistration(true, data);
    }
    public returnSuccessObj(obj) {
        if (typeof this.successReturn === 'function') {
            this.successReturn(obj);
        }
    }

    public returnFailureObj(obj) {
        if (typeof this.failureReturn === 'function') {
            this.failureReturn(obj);
        }
    }

    public handleSubscriptionToggle(event?: any): void {
        if (this.isPreview) {
            this.toggleSendOtp();
            this.isPreview = false;
            return;
        }
    }
    private clearSubscriptionPlans(element: HTMLElement): void {
        if (element) {
            const existingContainer = element.querySelector('.subscription-plans-container');
            if (existingContainer) {
                this.renderer.removeChild(element, existingContainer);
            }
        }
    }
    public upgradeSubscription(plan: any): void {
        if (this.isLogin) {
            // Dispatch the action
            this.store.dispatch(
                upgradeSubscription({
                    referenceId: this.referenceId,
                    payload: { plan_code: plan.plan_code },
                    authToken: this.authToken,
                })
            );
        }

        // Wait for the API response by subscribing to the upgrade subscription data
        this.store
            .pipe(
                select(upgradeSubscriptionData),
                filter((data) => data && data.data && data.data.redirect_url), // Wait until we have the redirect URL
                take(1), // Take only the first valid response
                takeUntil(this.destroy$)
            )
            .subscribe((response) => {
                const redirectUrl = this.isLogin ? response?.data?.redirect_url : this.loginRedirectUrl;
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                }
            });
        if (!this.isLogin) {
            window.location.href = this.loginRedirectUrl;
        }
    }

    private reapplyInjectedButtonTheme(_dark: boolean): void {
        // Components react to isDark signal automatically; trigger re-render.
        this.mountedComponentRefs.forEach((ref) => ref.changeDetectorRef.markForCheck());
    }
}
