import { ChangeDetectionStrategy, Component, NgZone, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ProxyAuthScriptUrl } from '@proxy/models/features-model';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { environment } from '../../../environments/environment';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-registration',
    imports: [],
    template: '',
})
export class RegistrationComponent implements OnInit {
    private scriptLoaded = new BehaviorSubject<boolean>(false);
    public loadingScript = new BehaviorSubject<boolean>(false);

    private route = inject(ActivatedRoute);
    private ngZone = inject(NgZone);
    private toast = inject(PrimeNgToastService);

    ngOnInit(): void {
        const params = this.route.snapshot.queryParamMap;
        this.loadScript({
            referenceId: params.get('reference_id'),
            firstName: params.get('first_name'),
            lastName: params.get('last_name'),
            signupServiceId: params.get('signup_service_id'),
            email: params.get('email'),
        });
    }

    private loadScript(params: {
        referenceId: string;
        firstName: string;
        lastName: string;
        signupServiceId: string;
        email: string;
    }): void {
        const configuration = {
            referenceId: params.referenceId,
            type: 'authorization',
            isPreview: false,
            isRegisterFormOnly: true,
            firstName: params.firstName,
            lastName: params.lastName,
            signupServiceId: params.signupServiceId,
            email: params.email,
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
