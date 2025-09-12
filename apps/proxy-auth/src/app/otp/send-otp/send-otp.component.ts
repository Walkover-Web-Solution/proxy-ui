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
    @Input() public userToken: string;
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
    public showLogin: BehaviorSubject<boolean> = this.otpWidgetService.showlogin;
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
}
