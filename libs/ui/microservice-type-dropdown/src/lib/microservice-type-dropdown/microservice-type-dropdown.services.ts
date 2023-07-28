import { Inject, Injectable } from '@angular/core';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { IMicroserviceType } from '@msg91/models/subscription-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createUrl } from '@msg91/service';

export const microserviceTypeURLs = {
    fetchMicroServices: (baseUrl) => createUrl(baseUrl, `microservices`),
};

@Injectable()
export class MicroServiceTypeDropdownService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.SubscriptionURLProxy) private subscriptionBaseURL: any
    ) {}

    public fetchMicroServices(): Observable<BaseResponse<IMicroserviceType[], any>> {
        return this.http.get(microserviceTypeURLs.fetchMicroServices(this.subscriptionBaseURL)).pipe(
            map((res) => {
                const data: BaseResponse<IMicroserviceType[], any> = res;
                return data;
            })
        );
    }
}
