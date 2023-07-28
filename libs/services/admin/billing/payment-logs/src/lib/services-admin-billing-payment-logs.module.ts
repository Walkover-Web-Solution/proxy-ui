import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { AdminPaymentLogsUrls } from '@msg91/urls/subscription';
import { IPaginatedPaymentLogsResponse, IPaymentLogsReq, IPaymentLogs } from '@msg91/models/subscription-models';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminBillingPaymentLogsModule {}

@Injectable({
    providedIn: ServicesAdminBillingPaymentLogsModule,
})
export class AdminPaymentLogsService {
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
     * Fetches all Payment Logs
     *
     * @param {IPaymentLogsReq}
     * @return {Observable<BaseResponse<IPaymentLogs[], any>} Observable to carry out further operations
     * @memberof AdminPaymentLogsService
     */
    public getPaymentLogs(
        req: IPaymentLogsReq
    ): Observable<BaseResponse<IPaginatedPaymentLogsResponse<IPaymentLogs[]>, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const request: IPaymentLogsReq = {
            with: `companyPlan.planAmount.currency,companyPlan.planAmount.plan,companyPlan.planAmount.planType`,
            ...req,
        };
        return this.http.post<BaseResponse<IPaginatedPaymentLogsResponse<IPaymentLogs[]>, any>>(
            AdminPaymentLogsUrls.getPaymentLogs(this.subscriptionBaseUrl),
            request,
            this.options
        );
    }

    /**
     * Toggle Retry Failed Payment
     *
     * @return {Observable<BaseResponse<any, any>} Observable to carry out further operations
     * @memberof AdminPaymentLogsService
     */
    public toggleRetryPayment(payload: { id: number; need_retry: 1 | 0 }): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.put<BaseResponse<any, any>>(
            AdminPaymentLogsUrls.toggleRetryPayment(this.subscriptionBaseUrl).replace(':id', payload.id.toString()),
            { need_retry: payload.need_retry },
            this.options
        );
    }

    /**
     * Retry Failed Payment
     *
     * @return {Observable<BaseResponse<any, any>} Observable to carry out further operations
     * @memberof AdminPaymentLogsService
     */
    public retryPayment(id: number): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<BaseResponse<any, any>>(
            AdminPaymentLogsUrls.retryPayment(this.subscriptionBaseUrl).replace(':id', id.toString()),
            {},
            this.options
        );
    }

    /**
     * Fetches plans for autocomplete plan field for filtering
     *
     * @param {*} requestObj Request object for plans API
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof AdminPaymentLogsService
     */
    public fetchPlans(requestObj: any): Observable<BaseResponse<any, any>> {
        const requestObject = {
            with: `microservice,serviceCredits.service,serviceCredits.serviceCreditRates.currency,planAmounts.planType,planAmounts.currency`,
            ...requestObj,
        };
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post(AdminPaymentLogsUrls.fetchPlans(this.subscriptionBaseUrl), requestObject, this.options);
    }
}
