import { Inject, Injectable } from '@angular/core';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { BaseResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { Observable } from 'rxjs';
import { BillingUrls } from './billing.urls';
import {
    IBillingAddPaymentMethodResponse,
    IBillingPaymentMethodsResponse,
    IBillingPlan,
    IBillingSetDefaultPaymentMethodRequest,
    IBillingSubscriptionStatus,
    IBillingSubscriptionUsage,
    IBillingUpgradeRequest,
    IBillingUpgradeResponse,
} from './billing.models';

@Injectable({
    providedIn: 'root',
})
export class BillingService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: string
    ) {}

    public getPlans(): Observable<BaseResponse<IBillingPlan[], void>> {
        return this.http.get<BaseResponse<IBillingPlan[], void>>(BillingUrls.getPlans(this.baseUrl));
    }

    public getPlanByCode(planCode: string): Observable<BaseResponse<IBillingPlan, void>> {
        return this.http.get<BaseResponse<IBillingPlan, void>>(BillingUrls.getPlanByCode(this.baseUrl, planCode));
    }

    public getSubscriptionUsage(): Observable<BaseResponse<IBillingSubscriptionUsage, void>> {
        return this.http.get<BaseResponse<IBillingSubscriptionUsage, void>>(
            BillingUrls.getSubscriptionUsage(this.baseUrl)
        );
    }

    public getSubscriptionStatus(): Observable<BaseResponse<IBillingSubscriptionStatus, void>> {
        return this.http.get<BaseResponse<IBillingSubscriptionStatus, void>>(
            BillingUrls.getSubscriptionStatus(this.baseUrl)
        );
    }

    public createCustomer(): Observable<BaseResponse<unknown, void>> {
        return this.http.post<BaseResponse<unknown, void>>(BillingUrls.createCustomer(this.baseUrl), {});
    }

    public upgradeSubscription(
        body: IBillingUpgradeRequest
    ): Observable<BaseResponse<IBillingUpgradeResponse, IBillingUpgradeRequest>> {
        return this.http.post<BaseResponse<IBillingUpgradeResponse, IBillingUpgradeRequest>>(
            BillingUrls.upgradeSubscription(this.baseUrl),
            body
        );
    }

    public addPaymentMethod(): Observable<BaseResponse<IBillingAddPaymentMethodResponse, void>> {
        return this.http.post<BaseResponse<IBillingAddPaymentMethodResponse, void>>(
            BillingUrls.addPaymentMethod(this.baseUrl),
            {}
        );
    }

    public getPaymentMethods(): Observable<BaseResponse<IBillingPaymentMethodsResponse, void>> {
        return this.http.get<BaseResponse<IBillingPaymentMethodsResponse, void>>(
            BillingUrls.getPaymentMethods(this.baseUrl)
        );
    }

    public setDefaultPaymentMethod(
        body: IBillingSetDefaultPaymentMethodRequest
    ): Observable<BaseResponse<unknown, IBillingSetDefaultPaymentMethodRequest>> {
        return this.http.post<BaseResponse<unknown, IBillingSetDefaultPaymentMethodRequest>>(
            BillingUrls.setDefaultPaymentMethod(this.baseUrl),
            body
        );
    }
}
