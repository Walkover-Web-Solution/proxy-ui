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
                    'czI0L3haUmFuTGJUL0NIZ3ZTdk1EcUFjUGlCenRrZEZhRVdQZ2lkMlVtQWJIOUQvYVlHVS90MHVGWnozTFJmR1hSZFJXRW4zRU5ML0Z6L2IweDM4UFQxNzN2ZWV1ZlZabVJZSjRZcit5NUhoZ0FHellDd3p5M0FNV2VLbGNhU3pnSy8raHlSZTZCcll4TEVTVWt1endBV0xDdG1ta0N1SjZ1OEljZFlnTjNsdjFsTVVqUkpGcGFUOThzNjF6MERqelBkckVTY0F2TUtSMGR2ZHlLakhVdz09',
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
