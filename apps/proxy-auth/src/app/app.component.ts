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
                // referenceId: '4512365h176132430068fbad0ce6e37',
                // loginRedirectUrl: 'https://www.google.com',
                // showCompanyDetails: false,
                authToken:
                    'enJqckorNWNuWDFiK1BXRGgzemRUUjRCNlhGRkwzVkFiSTRqYklmWmtlS1VnZXoxWXpldDF5UlRyVmRKekd2VnRnSlg2TjBWOWU1TEdIR3pjUFJzRnhHWExMRi8vL1dZQTJTSG53U0JaZmxVVzIyRXM3RUZBRHlzbi9VclA1dFNOdUEzajQvc25DSU9rSjU2LzdweVdLQUVuUmpyVElMVmpiYjhRSnc5VHFGa1ZNdjFCbUJHcFhoTllQQ2dmTUUxSzh4ZDVJUW5XMGVYVmVLQVE5bGxxUT09',
                type: 'user-management',
                theme: 'dark',
                // isPreview: true,
                isLogin: true,
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
