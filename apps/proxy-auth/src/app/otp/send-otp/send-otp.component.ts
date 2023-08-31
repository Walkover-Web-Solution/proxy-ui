import { NgStyle } from '@angular/common';
import { Component, Input, NgZone, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { META_TAG_ID } from '@msg91/constant';
import { BaseComponent } from '@msg91/ui/base-component';
import { select, Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, take, takeUntil } from 'rxjs/operators';

import { getWidgetData } from '../store/actions/otp.action';
import { IAppState } from '../store/app.state';
import { selectGetOtpInProcess, selectResendOtpInProcess, selectVerifyOtpInProcess } from '../store/selectors';

@Component({
    selector: 'msg91-send-otp',
    templateUrl: './send-otp.component.html',
    encapsulation: ViewEncapsulation.ShadowDom,
    styleUrls: ['../../../styles.scss', './send-otp.component.scss'],
})
export class SendOtpComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() public referenceId: string;
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
    public selectResendOtpInProcess$: Observable<boolean>;
    public selectVerifyOtpInProcess$: Observable<boolean>;
    public animate: boolean = false;

    constructor(private ngZone: NgZone, private store: Store<IAppState>) {
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
    }

    ngOnInit() {
        this.toggleSendOtp();
        this.loadExternalFonts();
        this.store.dispatch(
            getWidgetData({
                referenceId: this.referenceId,
            })
        );
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    private loadExternalFonts() {
        const node = document.querySelector('msg91-auth')?.shadowRoot;
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
