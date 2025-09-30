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
                    'ZjlSMHczTTlBSWtSMmN3eWE5ZHBKNkQxM0dJQXlOaUJPcS9KMnhvOU9WZ25PUG5mcjQwaCtmMVY2czJNM3NnbXdhOVJKMXpyQkIxNzBXRGN6M2FkYXNVa2VHTG5XdUI3cXRUTWZ2enl1eVg4UnM2YTZSUHk3cHdOdjVveDVUbVBmSXJFOWQ1bjJxMnZaNXcySXRwZXBMVWxWTWp2QTh4Y2F3VEs1SnU0NXJ2K2c5OTNZalVjczlLL1BKT2k3Q2c5eFVtZm0vU01BRERyb2VOamdUVDVzZz09',
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
