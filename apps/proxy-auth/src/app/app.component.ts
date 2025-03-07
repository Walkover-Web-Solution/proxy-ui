import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    selector: 'proxy-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent extends BaseComponent implements OnInit, OnDestroy {
    public title = 'otp-provider';

    constructor() {
        super();
    }

    ngOnInit() {
        this.initOtpProvider();
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public initOtpProvider() {
        if (!environment.production) {
            const sendOTPConfig = {
                referenceId: '137401i1700563847655c8b8703c52',
                target: '_self',
                success: (data) => {
                    console.log('success response', data);
                },
                failure: (error) => {
                    console.log('failure reason', error);
                },
            };
            window.initVerification(sendOTPConfig);
        }
    }
    //  public initUserDetails(){
    //         if (!environment.production) {
    //             const sendOTPConfig = {
    //                 referenceId: '137401i1700563847655c8b8703c52',
    //                 target: '_self',
    //                 success: (data) => {
    //                     console.log('success response', data);
    //                 },
    //                 failure: (error) => {
    //                     console.log('failure reason', error);
    //                 },
    //             };
    //             window.initVerification(sendOTPConfig);
    //         }
    //     }
}
