import { OtpService } from './../service/otp.service';
import { NgStyle } from '@angular/common';
import { Component, Input, NgZone, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { META_TAG_ID } from '@proxy/constant';
import { BaseComponent } from '@proxy/ui/base-component';
import { select, Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, skip, take, takeUntil } from 'rxjs/operators';

import { getWidgetData } from '../store/actions/otp.action';
import { IAppState } from '../store/app.state';
import {
    selectGetOtpInProcess,
    selectResendOtpInProcess,
    selectVerifyOtpInProcess,
    selectWidgetData,
} from '../store/selectors';
import { FeatureServiceIds } from '@proxy/models/features-model';
import { OtpWidgetService } from '../service/otp-widget.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'proxy-send-otp',
    templateUrl: './send-otp.component.html',
    encapsulation: ViewEncapsulation.ShadowDom,
    styleUrls: ['../../../styles.scss', './send-otp.component.scss'],
})
export class SendOtpComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() public referenceId: string;
    @Input() public target: string;
    @Input() public authToken: string;
    @Input() public showCompanyDetails: boolean;
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
    public cameFromLogin: boolean = false; // Track if user came from login
    public cameFromSendOtpCenter: boolean = false; // Track if user came from send-otp-center component
    public referenceElement: HTMLElement = null;
    public authReference: HTMLElement = null;
    public showCard: boolean = false;
    public showLogin: BehaviorSubject<boolean> = this.otpWidgetService.showlogin;
    public showSkeleton: boolean = false;
    constructor(
        private ngZone: NgZone,
        private store: Store<IAppState>,
        private renderer: Renderer2,
        private otpWidgetService: OtpWidgetService,
        private otpService: OtpService
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
        this.toggleSendOtp(true);
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
                this.showSkeleton = true;
                this.appendSkeletonLoader(this.referenceElement, 1);
                this.addButtonsToReferenceElement(this.referenceElement);
            }
        }
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
                }

                if (totalButtons === 0) {
                    if (this.showSkeleton) {
                        this.showSkeleton = false;
                        this.removeSkeletonLoader(element);
                    }
                    this.appendCreateAccountText(element);
                    return;
                }

                // Add a fallback timeout to ensure skeleton is removed
                const fallbackTimeout = setTimeout(() => {
                    if (this.showSkeleton) {
                        this.showSkeleton = false;
                        this.removeSkeletonLoader(element);
                        const allButtons = element.querySelectorAll('button');
                        allButtons.forEach((button) => {
                            button.style.visibility = 'visible';
                        });
                        this.appendCreateAccountText(element);
                    }
                }, 3000);

                const immediateFallback = setTimeout(() => {
                    if (this.showSkeleton) {
                        this.showSkeleton = false;
                        this.forceRemoveAllSkeletonLoaders();
                        const allButtons = element.querySelectorAll('button');
                        allButtons.forEach((button) => {
                            button.style.visibility = 'visible';
                        });
                        this.appendCreateAccountText(element);
                    }
                }, 1000);

                for (const buttonsData of widgetDataArray) {
                    if (buttonsData?.service_id === FeatureServiceIds.Msg91OtpService) {
                        this.otpWidgetService.scriptLoading
                            .pipe(
                                skip(1),
                                filter((e) => !e),
                                take(1)
                            )
                            .subscribe(() => {
                                this.appendButton(element, buttonsData);
                                buttonsProcessed++;
                                this.checkAndAppendCreateAccountText(
                                    element,
                                    buttonsProcessed,
                                    totalButtons,
                                    fallbackTimeout,
                                    immediateFallback
                                );
                            });
                    } else {
                        this.appendButton(element, buttonsData);
                        buttonsProcessed++;
                        this.checkAndAppendCreateAccountText(
                            element,
                            buttonsProcessed,
                            totalButtons,
                            fallbackTimeout,
                            immediateFallback
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
        immediateFallback?
    ): void {
        if (buttonsProcessed === totalButtons) {
            // Clear both timeouts since we've successfully processed all buttons
            if (fallbackTimeout) {
                clearTimeout(fallbackTimeout);
            }
            if (immediateFallback) {
                clearTimeout(immediateFallback);
            }

            if (this.showSkeleton) {
                this.showSkeleton = false;
                this.removeSkeletonLoader(element);

                // Show all buttons that were hidden
                const allButtons = element.querySelectorAll('button');
                allButtons.forEach((button) => {
                    button.style.visibility = 'visible';
                });
            }

            // Add a small delay to ensure all buttons are rendered
            setTimeout(() => {
                this.appendCreateAccountText(element);
            }, 100);
        }
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
            visibility: hidden; // Hide button until all are ready
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

    private appendCreateAccountText(element): void {
        const paragraph: HTMLParagraphElement = this.renderer.createElement('p');
        const link: HTMLAnchorElement = this.renderer.createElement('a');

        // Style the paragraph to ensure it's at the bottom
        paragraph.style.cssText = `
            margin: 20px 8px 8px 8px;
            padding-top: 16px;
            font-size: 14px;
           
            box-sizing: border-box;
            outline: none;
            padding: 0px 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
           
            color: #3f4346;
         
            cursor: pointer;
            width: 230px;
        `;

        // Style the link
        link.style.cssText = `
            color: #007bff;
            text-decoration: none;
            cursor: pointer;
            font-weight: 500;
        `;

        // Set the text content
        paragraph.innerHTML = 'New User? ';
        link.textContent = 'Create Account';

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

        for (let i = 0; i < buttonCount; i++) {
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
}
