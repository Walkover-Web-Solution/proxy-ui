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
                // referenceId: '4512365j175921585768db80f196ea2',
                userToken:
                    'eVFZZXBpRVlKOGQranNWYU5CV1NBRjFZcGdPSVJrUE9DSlZ1clhGNjlRa1lMNC9WT2tGSXdkZ3MzbFRYenk4aDdPRUdGem13a0dkVUU2ZitRQU04c2JZRC9pNDRuWHFnSHhuQm5wQUhXWVIxRFF2WExQa3I4Zk5SV2QrdTB3aDlZVHU2MWc2VFRjVUNWL1Qrb3NrSmhvZ205VmhTSDBGbzVCaDZhQTBYS3pQbUdScEkySkV6bVVMNFJHR3VqaExwWUt2aDRXRENtQXlRZ2xYYm5jU0VFdz09',
                pass: 'dfjk',
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
