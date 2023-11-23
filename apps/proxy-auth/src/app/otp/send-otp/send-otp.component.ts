import { OtpService } from './../service/otp.service';
import { NgStyle } from '@angular/common';
import { Component, Input, NgZone, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { META_TAG_ID } from '@proxy/constant';
import { BaseComponent } from '@proxy/ui/base-component';
import { select, Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, take, takeUntil } from 'rxjs/operators';

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
    @Input() public addInfo: any;
    @Input() public target: string;
    @Input()
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

    public show$: Observable<boolean> = of(false);
    public selectGetOtpInProcess$: Observable<boolean>;
    public selectWidgetData$: Observable<any>;
    public selectResendOtpInProcess$: Observable<boolean>;
    public selectVerifyOtpInProcess$: Observable<boolean>;
    public animate: boolean = false;

    public otpWidgetData;
    public showRegistration = new BehaviorSubject<boolean>(true);

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
        this.toggleSendOtp();
        this.loadExternalFonts();
        this.store.dispatch(
            getWidgetData({
                referenceId: this.referenceId,
                payload: { ...(this.addInfo && { addInfo: this.addInfo }) },
            })
        );
        this.selectWidgetData$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((widgetData) => {
            this.otpWidgetData = widgetData?.find((widget) => widget?.service_id === FeatureServiceIds.Msg91OtpService);
            if (this.otpWidgetData) {
                this.otpWidgetService.setWidgetConfig(this.otpWidgetData?.widget_id, this.otpWidgetData?.token_auth);
                this.otpWidgetService.loadScript();
            }
        });
        this.otpWidgetService.otpWidgetToken.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((token) => {
            console.log(token, this.otpWidgetData);
            this.otpService
                .callBackUrl(this.otpWidgetData.callbackUrl, { state: this.otpWidgetData?.state, code: token })
                .subscribe(
                    (res) => {
                        console.log(res);
                    },
                    (error: HttpErrorResponse) => {
                        if (error?.status === 403) {
                            this.ngZone.run(() => {
                                this.showRegistration.next(true);
                            });
                        }
                    }
                );
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

    public toggleSendOtp() {
        let referneceElementExist = document.getElementById(this.referenceId);
        if (!referneceElementExist) {
            this.show$.pipe(take(1)).subscribe((res) => {
                this.ngZone.run(() => {
                    if (res) {
                        this.animate = true;
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
            this.addButtonsToReferenceElement(referneceElementExist);
        }
    }

    private addButtonsToReferenceElement(element): void {
        this.selectWidgetData$
            .pipe(
                filter((e) => !!e),
                take(1)
            )
            .subscribe((widgetDataArray) => {
                for (let buttonsData of widgetDataArray) {
                    const button: HTMLButtonElement = this.renderer.createElement('button');
                    const image: HTMLImageElement = this.renderer.createElement('img');
                    const span: HTMLSpanElement = this.renderer.createElement('span');
                    button.style.cssText = `
                        outline: none;
                        padding: 0px 16px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 14px;
                        background-color: transparent;
                        border: 1px solid #3f4346;
                        border-radius: 4px;
                        line-height: 40px;
                        color: #3f4346;
                        margin: 8px;
                    `;
                    image.style.cssText = `
                        height: 20px;
                        width: 20px;
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
                        window.open(buttonsData.urlLink, this.target);
                    });
                    this.renderer.appendChild(button, image);
                    this.renderer.appendChild(button, span);
                    this.renderer.appendChild(element, button);
                }
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
