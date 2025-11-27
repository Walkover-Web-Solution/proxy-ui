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
import { HttpErrorResponse } from '@angular/common/http';
import { SubscriptionCenterComponent } from '../component/subscription-center/subscription-center.component';

export enum Theme {
    LIGHT = 'light',
    DARK = 'dark',
    SYSTEM = 'system',
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

    constructor(
        private ngZone: NgZone,
        private store: Store<IAppState>,
        private renderer: Renderer2,
        private otpWidgetService: OtpWidgetService,
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
            if (!this.theme) {
                this.theme = event.matches ? Theme.DARK : Theme.LIGHT;
            }
        });
        if (!this.theme) {
            this.theme = prefersDark.matches ? Theme.DARK : Theme.LIGHT;
        }
        this.selectWidgetTheme$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((theme) => {
            if (theme?.theme !== Theme.SYSTEM) {
                this.theme = theme?.theme || theme;
            }
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
                    }
                }
            });
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
        const span: HTMLSpanElement = this.renderer.createElement('span');

        const isOtpButton = buttonsData?.service_id === FeatureServiceIds.Msg91OtpService;

        button.style.cssText = `
            outline: none;
            padding: 0px 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            background-color: transparent;
            border: ${this.theme === 'dark' ? '1px solid #ffffff' : '1px solid #3f4346'};
            border-radius: 4px;
            line-height: 40px;
            color: ${this.theme === 'dark' ? '#ffffff' : '#3f4346'};
            margin: 8px 8px 16px 8px;
            cursor: pointer;
            width: 260px;
            visibility: ${isOtpButton ? 'hidden' : 'visible'}; // Hide only OTP buttons until ready
        `;
        image.style.cssText = `
            height: 20px;
            // width: 20px;
        `;
        span.style.cssText = `
            color: ${this.theme === 'dark' ? '#ffffff' : '#3f4346'};
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
        this.renderer.appendChild(button, image);
        this.renderer.appendChild(button, span);
        this.renderer.appendChild(element, button);
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
    width: 260px !important;
`;

        link.style.cssText = `
    color: #007bff !important;
    text-decoration: none !important;
    cursor: pointer !important;
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
                    this.setShowLogin(false);
                    if (this.cameFromLogin) {
                        // If user came from login, go back to login
                        this.setShowLogin(true);
                        this.show$ = of(true);
                    } else if (this.cameFromSendOtpCenter) {
                        // If user came from send-otp-center, go back to send-otp-center
                        this.show$ = of(true);
                    } else {
                        // If user came from dynamically appended buttons, just close without opening anything
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
