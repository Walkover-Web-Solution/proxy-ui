import { NgModule, Inject, Injectable } from '@angular/core';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    IBillingPlan,
    IFetchPlanReq,
    IPaginatedPlanResponse,
    IPlanCreateReq,
    IPlanUpdateReq,
} from '@msg91/models/subscription-models';
import { AdminPlanUrls } from '@msg91/urls/subscription';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminBillingPlanModule {}

@Injectable({
    providedIn: ServicesAdminBillingPlanModule,
})
export class AdminPlanService {
    public options = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': '',
        },
        withCredentials: false,
    };

    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.SubscriptionProxy) private subscriptionBaseUrl: any,
        private authService: AuthService
    ) {}

    /**
     * Fetches all plans
     *
     * @param {IFetchPlanReq} payload Request payload for API
     * @return {Observable<BaseResponse<IPaginatedPlanResponse<IBillingPlan[]>, string>>} Observable to carry out further operations
     * @memberof AdminPlanService
     */
    public fetchPlan(payload: IFetchPlanReq): Observable<BaseResponse<IPaginatedPlanResponse<IBillingPlan[]>, string>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const requestObject: IFetchPlanReq = {
            with: `microservice,serviceCredits.service,serviceCredits.serviceCreditRates.currency,planAmounts.planType,planAmounts.currency`,
            ...payload,
        };
        return this.http.post<BaseResponse<IPaginatedPlanResponse<IBillingPlan[]>, string>>(
            AdminPlanUrls.fetchPlan(this.subscriptionBaseUrl),
            requestObject,
            this.options
        );
    }

    /**
     * Creates new plan
     *
     * @param {IPlanCreateReq} payload Request payload for API
     * @return {Observable<BaseResponse<IPaginatedPlanResponse<IBillingPlan[]>, string>>} Observable to carry out further operations
     * @memberof AdminPlanService
     */
    public createPlan(payload: IPlanCreateReq): Observable<any> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<any>(AdminPlanUrls.createPlan(this.subscriptionBaseUrl), payload, this.options);
    }

    /**
     * Updates a plan
     *
     * @param {IPlanUpdateReq} payload Request payload for API
     * @return {Observable<any>} Observable to carry out further operations
     * @memberof AdminPlanService
     */
    public updatePlan(payload: IPlanUpdateReq): Observable<any> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const url = AdminPlanUrls.updatePlan(this.subscriptionBaseUrl).replace(':id', String(payload.id));
        return this.http.patch<any>(url, payload, this.options);
    }

    /**
     * Fetches all the service credits
     *
     * @param {*} requestObject Request object for the API
     * @return {Observable<any>} Observable to carry out further operations
     * @memberof AdminPlanService
     */
    public fetchServiceCredits(requestObject: any): Observable<any> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post(
            AdminPlanUrls.fetchServiceCredits(this.subscriptionBaseUrl),
            { ...requestObject, with: `serviceCreditRates,serviceCreditRates.currency,service` },
            this.options
        );
    }
}
