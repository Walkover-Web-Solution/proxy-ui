import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import { BillingUrls } from '@msg91/urls/subscription';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminBillingModule {}

@Injectable({
    providedIn: ServicesAdminBillingModule,
})
export class BillingService {
    // Header
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
        @Inject(ProxyBaseUrls.SubscriptionProxy) private billingProxy: any,
        private authService: AuthService
    ) {}

    /**
     * Fetches all the supported currencies
     *
     * @return {Observable<any>} Observable to carry out further operations
     * @memberof BillingService
     */
    public fetchCurrencies(): Observable<any> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(BillingUrls.fetchCurrencies(this.billingProxy), {}, this.options);
    }

    /**
     * Fetches all the microservices
     *
     * @return {Observable<any>} Observable to carry out further operations
     * @memberof BillingService
     */
    public fetchMicroservices(): Observable<any> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(BillingUrls.fetchMicroservices(this.billingProxy), {}, this.options);
    }

    /**
     * Fetches all the discount types
     *
     * @return {Observable<any>} Observable to carry out further operations
     * @memberof BillingService
     */
    public fetchDiscountTypes(): Observable<any> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(BillingUrls.fetchDiscounts(this.billingProxy), {}, this.options);
    }

    /**
     * Fetches the service credits
     *
     * @return {Observable<BaseResponse<IAdminGetAllServicesCreditsResModel[], any>>} Observable to carry out further operations
     * @memberof BillingService
     */
    public fetchServices(): Observable<BaseResponse<any[], any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(BillingUrls.fetchServiceTypes(this.billingProxy), null, this.options);
    }

    /**
     * Fetches all the plan amount types
     *
     * @return {Observable<any>} Observable to carry out further operations
     * @memberof BillingService
     */
    public fetchPlanTypes(): Observable<any> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(BillingUrls.fetchPlanTypes(this.billingProxy), {}, this.options);
    }
}
