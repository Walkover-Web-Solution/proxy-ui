import { CommonModule } from '@angular/common';
import { NgModule, Inject, Injectable } from '@angular/core';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { VoiceDialPlanResponse } from '@msg91/models/voice-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminPlanUrls, BillingServicesUrls } from '@msg91/urls/subscription';
import {
    IAdminServiceRequest,
    IAdminGetAllServicesCreditsResModel,
    IAdmminServicesCurrenciesResModel,
    IAdmminServicesRequest,
} from '@msg91/models/subscription-models';
import { GetAllDialPlansResponse } from '@msg91/models/whatsapp-models';
import { NumbersUrls } from '@msg91/urls/numbers';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminBillingExtraServiceModule {}

@Injectable({
    providedIn: ServicesAdminBillingExtraServiceModule,
})
export class BillingServicesService {
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
        @Inject(ProxyBaseUrls.SubscriptionProxy) private servicesBaseUrl: string,
        @Inject(ProxyBaseUrls.VoiceBaseURL) private voiceBaseUrl: any,
        @Inject(ProxyBaseUrls.WhatsAppProxy) private whatsAppBaseUrl: any,
        @Inject(ProxyBaseUrls.NumbersProxy) private numbersProxy: any
    ) {}

    /**
     * Fetches the service credits
     *
     * @param {IAdmminServicesRequest} params Request object for API
     * @return {Observable<BaseResponse<IAdminGetAllServicesCreditsResModel[], any>>} Observable to carry out further operations
     * @memberof BillingServicesService
     */
    public fetchServicesCredits(
        params: IAdmminServicesRequest
    ): Observable<BaseResponse<IAdminGetAllServicesCreditsResModel[], any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const requestObject = {
            ...params,
            with: `serviceCreditRates,serviceCreditRates.currency,service`,
            getAll: true,
        };
        return this.http.post<BaseResponse<IAdminGetAllServicesCreditsResModel[], any>>(
            BillingServicesUrls.fetchServiceCredits(this.servicesBaseUrl),
            requestObject,
            this.options
        );
    }

    /**
     * Creates the new service
     *
     * @param {IAdminServiceRequest} requestObj Request object for API
     * @return {Observable<BaseResponse<IAdmminServicesCurrenciesResModel[], any>>} Observable to carry out further operations
     * @memberof BillingServicesService
     */
    public createService(
        requestObj: IAdminServiceRequest
    ): Observable<BaseResponse<IAdmminServicesCurrenciesResModel[], any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<BaseResponse<IAdmminServicesCurrenciesResModel[], any>>(
            BillingServicesUrls.createService(this.servicesBaseUrl),
            requestObj,
            this.options
        );
    }

    /**
     * Updates the service
     *
     * @param {IAdminServiceRequest} requestObj Request object for API
     * @return {Observable<BaseResponse<IAdmminServicesCurrenciesResModel[], any>>} Observable to carry out further operations
     * @memberof BillingServicesService
     */
    public updateService(
        requestObj: IAdminServiceRequest
    ): Observable<BaseResponse<IAdmminServicesCurrenciesResModel[], any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const serviceId = String(requestObj.id);
        delete requestObj.id;
        return this.http.patch<BaseResponse<IAdmminServicesCurrenciesResModel[], any>>(
            BillingServicesUrls.updateService(this.servicesBaseUrl).replace(':id', serviceId),
            requestObj,
            this.options
        );
    }

    /**
     * Loads voice dial plans based on search text
     *
     * @param {{ dialPlanName?: string, currency_code?: string }} requestObj Request object for the API
     * @return {Observable<BaseResponse<VoiceDialPlanResponse, void>>} Observable to carry out further operations
     * @memberof BillingServicesService
     */
    public loadVoiceDialPlans(requestObj: {
        dialPlanName?: string;
        currency_code?: string;
        not_empty?: number;
        name?: string;
        direction: string;
    }): Observable<BaseResponse<VoiceDialPlanResponse, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const url = AdminPlanUrls.loadVoiceDialPlans(this.voiceBaseUrl);
        const requestObject: { [key: string]: any } = { direction: requestObj.direction };
        if (requestObj.dialPlanName) {
            requestObject.name = requestObj.dialPlanName;
        }
        if (requestObj.currency_code) {
            requestObject.currency_code = requestObj.currency_code;
        }
        if (!isNaN(requestObj.not_empty)) {
            requestObject.not_empty = requestObj.not_empty;
        }
        if (requestObj.name) {
            requestObject.name = requestObj.name;
        }
        return this.http.get(url, { ...requestObject, page_size: 100 }, this.options);
    }

    /**
     * Fetches all the dial plans
     *
     * @param {*} requestObj Request object for the API
     * @return {Observable<BaseResponse<GetAllDialPlansResponse, any>>} Observable to carry out further operations
     * @memberof BillingServicesService
     */
    public getAllDialPlans(requestObj: any): Observable<BaseResponse<GetAllDialPlansResponse, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<GetAllDialPlansResponse, any>>(
            AdminPlanUrls.getAllDialPlans(this.whatsAppBaseUrl),
            { ...requestObj },
            this.options
        );
    }

    public getNumbersDialPlans(requestObj: any): Observable<BaseResponse<GetAllDialPlansResponse, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<GetAllDialPlansResponse, any>>(
            NumbersUrls.adminDialPlan(this.numbersProxy),
            { ...requestObj },
            this.options
        );
    }
}
