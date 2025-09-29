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
                userToken:
                    'RjlZcXJsQ3VRMmY0eWtkOURraENNMFNpSE5zcGFlMkVPdDZIT05WR1BuLzVrM1BLaThoR2VjRUVMcVgwTXVNVkcvQnczQ3RiR0M5aGRWYXNTT2JxRkRhbTczbjdBN3VqbEpESFRVTmY1QnZGUDQ1SHJXeGhkd1hjR0M1WHUxSlBMVnhBVHlIWE1tZWRMcW5qZSswNXE5VEZDVURrWStTbWNmZGVRZ1ZyQVVnZHdBelkyUll4MU8zZEdJUGpqZnR0RmNjclRyZnBTQTh3M0FSUjErd3BzUT09',
                pass: '123456',
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
