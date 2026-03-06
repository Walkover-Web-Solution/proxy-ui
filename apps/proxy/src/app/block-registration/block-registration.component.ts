import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ProxyAuthScriptUrl } from '@proxy/models/features-model';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-block-registration',
    template: '',
})
export class BlockRegistrationComponent implements OnInit {
    private scriptLoaded = new BehaviorSubject<boolean>(false);
    public loadingScript = new BehaviorSubject<boolean>(false);

    constructor(private route: ActivatedRoute, private ngZone: NgZone, private toast: PrimeNgToastService) {}

    ngOnInit(): void {
        const params = this.route.snapshot.queryParamMap;
        this.loadScript({
            referenceId: params.get('reference_id'),
            firstName: params.get('first_name'),
            lastName: params.get('last_name'),
            signupServiceId: params.get('signup_service_id'),
        });
    }

    private loadScript(params: {
        referenceId: string;
        firstName: string;
        lastName: string;
        signupServiceId: string;
    }): void {
        const configuration = {
            referenceId: params.referenceId,
            type: 'authorization',
            isPreview: false,
            first_name: params.firstName,
            last_name: params.lastName,
            signup_service_id: params.signupServiceId,
            success: (data) => {
                this.ngZone.run(() => {
                    this.toast.success('Authorization successfully completed');
                });
            },
            failure: (error) => {
                this.ngZone.run(() => {
                    this.toast.error(error?.message);
                });
            },
        };

        if (!this.scriptLoaded.getValue()) {
            this.loadingScript.next(true);
            const head = document.getElementsByTagName('head')[0];
            const currentTimestamp = new Date().getTime();
            const otpProviderScript = document.createElement('script');
            otpProviderScript.type = 'text/javascript';
            otpProviderScript.src = ProxyAuthScriptUrl(environment.proxyServer, currentTimestamp);
            head.appendChild(otpProviderScript);
            otpProviderScript.onload = () => {
                this.loadingScript.next(false);
                window?.['initVerification']?.(configuration);
            };
            this.scriptLoaded.next(true);
        } else {
            window?.['initVerification']?.(configuration);
        }
    }
}
