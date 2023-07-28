import { CommonModule } from '@angular/common';
import { NgModule, Inject, Injectable } from '@angular/core';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import { SubscriptionUrls } from '@msg91/urls/subscription';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminBillingSubscriptionModule {}

@Injectable({
    providedIn: ServicesAdminBillingSubscriptionModule,
})
export class SubscriptionService {
    public options = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': '',
        },
        withCredentials: false,
    };

    constructor(
        private authService: AuthService,
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.SubscriptionProxy) private subscriptionBaseUrl: string,
        @Inject(ProxyBaseUrls.MsgAdminProxy) private msgBaseUrl: any,
        @Inject(ProxyBaseUrls.MsgProxy) private msgProxyBaseUrl: any
    ) {}

    /**
     * Fetches the subscriptions
     *
     * @param {*} requestObj Request object for subscriptions API
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof SubscriptionService
     */
    public fetchSubscriptions(requestObj: any): Observable<BaseResponse<any, any>> {
        const requestObject = {
            with: `company,planAmount.plan.microservice,companyPlanServices.appliedDiscounts.discountType,planAmount.currency,planAmount.planType,appliedDiscounts.discountType,companyPlanServices.planService.serviceCredit.service,planAmount.plan.planAmounts.planType`,
            ...requestObj,
        };
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post(
            SubscriptionUrls.fetchSubscription(this.subscriptionBaseUrl),
            requestObject,
            this.options
        );
    }

    /**
     * Fetches plans for autocomplete plan field for filtering in subscription module
     *
     * @param {*} requestObj Request object for plans API
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof SubscriptionService
     */
    public fetchPlans(requestObj: any): Observable<BaseResponse<any, any>> {
        const requestObject = {
            with: `microservice,serviceCredits.service,serviceCredits.serviceCreditRates.currency,planAmounts.planType,planAmounts.currency`,
            ...requestObj,
        };
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post(SubscriptionUrls.fetchPlans(this.subscriptionBaseUrl), requestObject, this.options);
    }

    /**
     * Fetches client details by panel_user_id
     *
     * @param {number} id Client ID
     * @return {*} {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof SubscriptionService
     */
    public fetchClientDetails(id: number): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(SubscriptionUrls.getClient(this.msgProxyBaseUrl), { keyword: id }, this.options);
    }

    /**
     * Updates subscription limit
     *
     * @param {number} planId Plan ID
     * @param {{overusage_limit_user: number, overusage_limit_admin: number}} requestObj Request for API
     * @return {*}  {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof SubscriptionService
     */
    public updateSubscriptionLimit(
        planId: number,
        requestObj: { overusage_limit_user: number; overusage_limit_admin: number }
    ): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const url = SubscriptionUrls.updateSubscriptionLimit(this.subscriptionBaseUrl).replace(
            ':companyPlanId',
            String(planId)
        );
        return this.http.put(url, requestObj, this.options);
    }
}
