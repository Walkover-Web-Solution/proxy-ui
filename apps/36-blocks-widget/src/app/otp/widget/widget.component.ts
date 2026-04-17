import { OtpService } from './../service/otp.service';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../ui/progress-bar.component';
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

import { getSubscriptionPlans, getWidgetData, resetAll, upgradeSubscription } from '../store/actions/otp.action';
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

const THEME_COLORS = {
    dark: {
        buttonText: '#ffffff',
        buttonBorder: '1px solid #ffffff',
        buttonBorderIconOnly: '1px solid #ffffff',
        poweredByLabel: '#9ca3af',
        logoText: '#F8F8F8',
        primaryColorFallback: '#FFFFFF',
    },
    light: {
        buttonText: '#111827',
        buttonBorder: '1px solid #000000',
        buttonBorderIconOnly: '1px solid #d1d5db',
        poweredByLabel: '#6b7280',
        logoText: '#1a1a1a',
        primaryColorFallback: '#000000',
    },
} as const;

@Component({
    selector: 'proxy-auth-widget',
    imports: [
        CommonModule,
        ProgressBarComponent,
        SubscriptionCenterComponent,
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

    @ViewChild('buttonContainer') private buttonContainerEl?: ElementRef<HTMLElement>;
    @ViewChild('dialogPortal') private dialogPortalEl?: ElementRef<HTMLElement>;
    private dialogPortalRef: WidgetPortalRef | null = null;
    private readonly widgetPortal = inject(WidgetPortalService);

    public readonly show = signal<boolean>(false);
    public readonly showRegistration = signal<boolean>(false);
    public readonly showForgotPassword = signal<boolean>(false);
    public readonly animate = signal<boolean>(false);

    public readonly forgotPasswordStep = signal<1 | 2>(1);
    public readonly forgotPasswordPrefillEmail = signal<string>('');
    public readonly forgotPasswordUser = signal<string>('');
    public readonly forgotPasswordLoading = signal<boolean>(false);
    public readonly forgotPasswordError = signal<string>('');
    public readonly forgotPasswordResendSeconds = signal<number>(0);
    private forgotPasswordResendTimer: any = null;
    public isCreateAccountTextAppended: boolean = false;
    public otpWidgetData;
    public loginWidgetData;
    public registrationViaLogin: boolean = true;
    public prefillDetails: string;
    public cameFromLogin: boolean = false;
    public referenceElement: HTMLElement = null;
    public subscriptionPlans: any[] = [];

    private readonly cdr = inject(ChangeDetectorRef);
    private readonly elementRef = inject(ElementRef);

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

        // Add/remove remove-height class based on viewMode
        effect(() => {
            const currentViewMode = this.viewMode();
            const hostElement = this.elementRef.nativeElement as HTMLElement;
            if (!hostElement) return;

            if (currentViewMode !== PublicScriptType.Authorization) {
                this.renderer.setStyle(hostElement, 'height', 'inherit !important');
            } else {
                this.renderer.removeStyle(hostElement, 'height');
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['authToken']) this._authToken$.set(this.authToken);
        if (changes['type']) this._type$.set(this.type);
        if (changes['theme']) this.themeService.setInputTheme(this.theme);
    }

    ngOnInit() {
        this.store.dispatch(resetAll());
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
        if (this.type === PublicScriptType.Authorization) {
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

        // Clean up subscription plans if using external container (Subscription mode)
        if (this.referenceElement && this.type === PublicScriptType.Subscription) {
            this.clearSubscriptionPlans(this.referenceElement);
        }

        // Clean up internal button container for Authorization mode
        if (this.buttonContainerEl?.nativeElement && this.type === PublicScriptType.Authorization) {
            const container = this.buttonContainerEl.nativeElement;
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }

        super.ngOnDestroy();
    }

    public closeOverlayDialog(): void {
        this.dialogPortalRef?.detach();
        this.dialogPortalRef = null;
        if (this.forgotPasswordResendTimer) {
            clearInterval(this.forgotPasswordResendTimer);
            this.forgotPasswordResendTimer = null;
        }
        this.ngZone.run(() => {
            this.showRegistration.set(false);
            this.showForgotPassword.set(false);
            this.otpWidgetService.openLogin(false);
            this.otpWidgetService.closeForgotPassword();
            // For Authorization mode with internal container, always close
            if (this.type === PublicScriptType.Authorization || this.referenceElement) {
                this.show.set(false);
            }
            this.cameFromLogin = false;
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
        // Check if external container exists (for backward compatibility)
        this.referenceElement = document.getElementById(this.referenceId);

        // For Authorization mode, always use internal button container
        if (this.type === PublicScriptType.Authorization) {
            this.setShowLogin(false);
            this.isUserProxyContainer = true;
            this.show.set(false);
            this.animate.set(false);
            this.createAccountTextAppended = false;

            if (intial) {
                // Use internal button container
                setTimeout(() => {
                    const containerElement = this.buttonContainerEl?.nativeElement;
                    if (containerElement) {
                        this.showSkeleton = true;
                        this.domBuilder.appendSkeletonLoader(
                            this.renderer,
                            containerElement,
                            this.themeService.isDark()
                        );
                        this.addButtonsToReferenceElement(containerElement);

                        setTimeout(() => {
                            if (this.showSkeleton) {
                                this.showSkeleton = false;
                                this.domBuilder.forceRemoveAllSkeletonLoaders(this.renderer, containerElement);
                            }
                        }, 10000);
                    }
                }, 0);
            }
        } else if (this.type === PublicScriptType.Subscription) {
            // Subscription mode
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

                if (intial && !this.isPreview && this.referenceElement) {
                    this.appendSubscriptionButton(this.referenceElement);
                }
            }
        } else {
            // Other modes (UserManagement, OrganizationDetails, UserProfile)
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
                    this.domBuilder.appendSkeletonLoader(this.renderer, element, this.themeService.isDark());
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

        const loginContainer: HTMLElement = this.renderer.createElement('div');
        loginContainer.style.cssText = `width:316px;max-width:100%;padding:0;margin:0 8px 16px 8px;display:flex;flex-direction:column;gap:8px;box-sizing:border-box;font-family:'Inter',sans-serif;border-radius:${borderRadius};`;

        const title: HTMLElement = this.renderer.createElement('div');
        title.textContent = selectWidgetTheme?.ui_preferences?.title;
        title.style.cssText = `font-size:16px;line-height:20px;font-weight:600;color:${primaryColor};margin:0 8px 20px 8px;text-align:center;width:316px;max-width:100%;`;

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
        this.ngZone.run(() => {
            this.forgotPasswordStep.set(1);
            this.forgotPasswordPrefillEmail.set(prefillEmail);
            this.forgotPasswordUser.set('');
            this.forgotPasswordLoading.set(false);
            this.forgotPasswordError.set('');
            this.forgotPasswordResendSeconds.set(0);
            this.showForgotPassword.set(true);
            this.cdr.detectChanges();
            setTimeout(() => {
                if (this.dialogPortalEl?.nativeElement && !this.dialogPortalRef) {
                    this.dialogPortalRef = this.widgetPortal.attach(this.dialogPortalEl.nativeElement);
                    this.dialogPortalRef.onDetach(() => {
                        this.dialogPortalRef = null;
                        this.closeForgotPasswordDialog();
                    });
                }
            });
        });
    }

    public closeForgotPasswordDialog(): void {
        if (this.forgotPasswordResendTimer) {
            clearInterval(this.forgotPasswordResendTimer);
            this.forgotPasswordResendTimer = null;
        }
        this.showForgotPassword.set(false);
        this.forgotPasswordError.set('');
        this.cdr.detectChanges();
    }

    public goToForgotPasswordStep1(): void {
        this.forgotPasswordStep.set(1);
        this.forgotPasswordError.set('');
    }

    public sendForgotPasswordOtp(emailValue: string, buttonsData: any): void {
        const userDetails = emailValue?.trim();
        if (!userDetails) {
            this.forgotPasswordError.set('Email or Mobile is required.');
            return;
        }
        this.forgotPasswordError.set('');
        this.forgotPasswordLoading.set(true);
        const payload = { state: buttonsData?.state || this.loginWidgetData?.state, user: userDetails };
        this.otpService.resetPassword(payload).subscribe(
            (res) => {
                this.forgotPasswordLoading.set(false);
                if (res?.hasError) {
                    this.forgotPasswordError.set(res?.errors?.[0] || 'Unable to send OTP. Please try again.');
                    return;
                }
                this.forgotPasswordUser.set(userDetails);
                this.forgotPasswordStep.set(2);
                this.forgotPasswordError.set('');
                this.startForgotPasswordResendTimer();
            },
            (error) => {
                this.forgotPasswordLoading.set(false);
                this.forgotPasswordError.set(error?.error?.errors?.[0] || 'Failed to send OTP. Please try again.');
            }
        );
    }

    public resendForgotPasswordOtp(buttonsData: any): void {
        if (this.forgotPasswordResendSeconds() > 0) return;
        const payload = { state: buttonsData?.state || this.loginWidgetData?.state, user: this.forgotPasswordUser() };
        this.otpService.resetPassword(payload).subscribe(
            (res) => {
                if (!res?.hasError) {
                    this.startForgotPasswordResendTimer();
                }
            },
            () => {}
        );
    }

    private startForgotPasswordResendTimer(): void {
        if (this.forgotPasswordResendTimer) clearInterval(this.forgotPasswordResendTimer);
        this.forgotPasswordResendSeconds.set(15);
        this.forgotPasswordResendTimer = setInterval(() => {
            const remainingSeconds = this.forgotPasswordResendSeconds() - 1;
            if (remainingSeconds <= 0) {
                clearInterval(this.forgotPasswordResendTimer);
                this.forgotPasswordResendTimer = null;
                this.forgotPasswordResendSeconds.set(0);
            } else {
                this.forgotPasswordResendSeconds.set(remainingSeconds);
            }
        }, 1000);
    }

    public submitForgotPasswordChange(otp: string, password: string, confirmPassword: string, buttonsData: any): void {
        const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!otp?.trim()) {
            this.forgotPasswordError.set('OTP is required.');
            return;
        }
        if (!password) {
            this.forgotPasswordError.set('Password is required.');
            return;
        }
        if (password.length < 8) {
            this.forgotPasswordError.set('Password must be at least 8 characters.');
            return;
        }
        if (!PASSWORD_REGEX.test(password)) {
            this.forgotPasswordError.set(
                'Password should contain at least one Capital Letter, one Small Letter, one Digit and one Symbol.'
            );
            return;
        }
        if (password !== confirmPassword) {
            this.forgotPasswordError.set('Passwords do not match.');
            return;
        }
        this.forgotPasswordError.set('');
        this.forgotPasswordLoading.set(true);
        const encodedPassword = this.encryptPassword(password);
        const payload = {
            state: buttonsData?.state || this.loginWidgetData?.state,
            user: this.forgotPasswordUser(),
            password: encodedPassword,
            otp: parseInt(otp, 10),
        };
        this.otpService.verfyResetPasswordOtp(payload).subscribe(
            (res) => {
                this.forgotPasswordLoading.set(false);
                if (res?.hasError) {
                    this.forgotPasswordError.set(res?.errors?.[0] || 'Unable to reset password. Please try again.');
                    return;
                }
                if (this.forgotPasswordResendTimer) {
                    clearInterval(this.forgotPasswordResendTimer);
                    this.forgotPasswordResendTimer = null;
                }
                this.closeForgotPasswordDialog();
            },
            (error) => {
                this.forgotPasswordLoading.set(false);
                this.forgotPasswordError.set(
                    error?.error?.errors?.[0] || 'Failed to reset password. Please try again.'
                );
            }
        );
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
                    max-width:100%;
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

            if (buttonsData?.service_id) {
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
                width: 316px;
                max-width:100%;
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
                text-align: left;
                min-width: 170px
            `;
            image.src = buttonsData.icon;
            image.alt = buttonsData.text;
            image.loading = 'lazy';
            span.innerText = buttonsData.text;

            if (buttonsData?.service_id) {
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
        const span: HTMLSpanElement = this.renderer.createElement('span');
        const link: HTMLAnchorElement = this.renderer.createElement('a');

        paragraph.setAttribute('data-create-account', 'true');

        paragraph.style.cssText = `
            margin: 20px 8px 8px 8px !important;
            font-size: 14px !important;
            outline: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-wrap: wrap;
            gap: 8px !important;
            color: ${primaryColor} !important;
            cursor: pointer !important;
            width: 316px !important;
            max-width:100%;
        `;

        // Style the link
        link.style.cssText = `
            color: #007bff !important;
            text-decoration: none;
            cursor: pointer;
            font-weight: 500 !important;
        `;

        // Set the text content
        span.textContent = 'Are you a new user? ';
        link.textContent = selectWidgetTheme?.ui_preferences?.sign_up_button_text || 'Create an account';

        // Add click event to the link
        link.addEventListener('click', (event) => {
            event.preventDefault();
            this.cameFromLogin = false; // Set flag to indicate user came from dynamically appended buttons
            this.setShowRegistration(true);
        });

        // Append elements
        this.renderer.appendChild(paragraph, span);
        this.renderer.appendChild(paragraph, link);
        this.renderer.appendChild(element, paragraph);

        // Powered by footer
        const poweredBy: HTMLParagraphElement = this.renderer.createElement('a');
        poweredBy.setAttribute('href', 'https://36blocks.com');
        poweredBy.setAttribute('target', '_blank');
        poweredBy.setAttribute('rel', 'noopener noreferrer');
        poweredBy.setAttribute('data-powered-by', 'true');
        poweredBy.style.cssText = `
            margin: 12px 8px 12px 8px !important;
            font-size: 11px !important;
            font-family: inherit !important;
            line-height: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 4px !important;
            color: ${this.themeService.isDark() ? THEME_COLORS.dark.poweredByLabel : THEME_COLORS.light.poweredByLabel} !important;
            width: 316px !important;
            max-width:100%;
        `;

        const poweredByText = this.renderer.createText('Powered by');
        const logoSpan: HTMLSpanElement = this.renderer.createElement('span');
        logoSpan.style.cssText = `
            display: inline-flex !important;
            align-items: center !important;
            height: 14px !important;
        `;
        const logoTextColor = this.themeService.isDark() ? THEME_COLORS.dark.logoText : THEME_COLORS.light.logoText;
        logoSpan.innerHTML = `<svg width="262" height="48" viewBox="0 0 262 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="height:14px;width:auto;display:block;"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.450714 22.9193L23.0465 0.448227C23.6475 -0.149409 24.6215 -0.149409 25.2224 0.448227L30 5.19941L34.7775 0.448227C35.3785 -0.149409 36.3525 -0.149409 36.9535 0.448227L59.5493 22.9193C60.1502 23.517 60.1502 24.4856 59.5493 25.0832L36.9535 47.5518C36.3525 48.1494 35.3785 48.1494 34.7775 47.5518L30 42.8006L25.2224 47.5518C24.6215 48.1494 23.6475 48.1494 23.0465 47.5518L0.450714 25.0807C-0.150238 24.4855 -0.150238 23.5145 0.450714 22.9193ZM32.1759 7.36358L47.8179 22.9193C48.4189 23.517 48.4189 24.4856 47.8179 25.0832L32.1759 40.639L35.8667 44.3094L56.2863 24.0026L35.8667 3.69318L32.1759 7.36358ZM12.1819 22.9193L27.824 7.36358L24.1332 3.69312L3.71361 24L24.1332 44.3068L27.824 40.6363L12.1819 25.0806C11.581 24.4855 11.581 23.5145 12.1819 22.9193ZM30.0003 9.52463L15.4447 23.9998L30.0003 38.475L44.5558 23.9998L30.0003 9.52463Z" fill="#5DD62C"/><path d="M88.868 39.94C86.8733 39.94 85.0547 39.5733 83.412 38.84C81.7987 38.0773 80.4347 36.9773 79.32 35.54L82.136 32.724C82.8107 33.7507 83.7347 34.572 84.908 35.188C86.0813 35.7747 87.3867 36.068 88.824 36.068C90.1733 36.068 91.332 35.8187 92.3 35.32C93.2973 34.792 94.0747 34.0587 94.632 33.12C95.2187 32.1813 95.512 31.096 95.512 29.864C95.512 28.6027 95.2187 27.5173 94.632 26.608C94.0747 25.6693 93.2827 24.9507 92.256 24.452C91.2293 23.9533 90.012 23.704 88.604 23.704C88.076 23.704 87.548 23.748 87.02 23.836C86.492 23.8947 85.9787 23.9973 85.48 24.144L87.24 21.768C87.7973 21.504 88.3987 21.2987 89.044 21.152C89.6893 21.0053 90.3347 20.932 90.98 20.932C92.6227 20.932 94.0893 21.3133 95.38 22.076C96.7 22.8387 97.7413 23.9093 98.504 25.288C99.296 26.6667 99.692 28.2653 99.692 30.084C99.692 32.02 99.2227 33.736 98.284 35.232C97.3747 36.6987 96.1133 37.8573 94.5 38.708C92.8867 39.5293 91.0093 39.94 88.868 39.94ZM85.48 24.144V21.636L94.412 11.472L99.34 11.428L90.144 21.856L85.48 24.144ZM80.772 12.66V8.964H99.34V11.428L95.732 12.66H80.772ZM115.844 39.94C113.82 39.94 112.001 39.4707 110.388 38.532C108.804 37.5933 107.542 36.332 106.604 34.748C105.665 33.164 105.196 31.404 105.196 29.468C105.196 26.7693 106.134 24.0853 108.012 21.416L116.988 8.964H121.784L112.588 21.504L111.092 22.296C111.444 21.68 111.869 21.1667 112.368 20.756C112.866 20.316 113.482 19.9787 114.216 19.744C114.949 19.5093 115.814 19.392 116.812 19.392C118.601 19.392 120.214 19.8173 121.652 20.668C123.118 21.5187 124.292 22.692 125.172 24.188C126.081 25.6547 126.536 27.3707 126.536 29.336C126.536 31.272 126.052 33.0467 125.084 34.66C124.145 36.2733 122.854 37.564 121.212 38.532C119.598 39.4707 117.809 39.94 115.844 39.94ZM115.844 36.068C117.076 36.068 118.176 35.7747 119.144 35.188C120.141 34.572 120.918 33.7653 121.476 32.768C122.062 31.7413 122.356 30.5973 122.356 29.336C122.356 28.0747 122.062 26.9453 121.476 25.948C120.918 24.9213 120.141 24.1147 119.144 23.528C118.176 22.9413 117.076 22.648 115.844 22.648C114.612 22.648 113.497 22.9413 112.5 23.528C111.532 24.1147 110.754 24.9213 110.168 25.948C109.61 26.9453 109.332 28.0747 109.332 29.336C109.332 30.5973 109.61 31.7413 110.168 32.768C110.754 33.7947 111.532 34.6013 112.5 35.188C113.497 35.7747 114.612 36.068 115.844 36.068ZM136.412 39.5V35.892H145.652C147.412 35.892 148.79 35.3787 149.788 34.352C150.785 33.296 151.284 32.0347 151.284 30.568C151.284 29.5707 151.064 28.676 150.624 27.884C150.184 27.0627 149.538 26.4173 148.688 25.948C147.866 25.4787 146.898 25.244 145.784 25.244H136.412V21.636H145.168C146.634 21.636 147.793 21.2547 148.644 20.492C149.524 19.7 149.964 18.5707 149.964 17.104C149.964 15.6373 149.509 14.5227 148.6 13.76C147.69 12.968 146.488 12.572 144.992 12.572H136.412V8.964H145.08C147.074 8.964 148.732 9.33067 150.052 10.064C151.401 10.768 152.413 11.7067 153.088 12.88C153.792 14.0533 154.144 15.344 154.144 16.752C154.144 18.3947 153.689 19.832 152.78 21.064C151.9 22.296 150.594 23.264 148.864 23.968L149.216 22.648C151.181 23.352 152.706 24.4227 153.792 25.86C154.906 27.268 155.464 28.94 155.464 30.876C155.464 32.4893 155.068 33.9413 154.276 35.232C153.484 36.5227 152.34 37.564 150.844 38.356C149.377 39.1187 147.573 39.5 145.432 39.5H136.412ZM133.64 39.5V8.964H137.776V39.5H133.64ZM162.11 39.5V8.084H166.07V39.5H162.11ZM183.172 39.94C181.118 39.94 179.27 39.456 177.628 38.488C175.985 37.52 174.68 36.2147 173.712 34.572C172.744 32.9 172.26 31.0373 172.26 28.984C172.26 26.96 172.744 25.1413 173.712 23.528C174.68 21.8853 175.985 20.58 177.628 19.612C179.27 18.644 181.118 18.16 183.172 18.16C185.196 18.16 187.029 18.644 188.672 19.612C190.344 20.5507 191.664 21.8413 192.632 23.484C193.6 25.1267 194.084 26.96 194.084 28.984C194.084 31.0373 193.6 32.9 192.632 34.572C191.664 36.2147 190.344 37.52 188.672 38.488C187.029 39.456 185.196 39.94 183.172 39.94ZM183.172 36.112C184.492 36.112 185.665 35.804 186.692 35.188C187.718 34.572 188.525 33.736 189.112 32.68C189.698 31.5947 189.992 30.3627 189.992 28.984C189.992 27.6347 189.684 26.432 189.068 25.376C188.481 24.32 187.674 23.4987 186.648 22.912C185.65 22.296 184.492 21.988 183.172 21.988C181.852 21.988 180.678 22.296 179.652 22.912C178.625 23.4987 177.818 24.32 177.232 25.376C176.645 26.432 176.352 27.6347 176.352 28.984C176.352 30.3627 176.645 31.5947 177.232 32.68C177.818 33.736 178.625 34.572 179.652 35.188C180.678 35.804 181.852 36.112 183.172 36.112ZM209.854 39.94C207.8 39.94 205.938 39.456 204.266 38.488C202.623 37.52 201.318 36.2147 200.35 34.572C199.411 32.9 198.942 31.052 198.942 29.028C198.942 26.9747 199.411 25.1267 200.35 23.484C201.318 21.8413 202.623 20.5507 204.266 19.612C205.938 18.644 207.8 18.16 209.854 18.16C211.467 18.16 212.963 18.468 214.342 19.084C215.72 19.6707 216.908 20.536 217.906 21.68L215.266 24.32C214.62 23.5573 213.828 22.9853 212.89 22.604C211.98 22.1933 210.968 21.988 209.854 21.988C208.534 21.988 207.36 22.296 206.334 22.912C205.307 23.4987 204.5 24.32 203.914 25.376C203.327 26.432 203.034 27.6493 203.034 29.028C203.034 30.4067 203.327 31.624 203.914 32.68C204.5 33.736 205.307 34.572 206.334 35.188C207.36 35.804 208.534 36.112 209.854 36.112C210.968 36.112 211.98 35.9213 212.89 35.54C213.828 35.1293 214.635 34.5427 215.31 33.78L217.906 36.42C216.938 37.5347 215.75 38.4 214.342 39.016C212.963 39.632 211.467 39.94 209.854 39.94ZM236.969 39.5L227.201 28.808L236.881 18.6H241.677L230.897 29.864L231.073 27.576L242.073 39.5H236.969ZM223.593 39.5V8.084H227.553V39.5H223.593ZM252.665 39.94C251.492 39.94 250.377 39.7933 249.321 39.5C248.294 39.1773 247.341 38.7373 246.461 38.18C245.581 37.5933 244.818 36.904 244.173 36.112L246.725 33.56C247.488 34.4987 248.368 35.2027 249.365 35.672C250.362 36.112 251.477 36.332 252.709 36.332C253.941 36.332 254.894 36.1267 255.569 35.716C256.244 35.276 256.581 34.6747 256.581 33.912C256.581 33.1493 256.302 32.5627 255.745 32.152C255.217 31.712 254.528 31.36 253.677 31.096C252.826 30.8027 251.917 30.524 250.949 30.26C250.01 29.9667 249.116 29.6 248.265 29.16C247.414 28.72 246.71 28.1187 246.153 27.356C245.625 26.5933 245.361 25.5813 245.361 24.32C245.361 23.0587 245.669 21.9733 246.285 21.064C246.901 20.1253 247.752 19.4067 248.837 18.908C249.952 18.4093 251.286 18.16 252.841 18.16C254.484 18.16 255.936 18.4533 257.197 19.04C258.488 19.5973 259.544 20.448 260.365 21.592L257.813 24.144C257.226 23.3813 256.493 22.7947 255.613 22.384C254.762 21.9733 253.794 21.768 252.709 21.768C251.565 21.768 250.685 21.9733 250.069 22.384C249.482 22.7653 249.189 23.308 249.189 24.012C249.189 24.716 249.453 25.2587 249.981 25.64C250.509 26.0213 251.198 26.344 252.049 26.608C252.929 26.872 253.838 27.1507 254.777 27.444C255.716 27.708 256.61 28.0747 257.461 28.544C258.312 29.0133 259.001 29.644 259.529 30.436C260.086 31.228 260.365 32.2693 260.365 33.56C260.365 35.5253 259.661 37.08 258.253 38.224C256.874 39.368 255.012 39.94 252.665 39.94Z" fill="${logoTextColor}"/></svg>`;

        this.renderer.appendChild(poweredBy, poweredByText);
        this.renderer.appendChild(poweredBy, logoSpan);
        this.renderer.appendChild(element, poweredBy);
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
                    } else {
                        // If user came from dynamically appended buttons, just close without opening anything
                        this.setShowLogin(false);
                        this.show.set(false);
                    }
                    // Reset the flags
                    this.cameFromLogin = false;
                }
            } else {
                this.setShowLogin(false);
                // For Authorization mode with internal container, or external container modes
                if (this.type === PublicScriptType.Authorization || this.referenceElement) {
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
                    this.dialogPortalRef.onDetach(() => {
                        this.dialogPortalRef = null;
                        this.closeOverlayDialog();
                    });
                }
            }
        });
    }
    public setShowLogin(value: boolean) {
        this.ngZone.run(() => {
            // For Authorization mode with internal container, or external container modes
            if (this.type === PublicScriptType.Authorization || this.referenceElement) {
                this.show.set(value);
            }
            this.otpWidgetService.openLogin(value);
            if (value) {
                this.cdr.detectChanges();
                if (this.dialogPortalEl?.nativeElement && !this.dialogPortalRef) {
                    this.dialogPortalRef = this.widgetPortal.attach(this.dialogPortalEl.nativeElement);
                    this.dialogPortalRef.onDetach(() => {
                        this.dialogPortalRef = null;
                        this.closeOverlayDialog();
                    });
                }
            } else {
                this.dialogPortalRef?.detach();
                this.dialogPortalRef = null;
            }
        });
    }

    public setShowRegistrationFromLogin(data?: string) {
        this.cameFromLogin = true; // Set flag to track that user came from login
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
        const colors = dark ? THEME_COLORS.dark : THEME_COLORS.light;
        const textColor = colors.buttonText;
        const border = colors.buttonBorder;
        const borderIconOnly = colors.buttonBorderIconOnly;

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

        const poweredByP = container.querySelector<HTMLParagraphElement>('p[data-powered-by="true"]');
        if (poweredByP) {
            poweredByP.style.setProperty('color', colors.poweredByLabel, 'important');
            const textPath = poweredByP.querySelector<SVGPathElement>('svg path:last-child');
            if (textPath) {
                textPath.setAttribute('fill', colors.logoText);
            }
        }
    }

    private shouldInvertIcon(buttonsData: any): boolean {
        const isApple = buttonsData?.text?.toLowerCase()?.includes('apple');
        const isPassword = buttonsData?.service_id === FeatureServiceIds.PasswordAuthentication;
        return this.themeService.isDark() && (isApple || isPassword);
    }
}
