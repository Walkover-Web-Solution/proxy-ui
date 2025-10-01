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
                authToken:
                    'eFJTVGRTb3YvYzJjNUNVWWtYb1I4QllUbjZqYkVHWFhHWUp4cGVjdW5RV3BueXJldmpCNzhxYWg0dUFRdForY2VHTVFlLzcvcU1PMTZ1TDVnZEVFVUpYclAwdG5QYlJBcHNFbHZiTVN2RjFHaHArU0FldHp3U3gyZ2J5L3l6SUtUUjFrTnU2cUx3WGlDVWhOWVRncnhBNE9QNVBML1FWTmNhaWR3c3JhaTJxWGlxZk40M0lUZkNSWEFXQnJGY2FNNU5KdWFpa0ZXOGhNZlRpblpuU0NkUT09',
                pass: '123456',
                type: 'user-management',
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
}
