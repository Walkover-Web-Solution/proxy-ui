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

import { getSubscriptionPlans, getWidgetData } from '../store/actions/otp.action';
import { IAppState } from '../store/app.state';
import {
    selectGetOtpInProcess,
    selectResendOtpInProcess,
    selectVerifyOtpInProcess,
    selectWidgetData,
    subscriptionPlansData,
} from '../store/selectors';
import { FeatureServiceIds } from '@proxy/models/features-model';
import { OtpWidgetService } from '../service/otp-widget.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SubscriptionCenterComponent } from '../component/subscription-center/subscription-center.component';

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
    @Input() public userToken: string;
    @Input() public pass: string;
    @Input() public isPreview: boolean;

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
    public animate: boolean = false;

    public otpWidgetData;
    public loginWidgetData;
    public showRegistration = new BehaviorSubject<boolean>(false);
    public registrationViaLogin: boolean = true;
    public prefillDetails: string;
    public referenceElement: HTMLElement = null;
    public authReference: HTMLElement = null;
    public showCard: boolean = false;
    public subscriptionPlans: any[] = [];
    public showLogin: BehaviorSubject<boolean> = this.otpWidgetService.showlogin;
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
    }

    ngOnInit() {
        if (this.type === 'subscription') {
            // Load subscription plans first
            this.store.dispatch(getSubscriptionPlans({ referenceId: this.referenceId }));
            this.store.pipe(select(subscriptionPlansData), takeUntil(this.destroy$)).subscribe((subscriptionPlans) => {
                if (subscriptionPlans) {
                    this.subscriptionPlans = this.formatSubscriptionPlans(subscriptionPlans.data);
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

            if (intial) {
                if (this.type === 'subscription') {
                    if (!this.isPreview && this.referenceElement) {
                        this.appendSubscriptionButton(this.referenceElement);
                    }
                } else {
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
            const existingContainer = element.querySelector('.subscription-plans-container');
            if (existingContainer) {
                this.renderer.removeChild(element, existingContainer);
            }
            if (!this.subscriptionPlans || this.subscriptionPlans.length === 0) {
                // Create a fallback message
                const fallbackDiv = this.renderer.createElement('div');
                fallbackDiv.style.cssText = `
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    font-size: 16px;
                `;
                this.renderer.appendChild(element, fallbackDiv);
                return;
            }

            // Create the subscription plans container
            const subscriptionContainer = this.renderer.createElement('div');
            subscriptionContainer.className = 'subscription-plans-container d-flex flex-column align-items-center';

            // Create the plans grid
            const plansGrid = this.renderer.createElement('div');
            plansGrid.className =
                'plans-grid d-flex flex-row gap-4 justify-content-start align-items-stretch w-100 py-3';

            // Add CSS styles for the subscription plans
            this.addSubscriptionStyles();

            // Create plan cards for each subscription plan
            this.subscriptionPlans.forEach((plan, index) => {
                const planCard = this.createPlanCard(plan, index);
                this.renderer.appendChild(plansGrid, planCard);
            });

            // Append the grid to the container
            this.renderer.appendChild(subscriptionContainer, plansGrid);

            // Append the container to the element
            this.renderer.appendChild(element, subscriptionContainer);
        } catch (error) {}
    }

    /**
     * Create a plan card element
     */
    private createPlanCard(plan: any, index: number): HTMLElement {
        try {
            const planCard = this.renderer.createElement('div');
            planCard.className = 'plan-card d-flex flex-column justify-content-between position-relative';

            // Add classes based on plan properties
            if (plan.isPopular) {
                planCard.classList.add('popular');
            }
            if (plan.isSelected) {
                planCard.classList.add('selected');
            }

            // Add click event
            planCard.addEventListener('click', () => {
                this.selectPlan(plan);
            });

            // Create popular badge if needed
            if (plan.isPopular) {
                const popularBadge = this.renderer.createElement('div');
                popularBadge.className = 'popular-badge';
                popularBadge.textContent = 'Popular';
                this.renderer.appendChild(planCard, popularBadge);
            }

            // Create main content div
            const mainContent = this.renderer.createElement('div');

            // Create plan title
            const planTitle = this.renderer.createElement('h1');
            planTitle.className = 'plan-title mt-0';
            planTitle.textContent = plan.title;
            this.renderer.appendChild(mainContent, planTitle);

            // Create plan price
            const planPrice = this.renderer.createElement('div');
            planPrice.className = 'plan-price mb-3';

            const priceAmount = this.renderer.createElement('span');
            priceAmount.className = 'price-amount d-block mb-3';
            priceAmount.textContent = plan.price;

            const pricePeriod = this.renderer.createElement('span');
            pricePeriod.className = 'price-period';
            pricePeriod.textContent = plan.period || '';

            this.renderer.appendChild(planPrice, priceAmount);
            this.renderer.appendChild(planPrice, pricePeriod);
            this.renderer.appendChild(mainContent, planPrice);

            // Create action button or hidden state
            if (!plan.subscribeButtonHidden) {
                const actionButton = this.renderer.createElement('button');
                actionButton.className = `plan-button ${plan.buttonStyle || 'secondary'}`;
                actionButton.textContent = plan.buttonText;

                actionButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.selectPlan(plan);
                });

                this.renderer.appendChild(mainContent, actionButton);
            } else {
                const hiddenButton = this.renderer.createElement('div');
                hiddenButton.className = 'plan-button-hidden w-100 text-center';
                hiddenButton.textContent = plan.buttonText;
                this.renderer.appendChild(mainContent, hiddenButton);
            }

            // Create divider
            const divider = this.renderer.createElement('div');
            divider.className = 'divider w-100 my-3';
            this.renderer.appendChild(mainContent, divider);

            // Create features section if features exist
            if (plan.features && plan.features.length > 0) {
                const featuresSection = this.renderer.createElement('div');
                featuresSection.className = 'mb-4 text-left';

                const sectionTitle = this.renderer.createElement('h4');
                sectionTitle.className = 'section-title text-left';
                sectionTitle.textContent = 'Features:';
                this.renderer.appendChild(featuresSection, sectionTitle);

                const featuresList = this.renderer.createElement('ul');
                featuresList.className = 'plan-features m-0 p-0 text-left';

                plan.features.forEach((feature) => {
                    const featureItem = this.renderer.createElement('li');
                    featureItem.className =
                        'feature-item included d-flex align-items-center position-relative p-0 gap-2';

                    const featureIcon = this.renderer.createElement('span');
                    featureIcon.className = 'feature-icon';
                    featureIcon.textContent = '✓';

                    const featureText = this.renderer.createText(feature);

                    this.renderer.appendChild(featureItem, featureIcon);
                    this.renderer.appendChild(featureItem, featureText);
                    this.renderer.appendChild(featuresList, featureItem);
                });

                this.renderer.appendChild(featuresSection, featuresList);
                this.renderer.appendChild(mainContent, featuresSection);
            }

            this.renderer.appendChild(planCard, mainContent);
            return planCard;
        } catch (error) {
            const fallbackCard = this.renderer.createElement('div');
            fallbackCard.style.cssText = `
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 8px;
                text-align: center;
                color: #666;
            `;
            fallbackCard.textContent = 'Error loading plan';
            return fallbackCard;
        }
    }

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
            @import url('https://unpkg.com/@angular/material@14.2.7/prebuilt-themes/indigo-pink.css');
.container {
    background: #ffffff !important;
    padding: 20px;
    text-align: left;
    position: relative;
    height: 100vh;
    width: 100vw;
    z-index: 1;
    flex-direction: column;
    overflow-y: auto;
    box-sizing: border-box;
}
/* When used in dialog, override the positioning */
:host-context(.subscription-center-dialog) .container {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    height: 100% !important;
    width: 100% !important;
    max-height: 700px !important;
    max-width: 900px !important;
}
/* Dialog-specific styling for better layout */
:host-context(.subscription-center-dialog) {
    .subscription-plans-container {
        padding: 10px !important;
        height: calc(100% - 40px) !important;
    }
    .plans-grid {
        justify-content: space-around !important;
        // align-items: flex-start !important;
    }
    .plan-card {
        flex: 0 0 280px !important;
        margin: 10px !important;
    }
}
// Subscription Plans Styles
.subscription-plans-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 20px;
    height: 100%;
    overflow-y: auto;
}
.plans-grid {
    display: flex;
    flex-direction: row;
    gap: 20px;
    width: 100%;
    max-width: 100%;
    margin: 0;
    align-items: stretch;
    padding: 30px;
    overflow-x: auto;
    // overflow-y: hidden;
    // Custom scrollbar styling
    &::-webkit-scrollbar {
        height: 8px;
    }
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
        &:hover {
            background: #a8a8a8;
        }
    }
    // Responsive behavior for smaller screens
    @media (max-width: 1200px) {
        gap: 15px;
        padding: 15px;
    }
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        gap: 20px;
        overflow-x: visible;
        overflow-y: auto;
    }
}
.plan-card {
    background: #ffffff;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    padding: 30px 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    min-width: 250px;
    max-width: 280px;
    width: 280px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 348px;
    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    }
    &.popular {
        border-color: #000000;
        border-width: 3px;
        transform: scale(1.02);
        &:hover {
            transform: scale(1.02) translateY(-8px);
        }
    }
    &.selected {
        border-color: #000000;
    }
    // Mobile responsive
    @media (max-width: 768px) {
        min-width: 100%;
        max-width: 400px;
        width: 100%;
        padding: 30px 20px;
        &.popular {
            transform: none;
            &:hover {
                transform: translateY(-8px);
            }
        }
    }
}
.popular-badge {
    position: absolute;
    top: -12px;
    right: 20px;
    background: #000000;
    color: #ffffff;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: var(--font-size-12);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.plan-title {
    font-size: var(--font-size-28);
    font-weight: 700;
    color: var(--color-common-slate);
    @media (max-width: 768px) {
        font-size: 24px;
    }
}
.plan-price {
    .price-amount {
        font-size: 30px;
        font-weight: 600;
        color: #22c55e;
        line-height: 1;
        @media (max-width: 768px) {
            font-size: 36px;
        }
    }
    .price-period {
        font-size: 18px;
        color: #666666;
        font-weight: 500;
        @media (max-width: 768px) {
            font-size: 16px;
        }
    }
}
.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333333;
    margin: 0 0 12px 0;
}
.plan-features {
    list-style: none;
    .feature-item {
        // padding: 6px 0;
        color: #555555;
        font-size: 14px;
        // padding-left: 20px;
        .feature-icon {
            font-weight: bold;
            font-size: 14px;
            color: #22c55e;
        }
    }
}
.plan-button {
    width: 65%;
    padding: 6px 6px;
    border-radius: 4px;
    font-size: 15px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid;
    margin-top: auto;
    &.primary {
        background: #000000;
        color: #ffffff;
        border-color: #000000;
        &:hover {
            background: #333333;
            border-color: #333333;
        }
    }
    &.secondary {
        background: #ffffff;
        color: #000000;
        border-color: #000000;
        &:hover {
            background: #f8f9fa;
        }
    }
    @media (max-width: 768px) {
        padding: 14px 28px;
        font-size: 16px;
    }
}
.plan-button-hidden {
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    background: #f8f9fa;
    color: #6c757d;
    border: 2px solid #e9ecef;
    margin-top: auto;
    cursor: not-allowed;
    @media (max-width: 768px) {
        padding: 14px 28px;
        font-size: 16px;
    }
}
.close-dialog {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 1000;
    svg {
        width: 12px;
        height: 12px;
    }
}
.divider {
    height: 1px;
    background: #e0e0e0;
}
:host {
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .close-dialog {
        position: absolute;
        right: 16px;
        top: 16px;
        width: 20px;
        height: 20px;
        line-height: 20px;
        @media only screen and (max-width: 768px) {
            position: fixed;
        }
    }
    .input-filed-wrapper {
        display: flex;
        justify-content: center;
        flex-direction: column;
        position: relative;
    }
    .login-toggle {
        margin-top: 24px;
        font-size: 13px;
    }
}
        `;

        document.head.appendChild(style);
    }

    /**
     * Handle plan selection
     */
    private selectPlan(plan: any): void {
        // Remove selected class from all plans
        const allPlanCards = document.querySelectorAll('.plan-card');
        allPlanCards.forEach((card) => {
            card.classList.remove('selected');
        });

        // Add selected class to the clicked plan
        const selectedCard = event?.target as HTMLElement;
        if (selectedCard) {
            const planCard = selectedCard.closest('.plan-card');
            if (planCard) {
                planCard.classList.add('selected');
            }
        }

        // Handle the selected plan
        this.processSelectedPlan(plan);
    }

    /**
     * Process the selected subscription plan
     */
    private processSelectedPlan(plan: any): void {
        if (plan.subscribeButtonLink) {
            window.open(plan.subscribeButtonLink, this.target || '_self');
        }

        // Call success callback if available
        if (this.successReturn && typeof this.successReturn === 'function') {
            this.successReturn({
                selectedPlan: plan,
                type: 'subscription_selected',
            });
        }
    }

    private addButtonsToReferenceElement(element): void {
        this.selectWidgetData$
            .pipe(
                filter((e) => !!e),
                take(1)
            )
            .subscribe((widgetDataArray) => {
                for (const buttonsData of widgetDataArray) {
                    if (buttonsData?.service_id === FeatureServiceIds.Msg91OtpService) {
                        this.otpWidgetService.scriptLoading
                            .pipe(
                                skip(1),
                                filter((e) => !e),
                                take(1)
                            )
                            .subscribe(() => this.appendButton(element, buttonsData));
                    } else {
                        this.appendButton(element, buttonsData);
                    }
                }
            });
    }

    private appendButton(element, buttonsData): void {
        const button: HTMLButtonElement = this.renderer.createElement('button');
        const image: HTMLImageElement = this.renderer.createElement('img');
        const span: HTMLSpanElement = this.renderer.createElement('span');
        button.style.cssText = `
            outline: none;
            padding: 0px 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            background-color: transparent;
            border: 1px solid #3f4346;
            border-radius: 4px;
            line-height: 40px;
            color: #3f4346;
            margin: 8px 8px 16px 8px;
            cursor: pointer;
            width: 230px;
        `;
        image.style.cssText = `
            height: 20px;
            // width: 20px;
        `;
        span.style.cssText = `
            color: #3f4346;
            font-weight: 600;
        `;
        image.src = buttonsData.icon;
        image.alt = buttonsData.text;
        image.loading = 'lazy';
        span.innerText = buttonsData.text;
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
                } else {
                    this.setShowLogin(true);
                }
                this.show$ = of(true);
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
    private formatSubscriptionPlans(plans: any[]): any[] {
        return plans.map((plan, index) => ({
            id: plan.plan_name?.toLowerCase().replace(/\s+/g, '-') || `plan-${index}`,
            title: plan.plan_name || 'Unnamed Plan',
            price: plan.plan_price || 'Free',
            priceValue: this.extractPriceValue(plan.plan_price),
            currency: this.extractCurrency(plan.plan_price),
            buttonText: plan.subscribe_button_hidden ? 'Hidden' : 'Get Started',
            buttonStyle: 'secondary', // All plans use secondary style
            isPopular: false, // No plan is popular by default
            isSelected: false, // No plan is selected by default
            features: this.getIncludedFeatures(plan.charges),
            status: plan.plan_status,
            subscribeButtonLink: plan.subscribe_button_link,
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
}
