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
                    'em5vNC9qSkJTeWQ5eGM0N0prMXhRMUZFRVh5QmE2YlZsc3U1bXpwaFlueTl5RGZxRGN5T1BMZmJ4cFg4OHBrNWdJL2ZlOCtlZG5mYXBCZWR0RHhJdHo2NmlIbjJaMDNqREM0TzhJQm1DVzdLV1MxNFdWK3NZU1hnSlhFNUx2UkZwd3NJZWJ4bzhVZmNmeDUwVmdXcFRZekNLTDRibTFUZWR2V1AvRkdiOFpZPQ==',
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
