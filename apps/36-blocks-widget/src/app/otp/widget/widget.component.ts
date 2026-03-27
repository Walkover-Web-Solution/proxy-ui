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
    computed,
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

    get isDarkTheme(): boolean {
        return this.themeService.isDark(this.theme as WidgetTheme);
    }

    @Input() public version: string = WidgetVersion.V1;
    @Input() public exclude_role_ids: any[] = [];
    @Input() public include_role_ids: any[] = [];
    @Input() public isHidden: boolean = false;
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
        console.info('Widget component initialized', this.authToken, this.type, this.theme);
        this._authToken$.set(this.authToken);
        this._type$.set(this.type);
        this.themeService.setInputTheme(this.theme);
        this.store
            .pipe(select(selectWidgetTheme), filter(Boolean), takeUntil(this.destroy$))
            .subscribe((theme: any) => {
                if (theme?.ui_preferences?.theme !== WidgetTheme.System) {
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
        super.ngOnDestroy();
    }

    public closeOverlayDialog(): void {
        this.dialogPortalRef?.detach();
        this.dialogPortalRef = null;
        this.ngZone.run(() => {
            this.showRegistration.set(false);
            this.otpWidgetService.openLogin(false);
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

                for (const buttonsData of widgetDataArray) {
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
     * Returns primary color from ui_preferences for the current effective theme.
     * If theme is 'system', resolves via prefers-color-scheme.
     */
    private getPrimaryColorForCurrentTheme(uiPreferences?: {
        light_theme_primary_color?: string;
        dark_theme_primary_color?: string;
    }): string {
        const isDark = this.themeService.isDark();
        if (this.version !== WidgetVersion.V2) {
            return isDark ? '#FFFFFF' : '#000000';
        }
        return isDark
            ? uiPreferences?.dark_theme_primary_color ?? '#FFFFFF'
            : uiPreferences?.light_theme_primary_color ?? '#000000';
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

        const loginContainer: HTMLElement = this.renderer.createElement('div');
        loginContainer.style.cssText = `width:316px;padding:0;margin:0 8px 16px 8px;display:flex;flex-direction:column;gap:8px;box-sizing:border-box;font-family:'Inter',sans-serif;border-radius:${borderRadius};`;

        const title: HTMLElement = this.renderer.createElement('div');
        title.textContent = selectWidgetTheme?.ui_preferences?.title;
        title.style.cssText = `font-size:16px;line-height:20px;font-weight:600;color:${primaryColor};margin:0 8px 20px 8px;text-align:center;width:316px;`;

        const loginButton: HTMLButtonElement = this.renderer.createElement('button');
        loginButton.textContent = 'Sign in';
        loginButton.style.cssText = `height:36px;padding:0 12px;background-color:${buttonColor};color:${buttonTextColor};border:none;border-radius:${borderRadius};font-size:14px;font-weight:600;cursor:pointer;width:100%;box-shadow:0 1px 2px rgba(0,0,0,0.08);margin-top:4px;`;
        loginButton.addEventListener('mouseenter', () => {
            loginButton.style.backgroundColor = buttonHoverColor;
        });
        loginButton.addEventListener('mouseleave', () => {
            loginButton.style.backgroundColor = buttonColor;
        });

        const onForgotPassword = (email: string) => this.openForgotPasswordDialog(email);
        this.buildLoginFields(loginContainer, buttonsData, loginButton, borderRadius, primaryColor, onForgotPassword);

        const isInputFieldsTop = this.input_fields === 'top';
        const logoUrl = selectWidgetTheme?.ui_preferences?.logo_url;
        const logoElement = this.domBuilder.createLogoElement(this.renderer, logoUrl);

        if (logoElement) {
            if (element.firstChild) {
                this.renderer.insertBefore(element, logoElement, element.firstChild);
            } else {
                this.renderer.appendChild(element, logoElement);
            }
        }

        const logoOrFirst = logoElement ? logoElement.nextSibling : element.firstChild;
        if (logoOrFirst) {
            this.renderer.insertBefore(element, title, logoOrFirst);
        } else {
            this.renderer.appendChild(element, title);
        }

        if (isInputFieldsTop) {
            const titleNextSibling = title.nextSibling;
            if (titleNextSibling) {
                this.renderer.insertBefore(element, loginContainer, titleNextSibling);
            } else {
                this.renderer.appendChild(element, loginContainer);
            }
        } else {
            this.renderer.appendChild(element, loginContainer);
        }

        if (totalButtons > 1) {
            const dividerContainer = this.domBuilder.createOrDivider(this.renderer, primaryColor);
            if (isInputFieldsTop) {
                const nextSibling = loginContainer.nextSibling;
                if (nextSibling) {
                    this.renderer.insertBefore(element, dividerContainer, nextSibling);
                } else {
                    this.renderer.appendChild(element, dividerContainer);
                }
            } else {
                this.renderer.insertBefore(element, dividerContainer, loginContainer);
            }
        }
    }

    private handlePasswordAuthenticationLogin(
        buttonsData: any,
        usernameInput: HTMLInputElement,
        passwordInput: HTMLInputElement,
        errorText: HTMLElement,
        loginButton: HTMLButtonElement,
        getHCaptchaToken: () => string,
        resetHCaptcha: () => void
    ): void {
        const username = usernameInput.value?.trim();
        const password = passwordInput.value;
        const hCaptchaToken = getHCaptchaToken();

        if (!username || !password) {
            this.domBuilder.setInlineError(errorText, 'Email/Mobile and password are required.');
            return;
        }

        if (!hCaptchaToken) {
            this.domBuilder.setInlineError(errorText, 'Please complete the hCaptcha verification.');
            return;
        }

        this.domBuilder.setInlineError(errorText, '');
        const originalText = loginButton.textContent || 'Login';
        loginButton.disabled = true;
        loginButton.textContent = 'Please wait...';

        const payload = {
            state: buttonsData?.state || this.loginWidgetData?.state,
            user: username.replace(/^\+/, ''),
            password: this.encryptPassword(password),
            hCaptchaToken,
        };

        this.otpService.login(payload).subscribe(
            (res) => {
                loginButton.disabled = false;
                loginButton.textContent = originalText;

                if (res?.hasError) {
                    this.domBuilder.setInlineError(errorText, res?.errors?.[0] || 'Unable to login. Please try again.');
                    resetHCaptcha();
                    return;
                }

                if (res?.data?.redirect_url) {
                    window.location.href = res.data.redirect_url;
                    return;
                }

                this.returnSuccessObj(res);
            },
            (error: HttpErrorResponse) => {
                loginButton.disabled = false;
                loginButton.textContent = originalText;

                if (error?.status === 403) {
                    this.setShowRegistration(true, username);
                    resetHCaptcha();
                    return;
                }

                this.domBuilder.setInlineError(
                    errorText,
                    error?.error?.errors?.[0] || 'Login failed. Please check your details and try again.'
                );
                resetHCaptcha();
                this.returnFailureObj(error);
            }
        );
    }

    /**
     * Opens the forgot password dialog
     */
    private openForgotPasswordDialog(prefillEmail: string = ''): void {
        // Open the dialog
        this.ngZone.run(() => {
            this.show.set(true);
            // Signal to send-otp-center to open in forgot password mode
            this.otpWidgetService.openForgotPassword(prefillEmail);
        });
    }

    /**
     * Shows the forgot password form (Step 2: Send OTP)
     */
    private showForgotPasswordForm(loginContainer: HTMLElement, buttonsData: any, prefillEmail: string = ''): void {
        // Clear the login container
        loginContainer.innerHTML = '';

        const selectWidgetTheme = this.widgetTheme() as any;
        const borderRadius = this.getBorderRadiusCssValue(selectWidgetTheme?.ui_preferences?.border_radius);
        const isDarkFP = this.themeService.isDark();

        // Create back button
        const backButton: HTMLButtonElement = this.renderer.createElement('button');
        backButton.type = 'button';
        backButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#5f6368">
                <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/>
            </svg>
        `;
        backButton.style.cssText = `
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        `;
        backButton.addEventListener('click', () => {
            this.restoreLoginForm(loginContainer, buttonsData);
        });

        // Create title
        const title: HTMLElement = this.renderer.createElement('div');
        title.textContent = 'Reset Password';
        title.style.cssText = `
            font-size: 16px;
            line-height: 20px;
            font-weight: 600;
            color: ${isDarkFP ? '#ffffff' : '#1f2937'};
            margin-bottom: 16px;
        `;

        // Create email/mobile input
        const inputField = this.renderer.createElement('div');
        inputField.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
        `;

        const emailInput: HTMLInputElement = this.renderer.createElement('input');
        emailInput.type = 'text';
        emailInput.placeholder = 'Email or Mobile';
        emailInput.autocomplete = 'off';
        emailInput.value = prefillEmail;
        emailInput.style.cssText = `
            width: 100%;
            height: 44px;
            padding: 0 16px;
            border: ${isDarkFP ? '1px solid #ffffff' : '1px solid #cbd5e1'};
            border-radius: ${borderRadius};
            background: ${isDarkFP ? 'transparent' : '#ffffff'};
            color: ${isDarkFP ? '#ffffff' : '#1f2937'};
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
        `;

        // Create error text
        const errorText: HTMLElement = this.renderer.createElement('div');
        errorText.style.cssText = `
            color: #d14343;
            font-size: 14px;
            min-height: 16px;
            display: none;
            margin-top: 4px;
        `;

        // Create send OTP button
        const sendOtpButton: HTMLButtonElement = this.renderer.createElement('button');
        sendOtpButton.textContent = 'Send OTP';
        sendOtpButton.style.cssText = `
            height: 44px;
            padding: 0 12px;
            background-color: #3f51b5;
            color: #ffffff;
            border: none;
            border-radius: ${borderRadius};
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
            margin-top: 8px;
        `;

        const handleSendOtp = () => {
            const userDetails = emailInput.value?.trim();
            if (!userDetails) {
                this.domBuilder.setInlineError(errorText, 'Email or Mobile is required.');
                return;
            }

            this.domBuilder.setInlineError(errorText, '');
            const originalText = sendOtpButton.textContent || 'Send OTP';
            sendOtpButton.disabled = true;
            sendOtpButton.textContent = 'Please wait...';

            const payload = {
                state: buttonsData?.state || this.loginWidgetData?.state,
                user: userDetails,
            };

            this.otpService.resetPassword(payload).subscribe(
                (res) => {
                    sendOtpButton.disabled = false;
                    sendOtpButton.textContent = originalText;

                    if (res?.hasError) {
                        this.domBuilder.setInlineError(
                            errorText,
                            res?.errors?.[0] || 'Unable to send OTP. Please try again.'
                        );
                        return;
                    }

                    // Move to step 3: Change Password
                    this.showChangePasswordForm(loginContainer, buttonsData, userDetails);
                },
                (error) => {
                    sendOtpButton.disabled = false;
                    sendOtpButton.textContent = originalText;
                    this.domBuilder.setInlineError(
                        errorText,
                        error?.error?.errors?.[0] || 'Failed to send OTP. Please try again.'
                    );
                }
            );
        };

        sendOtpButton.addEventListener('click', handleSendOtp);
        emailInput.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSendOtp();
            }
        });

        // Append elements
        this.renderer.appendChild(inputField, emailInput);
        this.renderer.appendChild(loginContainer, backButton);
        this.renderer.appendChild(loginContainer, title);
        this.renderer.appendChild(loginContainer, inputField);
        this.renderer.appendChild(loginContainer, errorText);
        this.renderer.appendChild(loginContainer, sendOtpButton);
    }

    /**
     * Shows the change password form (Step 3: Enter OTP and new password)
     */
    private showChangePasswordForm(loginContainer: HTMLElement, buttonsData: any, userDetails: string): void {
        // Clear the login container
        loginContainer.innerHTML = '';

        const selectWidgetTheme = this.widgetTheme() as any;
        const borderRadius = this.getBorderRadiusCssValue(selectWidgetTheme?.ui_preferences?.border_radius);
        const isDarkCP = this.themeService.isDark();

        let remainingSeconds = 15;
        let timerInterval: any = null;

        // Create back button
        const backButton: HTMLButtonElement = this.renderer.createElement('button');
        backButton.type = 'button';
        backButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#5f6368">
                <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/>
            </svg>
        `;
        backButton.style.cssText = `
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        `;
        backButton.addEventListener('click', () => {
            if (timerInterval) clearInterval(timerInterval);
            this.showForgotPasswordForm(loginContainer, buttonsData, userDetails);
        });

        // Create title
        const title: HTMLElement = this.renderer.createElement('div');
        title.textContent = 'Change Password';
        title.style.cssText = `
            font-size: 16px;
            line-height: 20px;
            font-weight: 600;
            color: ${isDarkCP ? '#ffffff' : '#1f2937'};
            margin-bottom: 8px;
        `;

        // User info with change link
        const userInfo: HTMLElement = this.renderer.createElement('p');
        userInfo.style.cssText = `
            font-size: 14px;
            color: ${isDarkCP ? '#e5e7eb' : '#5d6164'};
            margin: 0 0 8px 0;
        `;
        userInfo.innerHTML = `${userDetails} <a href="javascript:void(0)" style="color: #1976d2; text-decoration: none;">Change</a>`;
        userInfo.querySelector('a')?.addEventListener('click', () => {
            if (timerInterval) clearInterval(timerInterval);
            this.showForgotPasswordForm(loginContainer, buttonsData, userDetails);
        });

        // Resend OTP button
        const resendButton: HTMLButtonElement = this.renderer.createElement('button');
        resendButton.type = 'button';
        resendButton.style.cssText = `
            background: transparent;
            border: none;
            color: #1976d2;
            font-size: 14px;
            cursor: pointer;
            padding: 4px 0;
            margin-bottom: 12px;
        `;

        const updateResendButton = () => {
            if (remainingSeconds > 0) {
                resendButton.textContent = `Resend OTP ${remainingSeconds}`;
                resendButton.disabled = true;
                resendButton.style.opacity = '0.6';
            } else {
                resendButton.textContent = 'Resend OTP';
                resendButton.disabled = false;
                resendButton.style.opacity = '1';
            }
        };
        updateResendButton();

        // Start timer
        timerInterval = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                updateResendButton();
            } else {
                clearInterval(timerInterval);
            }
        }, 1000);

        resendButton.addEventListener('click', () => {
            if (remainingSeconds > 0) return;

            resendButton.disabled = true;
            const payload = {
                state: buttonsData?.state || this.loginWidgetData?.state,
                user: userDetails,
            };

            this.otpService.resetPassword(payload).subscribe(
                (res) => {
                    if (!res?.hasError) {
                        remainingSeconds = 15;
                        updateResendButton();
                        timerInterval = setInterval(() => {
                            if (remainingSeconds > 0) {
                                remainingSeconds--;
                                updateResendButton();
                            } else {
                                clearInterval(timerInterval);
                            }
                        }, 1000);
                    }
                    resendButton.disabled = remainingSeconds > 0;
                },
                () => {
                    resendButton.disabled = false;
                }
            );
        });

        // Create OTP input
        const otpInput: HTMLInputElement = this.renderer.createElement('input');
        otpInput.type = 'number';
        otpInput.placeholder = 'Enter OTP';
        otpInput.autocomplete = 'off';
        otpInput.style.cssText = `
            width: 100%;
            height: 44px;
            padding: 0 16px;
            border: ${isDarkCP ? '1px solid #ffffff' : '1px solid #cbd5e1'};
            border-radius: ${borderRadius};
            background: ${isDarkCP ? 'transparent' : '#ffffff'};
            color: ${isDarkCP ? '#ffffff' : '#1f2937'};
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
            margin-bottom: 12px;
        `;

        // Create password input
        const passwordInput: HTMLInputElement = this.renderer.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'New Password';
        passwordInput.autocomplete = 'off';
        passwordInput.style.cssText = otpInput.style.cssText;

        // Create confirm password input
        const confirmPasswordInput: HTMLInputElement = this.renderer.createElement('input');
        confirmPasswordInput.type = 'password';
        confirmPasswordInput.placeholder = 'Confirm Password';
        confirmPasswordInput.autocomplete = 'off';
        confirmPasswordInput.style.cssText = otpInput.style.cssText;

        // Password hint
        const passwordHint: HTMLElement = this.renderer.createElement('p');
        passwordHint.textContent =
            'Password should contain at least one Capital Letter, one Small Letter, one Digit and one Symbol (min 8 characters)';
        passwordHint.style.cssText = `
            font-size: 12px;
            color: ${isDarkCP ? '#9ca3af' : '#6b7280'};
            margin: -8px 0 12px 0;
        `;

        // Create error text
        const errorText: HTMLElement = this.renderer.createElement('div');
        errorText.style.cssText = `
            color: #d14343;
            font-size: 14px;
            min-height: 16px;
            display: none;
            margin-bottom: 8px;
        `;

        // Create submit button
        const submitButton: HTMLButtonElement = this.renderer.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.style.cssText = `
            height: 44px;
            padding: 0 12px;
            background-color: #3f51b5;
            color: #ffffff;
            border: none;
            border-radius: ${borderRadius};
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        `;

        const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

        const handleSubmit = () => {
            const otp = otpInput.value?.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (!otp) {
                this.domBuilder.setInlineError(errorText, 'OTP is required.');
                return;
            }
            if (!password) {
                this.domBuilder.setInlineError(errorText, 'Password is required.');
                return;
            }
            if (password.length < 8) {
                this.domBuilder.setInlineError(errorText, 'Password must be at least 8 characters.');
                return;
            }
            if (!PASSWORD_REGEX.test(password)) {
                this.domBuilder.setInlineError(
                    errorText,
                    'Password should contain at least one Capital Letter, one Small Letter, one Digit and one Symbol.'
                );
                return;
            }
            if (password !== confirmPassword) {
                this.domBuilder.setInlineError(errorText, 'Passwords do not match.');
                return;
            }

            this.domBuilder.setInlineError(errorText, '');
            const originalText = submitButton.textContent || 'Submit';
            submitButton.disabled = true;
            submitButton.textContent = 'Please wait...';

            const encodedPassword = this.encryptPassword(password);
            const payload = {
                state: buttonsData?.state || this.loginWidgetData?.state,
                user: userDetails,
                password: encodedPassword,
                otp: parseInt(otp, 10),
            };

            this.otpService.verfyResetPasswordOtp(payload).subscribe(
                (res) => {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;

                    if (res?.hasError) {
                        this.domBuilder.setInlineError(
                            errorText,
                            res?.errors?.[0] || 'Unable to reset password. Please try again.'
                        );
                        return;
                    }

                    // Clear timer and go back to login form
                    if (timerInterval) clearInterval(timerInterval);
                    this.restoreLoginForm(loginContainer, buttonsData);
                },
                (error) => {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                    this.domBuilder.setInlineError(
                        errorText,
                        error?.error?.errors?.[0] || 'Failed to reset password. Please try again.'
                    );
                }
            );
        };

        submitButton.addEventListener('click', handleSubmit);

        // Append elements
        this.renderer.appendChild(loginContainer, backButton);
        this.renderer.appendChild(loginContainer, title);
        this.renderer.appendChild(loginContainer, userInfo);
        this.renderer.appendChild(loginContainer, resendButton);
        this.renderer.appendChild(loginContainer, otpInput);
        this.renderer.appendChild(loginContainer, passwordInput);
        this.renderer.appendChild(loginContainer, confirmPasswordInput);
        this.renderer.appendChild(loginContainer, passwordHint);
        this.renderer.appendChild(loginContainer, errorText);
        this.renderer.appendChild(loginContainer, submitButton);
    }

    /**
     * Restores the login form after forgot password flow
     */
    private restoreLoginForm(loginContainer: HTMLElement, buttonsData: any): void {
        // Clear the container and rebuild the login form content
        loginContainer.innerHTML = '';

        // Rebuild the login form content within the same container
        this.buildLoginFormContent(loginContainer, buttonsData);
    }

    private buildLoginFormContent(loginContainer: HTMLElement, buttonsData: any): void {
        const selectWidgetTheme = this.widgetTheme() as any;
        const borderRadius = this.getBorderRadiusCssValue(selectWidgetTheme?.ui_preferences?.border_radius);
        const primaryColor = this.getPrimaryColorForCurrentTheme(selectWidgetTheme?.ui_preferences);

        const title: HTMLElement = this.renderer.createElement('div');
        title.textContent = 'Login';
        title.style.cssText = `font-size:16px;line-height:20px;font-weight:600;color:${
            this.themeService.isDark() ? '#ffffff' : '#1f2937'
        };margin-bottom:0;text-align:center;`;

        const loginButton: HTMLButtonElement = this.renderer.createElement('button');
        loginButton.textContent = 'Login';
        loginButton.style.cssText = `height:44px;padding:0 12px;background-color:#3f51b5;color:#ffffff;border:none;border-radius:${borderRadius};font-size:14px;font-weight:600;cursor:pointer;width:100%;box-shadow:0 1px 2px rgba(0,0,0,0.08);margin-top:4px;`;

        const onForgotPassword = (email: string) => this.showForgotPasswordForm(loginContainer, buttonsData, email);

        const logoUrl = selectWidgetTheme?.ui_preferences?.logo_url;
        const logoElement = this.domBuilder.createLogoElement(this.renderer, logoUrl);
        if (logoElement) {
            this.renderer.appendChild(loginContainer, logoElement);
        }
        this.renderer.appendChild(loginContainer, title);

        this.buildLoginFields(loginContainer, buttonsData, loginButton, borderRadius, primaryColor, onForgotPassword);
    }

    private buildLoginFields(
        loginContainer: HTMLElement,
        buttonsData: any,
        loginButton: HTMLButtonElement,
        borderRadius: string,
        primaryColor: string,
        onForgotPassword: (email: string) => void
    ): void {
        const isDark = this.themeService.isDark();
        const noteColor = this.version === 'v2' ? primaryColor : isDark ? '#e5e7eb' : '#5d6164';

        const usernameField: HTMLElement = this.renderer.createElement('div');
        usernameField.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

        const usernameInput: HTMLInputElement = this.renderer.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = 'Email or Mobile';
        usernameInput.autocomplete = 'off';
        usernameInput.style.cssText = `width:100%;height:44px;padding:0 16px;border:1px solid ${
            isDark ? '#ffffff' : '#cbd5e1'
        };border-radius:${borderRadius};background:${isDark ? 'transparent' : '#ffffff'};color:${
            isDark ? '#ffffff' : '#1f2937'
        };font-size:14px;outline:none;box-sizing:border-box;`;

        const usernameNote: HTMLElement = this.renderer.createElement('p');
        usernameNote.textContent = 'Note: Please enter your Mobile number with the country code (e.g. 91)';
        usernameNote.style.cssText = `font-size:12px;line-height:18px;color:${noteColor};margin:0;`;

        const passwordField: HTMLElement = this.renderer.createElement('div');
        passwordField.style.cssText = 'display:flex;flex-direction:column;gap:6px;position:relative;';

        const passwordInputWrapper: HTMLElement = this.renderer.createElement('div');
        passwordInputWrapper.style.cssText = 'position:relative;display:flex;align-items:center;';

        const passwordInput: HTMLInputElement = this.renderer.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Password';
        passwordInput.autocomplete = 'off';
        passwordInput.style.cssText = `width:100%;height:44px;padding:0 44px 0 16px;border:1px solid ${
            isDark ? '#ffffff' : '#cbd5e1'
        };border-radius:${borderRadius};background:${isDark ? 'transparent' : '#ffffff'};color:${
            isDark ? '#ffffff' : '#1f2937'
        };font-size:14px;outline:none;box-sizing:border-box;`;
        this.domBuilder.addPasswordVisibilityToggle(
            this.renderer,
            passwordInput,
            passwordInputWrapper,
            this.themeService.resolvedTheme()
        );
        this.renderer.appendChild(passwordInputWrapper, passwordInput);

        const hcaptchaWrapper: HTMLElement = this.renderer.createElement('div');
        hcaptchaWrapper.style.cssText =
            'width:100%;display:flex;justify-content:center;padding:8px 0;box-sizing:border-box;';
        const hcaptchaPlaceholder: HTMLElement = this.renderer.createElement('div');
        hcaptchaPlaceholder.style.cssText = `display:inline-block;border-radius:${borderRadius};`;
        this.renderer.appendChild(hcaptchaWrapper, hcaptchaPlaceholder);

        let hCaptchaToken = '';
        let hCaptchaWidgetId: any = null;

        const errorText: HTMLElement = this.domBuilder.createErrorElement(this.renderer);

        const forgotPasswordWrapper: HTMLElement = this.renderer.createElement('div');
        forgotPasswordWrapper.style.cssText = 'width:100%;display:flex;justify-content:flex-end;margin-top:4px;';
        const forgotPasswordLink: HTMLAnchorElement = this.renderer.createElement('a');
        forgotPasswordLink.href = 'javascript:void(0)';
        forgotPasswordLink.textContent = 'Forgot Password?';
        forgotPasswordLink.style.cssText = 'font-size:13px;font-weight:400;color:#1976d2;text-decoration:none;';
        forgotPasswordLink.addEventListener('click', () => onForgotPassword(usernameInput.value?.trim() || ''));
        this.renderer.appendChild(forgotPasswordWrapper, forgotPasswordLink);

        const resetHCaptcha = () => {
            const instance = this.getHCaptchaInstance();
            if (instance && hCaptchaWidgetId !== null && hCaptchaWidgetId !== undefined) {
                instance.reset(hCaptchaWidgetId);
            }
            hCaptchaToken = '';
        };

        const renderHCaptcha = () => {
            const instance = this.getHCaptchaInstance();
            if (!instance || !environment.hCaptchaSiteKey) {
                this.domBuilder.setInlineError(errorText, 'Unable to load hCaptcha. Please refresh and try again.');
                return;
            }
            hcaptchaPlaceholder.innerHTML = '';
            hCaptchaWidgetId = instance.render(hcaptchaPlaceholder, {
                sitekey: environment.hCaptchaSiteKey,
                theme: isDark ? WidgetTheme.Dark : WidgetTheme.Light,
                callback: (token: string) => {
                    hCaptchaToken = token;
                    this.domBuilder.setInlineError(errorText, '');
                },
                'expired-callback': () => {
                    hCaptchaToken = '';
                },
                'error-callback': () => {
                    hCaptchaToken = '';
                    this.domBuilder.setInlineError(errorText, 'hCaptcha verification failed. Please retry.');
                },
            });
        };

        this.ensureHCaptchaScriptLoaded(renderHCaptcha);

        const submit = () =>
            this.handlePasswordAuthenticationLogin(
                buttonsData,
                usernameInput,
                passwordInput,
                errorText,
                loginButton,
                () => hCaptchaToken,
                resetHCaptcha
            );

        loginButton.addEventListener('click', submit);
        [usernameInput, passwordInput].forEach((input) =>
            input.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    submit();
                }
            })
        );

        this.renderer.appendChild(usernameField, usernameInput);
        this.renderer.appendChild(usernameField, usernameNote);
        this.renderer.appendChild(passwordField, passwordInputWrapper);
        this.renderer.appendChild(loginContainer, usernameField);
        this.renderer.appendChild(loginContainer, passwordField);
        this.renderer.appendChild(loginContainer, forgotPasswordWrapper);
        this.renderer.appendChild(loginContainer, hcaptchaWrapper);
        this.renderer.appendChild(loginContainer, errorText);
        this.renderer.appendChild(loginContainer, loginButton);
    }

    private ensureHCaptchaScriptLoaded(onReady: () => void): void {
        if (this.getHCaptchaInstance()) {
            onReady();
            return;
        }

        this.hcaptchaRenderQueue.push(onReady);

        if (this.hcaptchaLoading) {
            return;
        }

        this.hcaptchaLoading = true;
        const script = this.renderer.createElement('script');
        script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            this.hcaptchaLoading = false;
            const queued = [...this.hcaptchaRenderQueue];
            this.hcaptchaRenderQueue = [];
            queued.forEach((cb) => cb());
        };
        script.onerror = () => {
            this.hcaptchaLoading = false;
            this.hcaptchaRenderQueue = [];
        };
        this.renderer.appendChild(document.head, script);
    }

    private getHCaptchaInstance(): any {
        return (window as any)?.hcaptcha;
    }

    private encryptPassword(password: string): string {
        return this.otpUtilityService.aesEncrypt(
            JSON.stringify(password),
            environment.uiEncodeKey,
            environment.uiIvKey,
            true
        );
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

    private appendButton(element, buttonsData): void {
        if (this.showSkeleton) {
            this.showSkeleton = false;
            this.domBuilder.removeSkeletonLoader(this.renderer, element);
        }

        const selectWidgetTheme = this.widgetTheme() as any;
        const borderRadius = this.getBorderRadiusCssValue(selectWidgetTheme?.ui_preferences?.border_radius);

        const button: HTMLButtonElement = this.renderer.createElement('button');
        const image: HTMLImageElement = this.renderer.createElement('img');

        const isOtpButton = buttonsData?.service_id === FeatureServiceIds.Msg91OtpService;
        const useDiv = this.version !== 'v1';
        const showIconsOnly = this.show_social_login_icons;
        const isInputFieldsTop = this.input_fields === 'top';

        // If showing icons only, set up a row container if not already present
        if (showIconsOnly) {
            let iconsContainer = element.querySelector('[data-icons-container]');
            if (!iconsContainer) {
                iconsContainer = this.renderer.createElement('div');
                iconsContainer.setAttribute('data-icons-container', 'true');
                iconsContainer.style.cssText = `
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    gap: 35px;
                    margin: 8px 8px 16px 8px;
                    width: 316px;
                `;
                // Position icons container based on input_fields
                if (isInputFieldsTop) {
                    // input_fields = 'top': Login form at top, social icons at bottom
                    this.renderer.appendChild(element, iconsContainer);
                } else {
                    // input_fields = 'bottom': Social icons at top, login form at bottom
                    const orDivider = element.querySelector('[data-or-divider]');
                    if (orDivider) {
                        this.renderer.insertBefore(element, iconsContainer, orDivider);
                    } else if (element.firstChild) {
                        this.renderer.insertBefore(element, iconsContainer, element.firstChild);
                    } else {
                        this.renderer.appendChild(element, iconsContainer);
                    }
                }
            }

            button.setAttribute('data-paw-button', 'true');
            button.setAttribute('data-paw-icon-only', 'true');
            button.style.cssText = `
                outline: none;
                padding: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                background-color: transparent;
                border: ${this.themeService.isDark() ? '1px solid #ffffff' : '1px solid #d1d5db'};
                border-radius: ${borderRadius};
                cursor: pointer;
                visibility: ${isOtpButton ? 'hidden' : 'visible'};
            `;
            const invertIcon = this.shouldInvertIcon(buttonsData);
            image.style.cssText = `
                height: 24px;
                width: 24px;
                ${invertIcon ? 'filter: invert(1);' : ''}
            `;
            image.src = buttonsData.icon;
            image.alt = buttonsData.text;
            image.loading = 'lazy';

            if (isOtpButton) {
                button.setAttribute('data-service-id', buttonsData.service_id);
            }
            button.addEventListener('click', () => {
                if (buttonsData?.urlLink) {
                    window.open(buttonsData.urlLink, this.target);
                } else if (buttonsData?.service_id === FeatureServiceIds.Msg91OtpService) {
                    this.otpWidgetService.openWidget();
                } else if (buttonsData?.service_id === FeatureServiceIds.PasswordAuthentication) {
                    this.setShowLogin(true);
                }
            });

            this.renderer.appendChild(button, image);
            this.renderer.appendChild(iconsContainer, button);
        } else {
            const span: HTMLSpanElement = this.renderer.createElement('span');

            button.setAttribute('data-paw-button', 'true');
            button.style.cssText = `
                outline: none;
                padding: 0 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                ${useDiv ? '' : 'gap: 12px;'}
                font-size: 14px;
                background-color: transparent;
                border: ${this.themeService.isDark() ? '1px solid #ffffff' : '1px solid #000000'};
                border-radius: ${borderRadius};
                height: 44px;
                color: ${this.themeService.isDark() ? '#ffffff' : '#111827'};
                margin: 8px 8px 16px 8px;
                cursor: pointer;
                width: ${useDiv ? '316px' : '260px'};
                visibility: ${isOtpButton ? 'hidden' : 'visible'}; // Hide only OTP buttons until ready
            `;
            const invertIcon = this.shouldInvertIcon(buttonsData);
            image.style.cssText = `
                height: 20px;
                width: 20px;
                ${invertIcon ? 'filter: invert(1);' : ''}
            `;
            span.style.cssText = `
                color: ${this.themeService.isDark() ? '#ffffff' : '#111827'};
                font-weight: 600;
            `;
            image.src = buttonsData.icon;
            image.alt = buttonsData.text;
            image.loading = 'lazy';
            span.innerText = buttonsData.text;

            if (isOtpButton) {
                button.setAttribute('data-service-id', buttonsData.service_id);
            }
            button.addEventListener('click', () => {
                if (buttonsData?.urlLink) {
                    window.open(buttonsData.urlLink, this.target);
                } else if (buttonsData?.service_id === FeatureServiceIds.Msg91OtpService) {
                    this.otpWidgetService.openWidget();
                } else if (buttonsData?.service_id === FeatureServiceIds.PasswordAuthentication) {
                    this.setShowLogin(true);
                }
            });

            if (useDiv) {
                const contentDiv: HTMLDivElement = this.renderer.createElement('div');
                contentDiv.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 12px;
                `;
                this.renderer.appendChild(contentDiv, image);
                this.renderer.appendChild(contentDiv, span);
                this.renderer.appendChild(button, contentDiv);
            } else {
                this.renderer.appendChild(button, image);
                this.renderer.appendChild(button, span);
            }

            // Position button based on input_fields
            if (isInputFieldsTop) {
                // input_fields = 'top': Login form at top, social buttons at bottom
                this.renderer.appendChild(element, button);
            } else {
                // input_fields = 'bottom': Social buttons at top, login form at bottom
                const orDivider = element.querySelector('[data-or-divider]');
                if (orDivider) {
                    this.renderer.insertBefore(element, button, orDivider);
                } else if (element.firstChild) {
                    this.renderer.insertBefore(element, button, element.firstChild);
                } else {
                    this.renderer.appendChild(element, button);
                }
            }
        }
    }

    private hasOtpButton(widgetDataArray: any[]): boolean {
        return widgetDataArray.some((widget) => widget?.service_id === FeatureServiceIds.Msg91OtpService);
    }

    private appendCreateAccountText(element): void {
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

        const paragraph: HTMLParagraphElement = this.renderer.createElement('p');
        const link: HTMLAnchorElement = this.renderer.createElement('a');

        paragraph.setAttribute('data-create-account', 'true');

        paragraph.style.cssText = `
    margin: 20px 8px 8px 8px !important;
    font-size: 14px !important;
    outline: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    color: ${primaryColor} !important;
    cursor: pointer !important;
    width: ${this.version === 'v1' ? '260px' : '316px'} !important;
`;

        link.style.cssText = `
    color: #007bff !important;
    text-decoration: none !important;
    cursor: pointer !important;
    font-weight: 500 !important;
`;

        // Set the text content
        paragraph.innerHTML = 'Are you a new user? ';
        link.textContent = selectWidgetTheme?.ui_preferences?.sign_up_button_text || 'Create an account';

        // Add click event to the link
        link.addEventListener('click', (event) => {
            event.preventDefault();
            this.cameFromLogin = false; // Set flag to indicate user came from dynamically appended buttons
            this.cameFromSendOtpCenter = false; // Reset other flags
            this.setShowRegistration(true);
        });

        // Append elements
        this.renderer.appendChild(paragraph, link);
        this.renderer.appendChild(element, paragraph);
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

    private reapplyInjectedButtonTheme(dark: boolean): void {
        const container = this.referenceElement;
        if (!container) return;

        const selectWidgetTheme = this.widgetTheme() as any;
        const primaryColor = this.getPrimaryColorForCurrentTheme(selectWidgetTheme?.ui_preferences);
        const textColor = dark ? '#ffffff' : '#111827';
        const border = dark ? '1px solid #ffffff' : '1px solid #000000';
        const borderIconOnly = dark ? '1px solid #ffffff' : '1px solid #d1d5db';

        container.querySelectorAll<HTMLButtonElement>('button[data-paw-button]').forEach((btn) => {
            const isIconOnly = btn.hasAttribute('data-paw-icon-only');
            if (isIconOnly) {
                btn.style.border = borderIconOnly;
            } else {
                btn.style.border = border;
                btn.style.color = textColor;
                const span = btn.querySelector<HTMLSpanElement>('span');
                if (span) span.style.color = textColor;
                const img = btn.querySelector<HTMLImageElement>('img');
                if (img) {
                    const isApple = img.alt?.toLowerCase().includes('apple');
                    const isPassword = btn.dataset['serviceId'] === String(FeatureServiceIds.PasswordAuthentication);
                    img.style.filter = dark && (isApple || isPassword) ? 'invert(1)' : '';
                }
            }
        });

        const createAccountP = container.querySelector<HTMLParagraphElement>('p[data-create-account="true"]');
        if (createAccountP) {
            createAccountP.style.setProperty('color', primaryColor, 'important');
        }
    }

    private shouldInvertIcon(buttonsData: any): boolean {
        const isApple = buttonsData?.text?.toLowerCase()?.includes('apple');
        const isPassword = buttonsData?.service_id === FeatureServiceIds.PasswordAuthentication;
        return this.themeService.isDark() && (isApple || isPassword);
    }
}
