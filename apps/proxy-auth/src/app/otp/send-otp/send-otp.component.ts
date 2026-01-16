import { OtpService } from './../service/otp.service';
import { NgStyle } from '@angular/common';
import { Component, Input, NgZone, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { META_TAG_ID } from '@proxy/constant';
import { BaseComponent } from '@proxy/ui/base-component';
import { select, Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, skip, take, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

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
import { OtpUtilityService } from '../service/otp-utility.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SubscriptionCenterComponent } from '../component/subscription-center/subscription-center.component';
import { environment } from 'apps/proxy-auth/src/environments/environment';

export enum Theme {
    LIGHT = 'light',
    DARK = 'dark',
    SYSTEM = 'system',
}
export enum SendOtpCenterVersion {
    V1 = 'v1',
    V2 = 'v2',
}
export enum InputFields {
    TOP = 'top',
    BOTTOM = 'bottom',
}

@Component({
    selector: 'proxy-send-otp',
    templateUrl: './send-otp.component.html',
    encapsulation: ViewEncapsulation.ShadowDom,
    styleUrls: ['../../../styles.scss', './send-otp.component.scss'],
})
export class SendOtpComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() public referenceId: string;
    @Input() public type: string;
    @Input() public target: string;
    @Input() public authToken: string;
    @Input() public showCompanyDetails: boolean;
    @Input() public userToken: string;
    @Input() public isRolePermission: string;
    @Input() public isPreview: boolean;
    @Input() public isLogin: boolean;
    @Input() public loginRedirectUrl: string;
    @Input() public theme: string;
    @Input() public version: string = SendOtpCenterVersion.V1;
    @Input() public exclude_role_ids: any[] = [];
    @Input() public include_role_ids: any[] = [];
    @Input() public input_fields: string = InputFields.TOP;
    @Input() public show_social_login_icons: boolean = false;
    set css(type: NgStyle['ngStyle']) {
        this.cssSubject$.next(type);
    }
    private readonly cssSubject$: NgStyle['ngStyle'] = new BehaviorSubject({
        position: 'absolute',
        'margin-left': '50%',
        top: '10px',
    });
    readonly css$ = this.cssSubject$.pipe(
        map((type) =>
            !type || !Object.keys(type).length
                ? {
                      position: 'absolute',
                      'margin-left': '50%',
                      top: '10px',
                  }
                : type
        )
    );
    @Input() public successReturn: (arg: any) => any;
    @Input() public failureReturn: (arg: any) => any;
    @Input() public otherData: { [key: string]: any } = {};

    public show$: Observable<boolean> = of(false);
    public selectGetOtpInProcess$: Observable<boolean>;
    public selectWidgetData$: Observable<any>;
    public selectResendOtpInProcess$: Observable<boolean>;
    public selectVerifyOtpInProcess$: Observable<boolean>;
    public selectWidgetTheme$: Observable<any>;
    public animate: boolean = false;
    public isCreateAccountTextAppended: boolean = false;
    public otpWidgetData;
    public loginWidgetData;
    public showRegistration = new BehaviorSubject<boolean>(false);
    public registrationViaLogin: boolean = true;
    public prefillDetails: string;
    public cameFromLogin: boolean = false; // Track if user came from login
    public cameFromSendOtpCenter: boolean = false; // Track if user came from send-otp-center component
    public referenceElement: HTMLElement = null;
    public authReference: HTMLElement = null;
    public showCard: boolean = false;
    public subscriptionPlans: any[] = [];
    public showLogin: BehaviorSubject<boolean> = this.otpWidgetService.showlogin;
    public showSkeleton: boolean = false;
    public upgradeSubscriptionData: any;
    private createAccountTextAppended: boolean = false; // Flag to track if create account text has been appended
    private hcaptchaLoading: boolean = false;
    private hcaptchaRenderQueue: Array<() => void> = [];

    constructor(
        private ngZone: NgZone,
        private store: Store<IAppState>,
        private renderer: Renderer2,
        private otpWidgetService: OtpWidgetService,
        private otpUtilityService: OtpUtilityService,
        private otpService: OtpService,
        private dialog: MatDialog
    ) {
        super();
        this.selectGetOtpInProcess$ = this.store.pipe(
            select(selectGetOtpInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectResendOtpInProcess$ = this.store.pipe(
            select(selectResendOtpInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectVerifyOtpInProcess$ = this.store.pipe(
            select(selectVerifyOtpInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectWidgetData$ = this.store.pipe(select(selectWidgetData), takeUntil(this.destroy$));
        this.selectWidgetTheme$ = this.store.pipe(select(selectWidgetTheme), takeUntil(this.destroy$));
    }

    ngOnInit() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        prefersDark.addEventListener('change', (event) => {
            this.theme = event?.matches ? Theme.DARK : Theme.LIGHT;
        });
        if (!this.theme) {
            this.theme = prefersDark.matches ? Theme.DARK : Theme.LIGHT;
        }
        this.selectWidgetTheme$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((theme) => {
            if (theme?.theme !== Theme.SYSTEM) {
                this.theme = theme?.theme || theme;
            }
            this.version = theme?.version || 'v1';
            this.input_fields = theme?.input_fields || 'top';
            this.show_social_login_icons = theme?.icons || false;
            this.isCreateAccountTextAppended = theme?.create_account_link || false;
        });
        if (this.type === 'subscription') {
            // Load subscription plans first
            this.store.dispatch(getSubscriptionPlans({ referenceId: this.referenceId, authToken: this.authToken }));
            this.store.pipe(select(subscriptionPlansData), takeUntil(this.destroy$)).subscribe((subscriptionPlans) => {
                if (subscriptionPlans) {
                    this.subscriptionPlans = subscriptionPlans.data;
                }
                if (this.isPreview) {
                    this.show$ = of(true);
                } else {
                    this.toggleSendOtp(true);
                }
            });

            // Fallback timeout in case subscription plans don't load
            setTimeout(() => {
                if (this.isPreview) {
                    this.show$ = of(true);
                } else if (!this.subscriptionPlans || this.subscriptionPlans.length === 0) {
                    this.toggleSendOtp(true);
                }
            }, 3000);
        } else {
            this.toggleSendOtp(true);
        }
        this.loadExternalFonts();
        this.store.dispatch(
            getWidgetData({
                referenceId: this.referenceId,
                payload: this.otherData,
            })
        );
        this.selectWidgetData$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((widgetData) => {
            this.otpWidgetData = widgetData?.find((widget) => widget?.service_id === FeatureServiceIds.Msg91OtpService);
            if (this.otpWidgetData) {
                this.otpWidgetService.setWidgetConfig(
                    this.otpWidgetData?.widget_id,
                    this.otpWidgetData?.token_auth,
                    this.otpWidgetData?.state
                );
                this.otpWidgetService.loadScript();
            }
            this.loginWidgetData = widgetData?.find(
                (widget) => widget?.service_id === FeatureServiceIds.PasswordAuthentication
            );
            if (!this.loginWidgetData) {
                this.loginWidgetData = widgetData[0];
            }
        });
        this.otpWidgetService.otpWidgetToken.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((token) => {
            this.hitCallbackUrl(this.otpWidgetData.callbackUrl, { state: this.otpWidgetData?.state, code: token });
        });
    }

    ngOnDestroy() {
        if (this.referenceElement) {
            this.clearSubscriptionPlans(this.referenceElement);
        }
        if (this.referenceElement) {
            this.clearSubscriptionPlans(this.referenceElement);
        }
        super.ngOnDestroy();
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
            this.show$.pipe(take(1)).subscribe((res) => {
                this.ngZone.run(() => {
                    if (res) {
                        this.animate = true;
                        this.setShowLogin(false);
                        setTimeout(() => {
                            this.show$ = of(!res);
                            this.animate = false;
                        }, 300);
                    } else {
                        this.show$ = of(!res);
                    }
                });
            });
        } else {
            this.setShowLogin(false);

            this.show$ = of(false);
            this.animate = false;
            this.createAccountTextAppended = false;

            if (intial) {
                if (this.type === 'subscription') {
                    if (!this.isPreview && this.referenceElement) {
                        this.appendSubscriptionButton(this.referenceElement);
                    }
                } else {
                    this.showSkeleton = true;
                    this.appendSkeletonLoader(this.referenceElement, 1);
                    this.addButtonsToReferenceElement(this.referenceElement);
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

    // Method to disable Angular subscription component
    public disableAngularSubscription(): void {
        this.type = 'custom-subscription';
    }

    private createSubscriptionCenterHTML(): string {
        const plans = this.subscriptionPlans || [];

        if (plans.length === 0) {
            return `
                <div class="proxy-container">
                    <div class="subscription-plans-container d-flex flex-column align-items-center justify-content-center">
                        <div style="padding: 20px; text-align: center; color: #666; font-size: 16px;">
                            No subscription plans available
                        </div>
                    </div>
                </div>
            `;
        }

        const plansHTML = plans.map((plan) => this.createPlanCardHTML(plan)).join('');

        const finalHTML = `
            <div class="proxy-container">
                <div class="subscription-plans-container d-flex flex-column align-items-center justify-content-center">
                    <div class="plans-grid d-flex flex-row gap-4 justify-content-start align-items-stretch w-100 py-3">
                        ${plansHTML}
                    </div>
                </div>
            </div>
        `;

        return finalHTML;
    }

    private createPlanCardHTML(plan: any): string {
        // Map the hardcoded JSON structure to the expected format
        const isPopular = plan.plan_meta?.highlight_plan || false;
        const popularClass = isPopular ? 'popular' : '';
        const selectedClass = plan.isSelected ? 'selected' : '';
        const highlightedClass = isPopular ? 'highlighted' : '';

        const popularBadge = plan.plan_meta?.tag ? `<div class="popular-badge">${plan.plan_meta.tag}</div>` : '';

        // Extract price value and currency from "1000 USD"
        const priceMatch = plan.plan_price?.match(/(\d+)\s+(.+)/);
        const priceValue = priceMatch ? priceMatch[1] : '0';
        const currency = priceMatch ? priceMatch[2] : 'USD';

        const metricsHTML =
            plan.plan_meta?.metrics && plan.plan_meta.metrics.length > 0
                ? `
            <div class="included-resources mb-2">
                <h4 class="section-title text-left">Included</h4>
                <div class="resource-boxes d-flex flex-column gap-2">
                    ${plan.plan_meta.metrics.map((metric) => `<div class="resource-box">${metric}</div>`).join('')}
                </div>
            </div>
        `
                : '';

        const featuresHTML =
            (plan.plan_meta?.features?.included && plan.plan_meta.features.included.length > 0) ||
            (plan.plan_meta?.features?.notIncluded && plan.plan_meta.features.notIncluded.length > 0)
                ? `
            <div class="mb-2 text-left">
                <h4 class="section-title text-left">Features</h4>
                <ul class="plan-features gap-4 m-0 p-0 text-left">
                    ${
                        plan.plan_meta.features.included
                            ? plan.plan_meta.features.included
                                  .map(
                                      (feature) => `
                        <li class="feature-item included d-flex align-items-center position-relative p-0 gap-2 m-0">
                            <span class="feature-icon included">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${
                                    this.theme === 'dark' ? '#ffffff' : '#4d4d4d'
                                }">
                                    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                                </svg>
                            </span>
                            ${feature}
                        </li>
                    `
                                  )
                                  .join('')
                            : ''
                    }
                    ${
                        plan.plan_meta.features.notIncluded
                            ? plan.plan_meta.features.notIncluded
                                  .map(
                                      (feature) => `
                        <li class="feature-item not-included d-flex align-items-center position-relative p-0 gap-2">
                            <span class="feature-icon not-included">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#999999">
                                    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                                </svg>
                            </span>
                            ${feature}
                        </li>
                    `
                                  )
                                  .join('')
                            : ''
                    }
                </ul>
            </div>
        `
                : '';

        const extraFeaturesHTML =
            plan.plan_meta?.extra && plan.plan_meta.extra.length > 0
                ? `
            <div class="mb-4 text-left">
                <h4 class="section-title text-left">Extra</h4>
                <ul class="plan-features gap-4 m-0 p-0 text-left">
                    ${plan.plan_meta.extra
                        .map(
                            (extraFeature) => `
                        <li class="feature-item extra d-flex align-items-center position-relative p-0 gap-2 m-0">
                            <span class="feature-icon extra">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${
                                    this.theme === 'dark' ? '#ffffff' : '#4d4d4d'
                                }">
                                    <path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z" />
                                </svg>
                            </span>
                            ${extraFeature}
                        </li>
                    `
                        )
                        .join('')}
                </ul>
            </div>
        `
                : '';

        const isDisabled = !!plan.isSubscribed;
        const buttonHTML = `
            <button 
                class="plan-button primary upgrade-btn ${isDisabled ? 'plan-button-disabled' : ''}"
                data-plan-id="${plan.id}"
                data-plan-data='${JSON.stringify(plan)}'
                ${isDisabled ? 'disabled aria-disabled="true"' : ''}
                style="opacity: ${isDisabled ? 0.7 : 1}; ${
            isDisabled ? 'cursor: not-allowed; pointer-events: none;' : ''
        }"
            >
                ${this.isLogin ? (plan.isSubscribed ? 'Your current plan' : 'Get ' + plan.plan_name) : 'Get Started'}
            </button>
        `;

        return `
            <div class="plan-card d-flex flex-column gap-3 position-relative ${popularClass} ${selectedClass} ${highlightedClass}">
                ${popularBadge} 
                <div>
                    <h1 class="plan-title mt-0">${plan.plan_name}</h1>
                    <div class="plan-price mb-3">
                        <div class="price-container d-block mb-3">
                            <span class="price-number">${priceValue}</span>
                            <span class="price-currency">${currency}</span>
                        </div>
                    </div>
                    ${buttonHTML}
                    <div class="divider w-100 my-3"></div>
                </div>
                ${metricsHTML}
                ${featuresHTML}
                ${extraFeaturesHTML}
            </div>
        `;
    }

    /**
     * Create a plan card element
     */

    /**
     * Add CSS styles for subscription plans
     */
    private addSubscriptionStyles(): void {
        // Check if styles are already added
        if (document.getElementById('subscription-styles')) {
            return;
        }

        const style = this.renderer.createElement('style');
        style.id = 'subscription-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
            
            /* Bootstrap-like utility classes */
            .position-relative { position: relative !important; }
            .d-flex { display: flex !important; }
            .d-block { display: block !important; }
            .flex-row { flex-direction: row !important; }
            .flex-column { flex-direction: column !important; }
            .align-items-center { align-items: center !important; }
            .align-items-stretch { align-items: stretch !important; }
            .justify-content-start { justify-content: flex-start !important; }
            .justify-content-between { justify-content: space-between !important; }
            .w-100 { width: 100% !important; }
            .p-0 { padding: 0 !important; }
            .p-3 { padding: 1rem !important; }
            .pt-3, .py-3 { padding-top: 1rem !important; }
            .pb-3, .py-3 { padding-bottom: 1rem !important; }
            .m-0 { margin: 0 !important; }
            .mt-0, .my-0 { margin-top: 0 !important; }
            .mb-0, .my-0 { margin-bottom: 0 !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .mb-3 { margin-bottom: 1rem !important; }
            .mb-4 { margin-bottom: 1.5rem !important; }
            .my-3 { margin-top: 1rem !important; margin-bottom: 1rem !important; }
            .text-center { text-align: center !important; }
            .text-left { text-align: left !important; }
            .gap-1 { gap: 0.25rem !important; }
            .gap-2 { gap: 0.5rem !important; }
            .gap-3 { gap: 1rem !important; }
            .gap-4 { gap: 1.5rem !important; }
            .gap-5 { gap: 2rem !important; }
           


            /* Subscription Plans Styles */
.subscription-plans-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 20px;
                min-height: auto;
                overflow-y: visible;
                font-family: 'Outfit', sans-serif;
}

.plans-grid {
                gap: 20px;
                max-width: 100%;
                margin: 0;
                align-items: flex-start;
                padding: 20px 0 0 20px;
                overflow-x: auto;
                overflow-y: visible;
            }

            .plans-grid::-webkit-scrollbar {
        height: 8px;
    }

            .plans-grid::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

            .plans-grid::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
            }

            .plans-grid::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }

    @media (max-width: 1200px) {
                .plans-grid {
        gap: 15px;
        padding: 15px;
    }
            }

    @media (max-width: 768px) {
                .plans-grid {
        flex-direction: column;
        align-items: center;
        gap: 20px;
        overflow-x: visible;
        overflow-y: auto;
    }
}

            /* Plan Card Styles */
.plan-card {
                background: ${this.theme === Theme.DARK ? 'transparent' : '#ffffff'};
                border: ${this.theme === Theme.DARK ? '1px solid #e6e6e6' : '2px solid #e6e6e6'};
                border-radius: 4px;
                padding: 26px 24px;
                box-shadow: none;
                min-width: 290px;
                max-width: 350px;
                width: 350px;
                flex: 1;
                justify-content: flex-start;
                min-height: auto;
                max-height: none;
                overflow: visible;
                min-height: 348px;
                font-family: 'Outfit', sans-serif;
                position: relative;
                margin-top :30px
                
            }

            .plan-card.highlighted {
                border: ${this.theme === Theme.DARK ? '2px solid #ffffff' : '2px solid #000000'};
                box-shadow: 0 0 0 0px #000000 !important;
            }

            .plan-card:hover {
                box-shadow: none;
            }


    @media (max-width: 768px) {
                .plan-card {
        min-width: 50%;
        max-width: 400px;
        width: 100%;
        padding: 30px 20px;
                }
    }

            /* Popular Badge */
.popular-badge {
    position: absolute;
    top: -12px;
    right: 20px;
                background: #4d4d4d;
    color: #ffffff;
    padding: 6px 16px;
    border-radius: 20px;
                font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
                z-index: 100;
                transition: all 0.3s ease;
                pointer-events: none;
            }

            /* Popular badge stays in place on hover */
            .plan-card:hover .popular-badge {
                z-index: 101;
            }

            /* For popular cards, badge scales with the card */
            .plan-card.popular:hover .popular-badge {
                transform: scale(1.02);
                z-index: 101;
            }

            /* Plan Title */
.plan-title {
                font-size: 28px;
    font-weight: 700;
                color: #333333;
            }

    @media (max-width: 768px) {
                .plan-title {
        font-size: 24px;
    }
}

            /* Plan Price */
            .plan-price .price-container {
                gap: 6px;
            }

            .plan-price .price-number {
                font-size: 39px;
                font-weight: 700;
                color: #4d4d4d;
        line-height: 1;
            }

        @media (max-width: 768px) {
                .plan-price .price-number {
                    font-size: 42px;
                }
            }

            .plan-price .price-currency {
                font-size: 16px;
                font-weight: 400;
        color: #666666;
                line-height: 1;
                margin-top: 4px;
                margin-left: 4px;
            }

            @media (max-width: 768px) {
                .plan-price .price-currency {
                    font-size: 14px;
                }
            }

            .plan-price .price-period {
        font-size: 18px;
        color: #666666;
        font-weight: 500;
            }

        @media (max-width: 768px) {
                .plan-price .price-period {
            font-size: 16px;
        }
    }

            /* Included Resources */
            .included-resources .resource-boxes {
                margin-top: 6px;
            }

            .included-resources .resource-box {
                border-radius: 4px;
                padding: 4px 2px;
                font-size: 14px;
                font-weight: 600;
                color: #4d4d4d;
                text-align: left;
            }

            /* Section Title */
.section-title {
                font-size: 18px;
    font-weight: 600;
    color: #333333;
                margin: 0 0 8px 0;
}

            /* Plan Features */
.plan-features {
    list-style: none;
            }

            .plan-features .feature-item {
                padding: 4px 0 !important;
                margin-bottom: 0px !important;
                color: #4d4d4d;
        font-size: 14px;
                font-weight: 600;
            }

            .plan-features .feature-icon {
            font-weight: bold;
            font-size: 14px;
                color: #22c55e;
        }

            /* Plan Button */
.plan-button {
                width: 65%;
    padding: 6px 6px;
    border-radius: 4px;
                font-size: 15px;
    font-weight: 400;
                font-family: 'Outfit', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid;
    margin-top: auto;
            }

            .plan-button.primary {
                background: #4d4d4d;
                color: #ffffff;
                border-color: #4d4d4d;
                font-weight: 700;
            }

            .plan-button.primary:hover {
            background: #333333;
            border-color: #333333;
        }

            /* Disabled state */
            .plan-button.plan-button-disabled,
            .plan-button:disabled {
                opacity: 0.7 !important;
                cursor: not-allowed !important;
                pointer-events: none !important;
            }

            .plan-button.secondary {
        background: #ffffff;
                color: #4d4d4d;
                border-color: #4d4d4d;
            }

            .plan-button.secondary:hover {
            background: #f8f9fa;
        }

    @media (max-width: 768px) {
                .plan-button {
                width: auto;
             padding: 8px 28px;
           font-size: 16px;
        
    }
}

            /* Plan Button Hidden */
.plan-button-hidden {
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
                font-family: 'Outfit', sans-serif;
    background: #f8f9fa;
    color: #6c757d;
    border: 2px solid #e9ecef;
    margin-top: auto;
    cursor: not-allowed;
            }

    @media (max-width: 768px) {
                .plan-button-hidden {
        padding: 14px 28px;
        font-size: 16px;
    }
}
                *{
                box-sizing: border-box;
                font-family: 'Inter', sans-serif;
                 -webkit-font-smoothing: antialiased;
                 color: ${this.theme === 'dark' ? '#ffffff' : ''}!important;
              }

            /* Divider */
.divider {
    height: 1px;
    background: #e0e0e0;
}
   

        `;

        document.head.appendChild(style);
    }

    private addButtonsToReferenceElement(element): void {
        this.selectWidgetData$
            .pipe(
                filter((e) => !!e),
                take(1)
            )
            .subscribe((widgetDataArray) => {
                let buttonsProcessed = 0;
                const totalButtons = widgetDataArray.length;

                if (totalButtons > 0 && this.showSkeleton) {
                    this.removeSkeletonLoader(element);
                    this.appendSkeletonLoader(element, totalButtons);
                } else if (totalButtons > 0 && !this.showSkeleton) {
                    this.removeSkeletonLoader(element);
                }

                if (totalButtons === 0) {
                    if (this.showSkeleton) {
                        this.showSkeleton = false;
                        this.removeSkeletonLoader(element);
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
                        this.removeSkeletonLoader(element);
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
                        this.removeSkeletonLoader(element);
                        this.forceRemoveAllSkeletonLoaders();
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

    public appendPasswordAuthenticationButtonV2(element, buttonsData, totalButtons: number): void {
        if (this.showSkeleton) {
            this.showSkeleton = false;
            this.removeSkeletonLoader(element);
        }

        const loginContainer: HTMLElement = this.renderer.createElement('div');
        loginContainer.style.cssText = `
            width: 316px;
            padding: 0;
            margin: 0 8px 16px 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        `;

        const title: HTMLElement = this.renderer.createElement('div');
        title.textContent = 'Login';
        title.style.cssText = `
            font-size: 16px;
            line-height: 20px;
            font-weight: 600;
            color: ${this.theme === 'dark' ? '#ffffff' : '#1f2937'};
            margin: 0 8px 20px 8px;
            text-align: center;
            width: 316px;
        `;

        const usernameField = this.renderer.createElement('div');
        usernameField.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 6px;
        `;

        const usernameLabel: HTMLElement = this.renderer.createElement('label');
        usernameLabel.textContent = 'Email or Mobile';
        usernameLabel.style.cssText = `
            font-size: 14px;
            font-weight: 500;
            color: ${this.theme === 'dark' ? '#e5e7eb' : '#5d6164'};
        `;

        const usernameInput: HTMLInputElement = this.renderer.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = 'Email or Mobile';
        usernameInput.autocomplete = 'off';
        usernameInput.style.cssText = `
            width: 100%;
            height: 44px;
            padding: 0 16px;
            border: ${this.theme === 'dark' ? '1px solid #ffffff' : '1px solid #cbd5e1'};
            border-radius: 4px;
            background: ${this.theme === 'dark' ? 'transparent' : '#ffffff'};
            color: ${this.theme === 'dark' ? '#ffffff' : '#1f2937'};
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
        `;

        const usernameNote: HTMLElement = this.renderer.createElement('p');
        usernameNote.textContent = 'Note: Please enter your Mobile number with the country code (e.g. 91)';
        usernameNote.style.cssText = `
            font-size: 12px;
            line-height: 18px;
            color: ${this.theme === 'dark' ? '#e5e7eb' : '#5d6164'};
            margin: 0;
        `;

        const passwordField = this.renderer.createElement('div');
        passwordField.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 6px;
            position: relative;
        `;

        const passwordLabel: HTMLElement = this.renderer.createElement('label');
        passwordLabel.textContent = 'Password';
        passwordLabel.style.cssText = usernameLabel.style.cssText;

        const passwordInputWrapper = this.renderer.createElement('div');
        passwordInputWrapper.style.cssText = `
            position: relative;
            display: flex;
            align-items: center;
        `;

        const passwordInput: HTMLInputElement = this.renderer.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Password';
        passwordInput.autocomplete = 'off';
        passwordInput.style.cssText = `
            width: 100%;
            height: 44px;
            padding: 0 44px 0 16px;
            border: ${this.theme === 'dark' ? '1px solid #ffffff' : '1px solid #cbd5e1'};
            border-radius: 4px;
            background: ${this.theme === 'dark' ? 'transparent' : '#ffffff'};
            color: ${this.theme === 'dark' ? '#ffffff' : '#1f2937'};
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
        `;
        this.addPasswordVisibilityToggle(passwordInput, passwordInputWrapper);
        this.renderer.appendChild(passwordInputWrapper, passwordInput);

        const hcaptchaWrapper: HTMLElement = this.renderer.createElement('div');
        hcaptchaWrapper.style.cssText = `
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 8px 0;
            box-sizing: border-box;
            background: ${this.theme === 'dark' ? 'transparent' : 'transparent'};
        `;
        const hcaptchaPlaceholder: HTMLElement = this.renderer.createElement('div');
        hcaptchaPlaceholder.style.cssText = `
            display: inline-block;
            background: ${this.theme === 'dark' ? 'transparent' : 'transparent'};
        `;
        this.renderer.appendChild(hcaptchaWrapper, hcaptchaPlaceholder);

        let hCaptchaToken: string = '';
        let hCaptchaWidgetId: any = null;

        const errorText: HTMLElement = this.renderer.createElement('div');
        errorText.style.cssText = `
            color: #d14343;
            font-size: 14px;
            min-height: 16px;
            display: none;
            margin-top: -4px;
        `;

        const loginButton: HTMLButtonElement = this.renderer.createElement('button');
        loginButton.textContent = 'Login';
        loginButton.style.cssText = `
            height: 36px;
            padding: 0 12px;
            background-color: #3f51b5;
            color: #ffffff;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
            margin-top: 4px;
        `;

        const forgotPasswordWrapper: HTMLElement = this.renderer.createElement('div');
        forgotPasswordWrapper.style.cssText = `
            width: 100%;
            display: flex;
            justify-content: flex-end;
            margin-top: 4px;
        `;
        const forgotPasswordLink: HTMLAnchorElement = this.renderer.createElement('a');
        forgotPasswordLink.href = 'javascript:void(0)';
        forgotPasswordLink.textContent = 'Forgot Password?';
        forgotPasswordLink.style.cssText = `
            font-size: 13px;
            font-weight: 400;
            color: #007BFF;
            text-decoration: none;
        `;

        // Forgot password click handler - opens the dialog with forgot password flow
        forgotPasswordLink.addEventListener('click', () => {
            const userValue = usernameInput.value?.trim() || '';
            this.openForgotPasswordDialog(userValue);
        });
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
                this.setInlineLoginError(errorText, 'Unable to load hCaptcha. Please refresh and try again.');
                return;
            }
            hcaptchaPlaceholder.innerHTML = '';
            hCaptchaWidgetId = instance.render(hcaptchaPlaceholder, {
                sitekey: environment.hCaptchaSiteKey,
                theme: this.theme === 'dark' ? 'dark' : 'light',
                callback: (token: string) => {
                    hCaptchaToken = token;
                    this.setInlineLoginError(errorText, '');
                },
                'expired-callback': () => {
                    hCaptchaToken = '';
                },
                'error-callback': () => {
                    hCaptchaToken = '';
                    this.setInlineLoginError(errorText, 'hCaptcha verification failed. Please retry.');
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
            input.addEventListener('keydown', (event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    submit();
                }
            })
        );

        // this.renderer.appendChild(usernameField, usernameLabel);
        this.renderer.appendChild(usernameField, usernameInput);
        this.renderer.appendChild(usernameField, usernameNote);
        // this.renderer.appendChild(passwordField, passwordLabel);
        this.renderer.appendChild(passwordField, passwordInputWrapper);
        this.renderer.appendChild(loginContainer, usernameField);
        this.renderer.appendChild(loginContainer, passwordField);
        this.renderer.appendChild(loginContainer, forgotPasswordWrapper);
        this.renderer.appendChild(loginContainer, hcaptchaWrapper);
        this.renderer.appendChild(loginContainer, errorText);
        this.renderer.appendChild(loginContainer, loginButton);

        // Position login form based on input_fields setting
        const isInputFieldsTop = this.input_fields === 'top';

        // Always insert the "Login" title at the very top
        if (element.firstChild) {
            this.renderer.insertBefore(element, title, element.firstChild);
        } else {
            this.renderer.appendChild(element, title);
        }

        if (isInputFieldsTop) {
            // input_fields = 'top': Login form (input fields) at top (after title), social buttons below
            const titleNextSibling = title.nextSibling;
            if (titleNextSibling) {
                this.renderer.insertBefore(element, loginContainer, titleNextSibling);
            } else {
                this.renderer.appendChild(element, loginContainer);
            }
        } else {
            // input_fields = 'bottom': Social buttons at top (after title), login form at bottom
            this.renderer.appendChild(element, loginContainer);
        }

        if (totalButtons > 1) {
            const dividerContainer: HTMLElement = this.renderer.createElement('div');
            dividerContainer.setAttribute('data-or-divider', 'true');
            dividerContainer.style.cssText = `
                display: flex;
                align-items: center;
                margin: 8px 8px 12px 8px;
                width: 316px;
            `;
            const dividerLineLeft: HTMLElement = this.renderer.createElement('div');
            dividerLineLeft.style.cssText = `
                flex: 1;
                height: 1px;
                background-color: #e0e0e0;
            `;
            const dividerText: HTMLElement = this.renderer.createElement('span');
            dividerText.textContent = 'OR';
            dividerText.style.cssText = `
                padding: 0 12px;
                font-size: 12px;
                color: ${this.theme === 'dark' ? '#e5e7eb' : '#5d6164'};
                font-weight: 500;
                letter-spacing: 0.5px;
            `;
            const dividerLineRight: HTMLElement = this.renderer.createElement('div');
            dividerLineRight.style.cssText = dividerLineLeft.style.cssText;

            this.renderer.appendChild(dividerContainer, dividerLineLeft);
            this.renderer.appendChild(dividerContainer, dividerText);
            this.renderer.appendChild(dividerContainer, dividerLineRight);

            if (isInputFieldsTop) {
                // input_fields = 'top': OR divider goes after login container
                const nextSibling = loginContainer.nextSibling;
                if (nextSibling) {
                    this.renderer.insertBefore(element, dividerContainer, nextSibling);
                } else {
                    this.renderer.appendChild(element, dividerContainer);
                }
            } else {
                // input_fields = 'bottom': OR divider goes before login container
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
            this.setInlineLoginError(errorText, 'Email/Mobile and password are required.');
            return;
        }

        if (!hCaptchaToken) {
            this.setInlineLoginError(errorText, 'Please complete the hCaptcha verification.');
            return;
        }

        this.setInlineLoginError(errorText, '');
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
                    this.setInlineLoginError(errorText, res?.errors?.[0] || 'Unable to login. Please try again.');
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

                this.setInlineLoginError(
                    errorText,
                    error?.error?.errors?.[0] || 'Login failed. Please check your details and try again.'
                );
                resetHCaptcha();
                this.returnFailureObj(error);
            }
        );
    }

    private setInlineLoginError(errorText: HTMLElement, message: string): void {
        errorText.textContent = message;
        errorText.style.display = message ? 'block' : 'none';
    }

    private addPasswordVisibilityToggle(input: HTMLInputElement, container: HTMLElement): void {
        let visible = false;
        const toggleBtn: HTMLButtonElement = this.renderer.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.style.cssText = `
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: transparent;
            cursor: pointer;
            padding: 0;
            margin: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
        `;

        const hiddenIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${
            this.theme === 'dark' ? '#e5e7eb' : '#5d6164'
        }" xmlns="http://www.w3.org/2000/svg" style="display: block;"><path d="M12.01 20c-5.065 0-9.586-4.211-12.01-8.424 2.418-4.103 6.943-7.576 12.01-7.576 5.135 0 9.635 3.453 11.999 7.564-2.241 4.43-6.726 8.436-11.999 8.436zm-10.842-8.416c.843 1.331 5.018 7.416 10.842 7.416 6.305 0 10.112-6.103 10.851-7.405-.772-1.198-4.606-6.595-10.851-6.595-6.116 0-10.025 5.355-10.842 6.584zm10.832-4.584c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0 1c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4z"/></svg>`;
        const visibleIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${
            this.theme === 'dark' ? '#e5e7eb' : '#5d6164'
        }" xmlns="http://www.w3.org/2000/svg" style="display: block;"><path d="M8.137 15.147c-.71-.857-1.146-1.947-1.146-3.147 0-2.76 2.241-5 5-5 1.201 0 2.291.435 3.148 1.145l1.897-1.897c-1.441-.738-3.122-1.248-5.035-1.248-6.115 0-10.025 5.355-10.842 6.584.529.834 2.379 3.527 5.113 5.428l1.865-1.865zm6.294-6.294c-.673-.53-1.515-.853-2.44-.853-2.207 0-4 1.792-4 4 0 .923.324 1.765.854 2.439l5.586-5.586zm7.56-6.146l-19.292 19.293-.708-.707 3.548-3.548c-2.298-1.612-4.234-3.885-5.548-6.169 2.418-4.103 6.943-7.576 12.01-7.576 2.065 0 4.021.566 5.782 1.501l3.501-3.501.707.707zm-2.465 3.879l-.734.734c2.236 1.619 3.628 3.604 4.061 4.274-.739 1.303-4.546 7.406-10.852 7.406-1.425 0-2.749-.368-3.951-.938l-.748.748c1.475.742 3.057 1.19 4.699 1.19 5.274 0 9.758-4.006 11.999-8.436-1.087-1.891-2.63-3.637-4.474-4.978zm-3.535 5.414c0-.554-.113-1.082-.317-1.562l.734-.734c.361.69.583 1.464.583 2.296 0 2.759-2.24 5-5 5-.832 0-1.604-.223-2.295-.583l.734-.735c.48.204 1.007.318 1.561.318 2.208 0 4-1.792 4-4z"/></svg>`;

        const renderIcon = () => {
            toggleBtn.innerHTML = visible ? visibleIcon : hiddenIcon;
        };
        renderIcon();

        toggleBtn.addEventListener('click', () => {
            visible = !visible;
            input.type = visible ? 'text' : 'password';
            renderIcon();
        });

        this.renderer.appendChild(container, toggleBtn);
    }

    /**
     * Opens the forgot password dialog
     */
    private openForgotPasswordDialog(prefillEmail: string = ''): void {
        // Open the dialog
        this.ngZone.run(() => {
            this.show$ = of(true);
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
            color: ${this.theme === 'dark' ? '#ffffff' : '#1f2937'};
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
        emailInput.value = prefillEmail;
        emailInput.autocomplete = 'off';
        emailInput.style.cssText = `
            width: 100%;
            height: 44px;
            padding: 0 16px;
            border: ${this.theme === 'dark' ? '1px solid #ffffff' : '1px solid #cbd5e1'};
            border-radius: 4px;
            background: ${this.theme === 'dark' ? 'transparent' : '#ffffff'};
            color: ${this.theme === 'dark' ? '#ffffff' : '#1f2937'};
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
            border-radius: 4px;
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
                this.setInlineLoginError(errorText, 'Email or Mobile is required.');
                return;
            }

            this.setInlineLoginError(errorText, '');
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
                        this.setInlineLoginError(
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
                    this.setInlineLoginError(
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
            color: ${this.theme === 'dark' ? '#ffffff' : '#1f2937'};
            margin-bottom: 8px;
        `;

        // User info with change link
        const userInfo: HTMLElement = this.renderer.createElement('p');
        userInfo.style.cssText = `
            font-size: 14px;
            color: ${this.theme === 'dark' ? '#e5e7eb' : '#5d6164'};
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
            border: ${this.theme === 'dark' ? '1px solid #ffffff' : '1px solid #cbd5e1'};
            border-radius: 4px;
            background: ${this.theme === 'dark' ? 'transparent' : '#ffffff'};
            color: ${this.theme === 'dark' ? '#ffffff' : '#1f2937'};
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
            color: ${this.theme === 'dark' ? '#9ca3af' : '#6b7280'};
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
            border-radius: 4px;
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
                this.setInlineLoginError(errorText, 'OTP is required.');
                return;
            }
            if (!password) {
                this.setInlineLoginError(errorText, 'Password is required.');
                return;
            }
            if (password.length < 8) {
                this.setInlineLoginError(errorText, 'Password must be at least 8 characters.');
                return;
            }
            if (!PASSWORD_REGEX.test(password)) {
                this.setInlineLoginError(
                    errorText,
                    'Password should contain at least one Capital Letter, one Small Letter, one Digit and one Symbol.'
                );
                return;
            }
            if (password !== confirmPassword) {
                this.setInlineLoginError(errorText, 'Passwords do not match.');
                return;
            }

            this.setInlineLoginError(errorText, '');
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
                        this.setInlineLoginError(
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
                    this.setInlineLoginError(
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

    /**
     * Builds the login form content within the given container
     */
    private buildLoginFormContent(loginContainer: HTMLElement, buttonsData: any): void {
        const title: HTMLElement = this.renderer.createElement('div');
        title.textContent = 'Login';
        title.style.cssText = `
            font-size: 16px;
            line-height: 20px;
            font-weight: 600;
            color: ${this.theme === 'dark' ? '#ffffff' : '#1f2937'};
            margin-bottom: 0px;
            text-align: center;
        `;

        const usernameField = this.renderer.createElement('div');
        usernameField.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 6px;
        `;

        const usernameInput: HTMLInputElement = this.renderer.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = 'Email or Mobile';
        usernameInput.autocomplete = 'off';
        usernameInput.style.cssText = `
            width: 100%;
            height: 44px;
            padding: 0 16px;
            border: ${this.theme === 'dark' ? '1px solid #ffffff' : '1px solid #cbd5e1'};
            border-radius: 4px;
            background: ${this.theme === 'dark' ? 'transparent' : '#ffffff'};
            color: ${this.theme === 'dark' ? '#ffffff' : '#1f2937'};
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
        `;

        const usernameNote: HTMLElement = this.renderer.createElement('p');
        usernameNote.textContent = 'Note: Please enter your Mobile number with the country code (e.g. 91)';
        usernameNote.style.cssText = `
            font-size: 12px;
            line-height: 18px;
            color: ${this.theme === 'dark' ? '#e5e7eb' : '#5d6164'};
            margin: 0;
        `;

        const passwordField = this.renderer.createElement('div');
        passwordField.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 6px;
            position: relative;
        `;

        const passwordInputWrapper = this.renderer.createElement('div');
        passwordInputWrapper.style.cssText = `
            position: relative;
            display: flex;
            align-items: center;
        `;

        const passwordInput: HTMLInputElement = this.renderer.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Password';
        passwordInput.autocomplete = 'off';
        passwordInput.style.cssText = `
            width: 100%;
            height: 44px;
            padding: 0 44px 0 16px;
            border: ${this.theme === 'dark' ? '1px solid #ffffff' : '1px solid #cbd5e1'};
            border-radius: 4px;
            background: ${this.theme === 'dark' ? 'transparent' : '#ffffff'};
            color: ${this.theme === 'dark' ? '#ffffff' : '#1f2937'};
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
        `;
        this.addPasswordVisibilityToggle(passwordInput, passwordInputWrapper);
        this.renderer.appendChild(passwordInputWrapper, passwordInput);

        const hcaptchaWrapper: HTMLElement = this.renderer.createElement('div');
        hcaptchaWrapper.style.cssText = `
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 8px 0;
            box-sizing: border-box;
            background: ${this.theme === 'dark' ? 'transparent' : 'transparent'};
        `;
        const hcaptchaPlaceholder: HTMLElement = this.renderer.createElement('div');
        hcaptchaPlaceholder.style.cssText = `
            display: inline-block;
            background: ${this.theme === 'dark' ? 'transparent' : 'transparent'};
        `;
        this.renderer.appendChild(hcaptchaWrapper, hcaptchaPlaceholder);

        let hCaptchaToken: string = '';
        let hCaptchaWidgetId: any = null;

        const errorText: HTMLElement = this.renderer.createElement('div');
        errorText.style.cssText = `
            color: #d14343;
            font-size: 14px;
            min-height: 16px;
            display: none;
            margin-top: -4px;
        `;

        const loginButton: HTMLButtonElement = this.renderer.createElement('button');
        loginButton.textContent = 'Login';
        loginButton.style.cssText = `
            height: 44px;
            padding: 0 12px;
            background-color: #3f51b5;
            color: #ffffff;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
            margin-top: 4px;
        `;

        const forgotPasswordWrapper: HTMLElement = this.renderer.createElement('div');
        forgotPasswordWrapper.style.cssText = `
            width: 100%;
            display: flex;
            justify-content: flex-end;
            margin-top: 4px;
        `;
        const forgotPasswordLink: HTMLAnchorElement = this.renderer.createElement('a');
        forgotPasswordLink.href = 'javascript:void(0)';
        forgotPasswordLink.textContent = 'Forgot Password?';
        forgotPasswordLink.style.cssText = `
            font-size: 13px;
            font-weight: 400;
            color: #1976d2;
            text-decoration: none;
        `;
        forgotPasswordLink.addEventListener('click', () => {
            const userValue = usernameInput.value?.trim() || '';
            this.showForgotPasswordForm(loginContainer, buttonsData, userValue);
        });
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
                this.setInlineLoginError(errorText, 'Unable to load hCaptcha. Please refresh and try again.');
                return;
            }
            hcaptchaPlaceholder.innerHTML = '';
            hCaptchaWidgetId = instance.render(hcaptchaPlaceholder, {
                sitekey: environment.hCaptchaSiteKey,
                theme: this.theme === 'dark' ? 'dark' : 'light',
                callback: (token: string) => {
                    hCaptchaToken = token;
                    this.setInlineLoginError(errorText, '');
                },
                'expired-callback': () => {
                    hCaptchaToken = '';
                },
                'error-callback': () => {
                    hCaptchaToken = '';
                    this.setInlineLoginError(errorText, 'hCaptcha verification failed. Please retry.');
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
            input.addEventListener('keydown', (event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    submit();
                }
            })
        );

        this.renderer.appendChild(loginContainer, title);
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
                this.removeSkeletonLoader(element);
                this.forceRemoveAllSkeletonLoaders();

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
            this.removeSkeletonLoader(element);
        }

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

            button.style.cssText = `
                outline: none;
                padding: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                background-color: transparent;
                border: ${this.theme === 'dark' ? '1px solid #ffffff' : '1px solid #d1d5db'};
                border-radius: 8px;
                cursor: pointer;
                visibility: ${isOtpButton ? 'hidden' : 'visible'};
            `;
            image.style.cssText = `
                height: 24px;
                width: 24px;
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

            button.style.cssText = `
                outline: none;
                padding: 0 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                ${useDiv ? '' : 'gap: 12px;'}
                font-size: 14px;
                background-color: transparent;
                border: ${this.theme === 'dark' ? '1px solid #ffffff' : '1px solid #000000'};
                border-radius: 4px;
                height: 44px;
                color: ${this.theme === 'dark' ? '#ffffff' : '#111827'};
                margin: 8px 8px 16px 8px;
                cursor: pointer;
                width: ${useDiv ? '316px' : '260px'};
                visibility: ${isOtpButton ? 'hidden' : 'visible'}; // Hide only OTP buttons until ready
            `;
            image.style.cssText = `
                height: 20px;
                width: 20px;
            `;
            span.style.cssText = `
                color: ${this.theme === 'dark' ? '#ffffff' : '#111827'};
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
                    width: 180px;
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
    color: ${this.theme === 'dark' ? '#ffffff' : '#3f4346'};
    cursor: pointer !important;
    width: ${this.version === 'v1' ? '260px' : '316px'} !important;
`;

        // Style the link
        link.style.cssText = `
            color: #007bff !important;
            text-decoration: none;
            cursor: pointer;
            font-weight: 500 !important;
        `;

        // Set the text content
        paragraph.innerHTML = 'Are you a new user? ';
        link.textContent = 'Create an account';

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
                    this.show$ = of(true);
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
                    this.show$ = of(true);
                } else {
                    // When closing registration, go back to where user came from
                    if (this.cameFromLogin) {
                        // If user came from login, go back to login
                        this.setShowLogin(true);
                        this.show$ = of(true);
                    } else if (this.cameFromSendOtpCenter) {
                        // If user came from send-otp-center, go back to send-otp-center
                        // Only close login without affecting show$ - avoid race condition
                        this.otpWidgetService.openLogin(false);
                        this.show$ = of(true);
                    } else {
                        // If user came from dynamically appended buttons, just close without opening anything
                        this.setShowLogin(false);
                        this.show$ = of(false);
                    }
                    // Reset the flags
                    this.cameFromLogin = false;
                    this.cameFromSendOtpCenter = false;
                }
            } else {
                this.setShowLogin(false);
                if (this.referenceElement) {
                    this.show$ = of(value);
                }
            }
            this.showRegistration.next(value);
            if (data) {
                this.prefillDetails = data;
            }
        });
    }
    public setShowLogin(value: boolean) {
        this.ngZone.run(() => {
            if (this.referenceElement) {
                this.show$ = of(value);
            }
            this.otpWidgetService.openLogin(value);
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

    private appendSkeletonLoader(element, buttonCount: number): void {
        const skeletonContainer = this.renderer.createElement('div');
        skeletonContainer.id = 'skeleton-loader';
        skeletonContainer.style.cssText = `
            display: block;
            width: 100%;
        `;

        for (let i = 0; i < 3; i++) {
            const skeletonButton = this.renderer.createElement('div');
            skeletonButton.style.cssText = `
                width: 230px;
                height: 40px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
                margin: 8px 8px 16px 8px;
                display: block;
                box-sizing: border-box;
            `;

            if (!document.getElementById('skeleton-animation')) {
                const style = this.renderer.createElement('style');
                style.id = 'skeleton-animation';
                style.textContent = `
                    @keyframes skeleton-loading {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                `;
                document.head.appendChild(style);
            }

            this.renderer.appendChild(skeletonContainer, skeletonButton);
        }

        this.renderer.appendChild(element, skeletonContainer);
    }

    private removeSkeletonLoader(element): void {
        const skeletonLoader = element.querySelector('#skeleton-loader');
        if (skeletonLoader) {
            this.renderer.removeChild(element, skeletonLoader);
        }

        // Also remove any skeleton loaders that might be in the element
        const allSkeletonLoaders = element.querySelectorAll('#skeleton-loader');
        allSkeletonLoaders.forEach((loader) => {
            if (loader.parentNode) {
                this.renderer.removeChild(element, loader);
            }
        });

        this.forceRemoveAllSkeletonLoaders();
    }

    private forceRemoveAllSkeletonLoaders(): void {
        // Remove skeleton loaders from the reference element
        if (this.referenceElement) {
            const skeletonLoaders = this.referenceElement.querySelectorAll('#skeleton-loader');
            skeletonLoaders.forEach((loader, index) => {
                this.renderer.removeChild(this.referenceElement, loader);
            });
        }

        // Also try to remove from document body (fallback)
        const globalSkeletonLoaders = document.querySelectorAll('#skeleton-loader');
        if (globalSkeletonLoaders.length > 0) {
            globalSkeletonLoaders.forEach((loader, index) => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            });
        }
    }
    private formatSubscriptionPlans(plans: any[]): any[] {
        return plans.map((plan, index) => ({
            id: plan.plan_name?.toLowerCase().replace(/\s+/g, '-') || `plan-${index}`,
            title: plan.plan_name || 'Unnamed Plan',
            priceNumber: this.extractPriceValue(plan.plan_price) || 0,
            priceText:
                this.extractCurrency(plan.plan_price) ||
                (plan.plan_price ? plan.plan_price.replace(/[\d.]/g, '').trim() : 'Free'),
            priceValue: this.extractPriceValue(plan.plan_price),
            currency: this.extractCurrency(plan.plan_price),
            buttonText: plan.subscribe_button_hidden ? 'Hidden' : 'Get Started',
            buttonStyle: 'secondary', // All plans use secondary style
            isPopular: false, // No plan is popular by default
            isSelected: false, // No plan is selected by default
            features: this.getIncludedFeatures(plan.charges),
            status: plan.plan_status,
            subscribeButtonLink: this.isLogin
                ? plan.subscribe_button_link?.replace('{ref_id}', this.referenceId)
                : this.loginRedirectUrl,
            subscribeButtonHidden: plan.subscribe_button_hidden,
        }));
    }
    private extractPriceValue(priceString: string): number {
        if (!priceString) return 0;
        const match = priceString.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }

    private extractCurrency(priceString: string): string {
        if (!priceString) return '';
        const match = priceString.match(/[A-Z]{3}/);
        return match ? match[0] : '';
    }
    private getIncludedFeatures(charges: any[]): string[] {
        if (!charges || !Array.isArray(charges)) return [];
        return charges.map((charge) => {
            const quota = charge.quotas || '';
            const metricName = charge.billable_metric_name || '';
            return `${quota} ${metricName}`.trim();
        });
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
}
