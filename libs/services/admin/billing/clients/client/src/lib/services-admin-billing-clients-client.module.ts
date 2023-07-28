import { CommonModule } from '@angular/common';
import { NgModule, Inject, Injectable } from '@angular/core';
import { BaseResponse, ProxyBaseUrls, MicroserviceBaseResponse } from '@msg91/models/root-models';
import { VoiceDidNumberResponse } from '@msg91/models/voice-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClientUrls } from '@msg91/urls/subscription';
import {
    ICalculateProRatedReq,
    IClientModel,
    IFetchUpgradeDowngradePlansReq,
    IModifySubscriptionReq,
    IModifySubscriptionStatusReq,
} from '@msg91/models/subscription-models';
import { NumbersUrls } from '@msg91/urls/numbers';
import { IGetAvailableLongCodeReq, INumberAvailableLongCode } from '@msg91/models/numbers-models';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminBillingClientsModule {}

@Injectable({
    providedIn: ServicesAdminBillingClientsModule,
})
export class ClientsService {
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
        @Inject(ProxyBaseUrls.SubscriptionProxy) private clientsBaseUrl: any,
        @Inject(ProxyBaseUrls.VoiceBaseURL) private voiceBaseUrl: any,
        @Inject(ProxyBaseUrls.WhatsAppProxy) private whatsAppBaseUrl: any,
        @Inject(ProxyBaseUrls.NumbersProxy) private numberBaseUrl: any,
        private authService: AuthService
    ) {}

    /**
     * Fetches the clients' list
     *
     * @param {*} params API params
     * @return {Observable<IClientModel[]>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public getClientList(params: any): Observable<IClientModel[]> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const requestObject = {
            ...params,
            with: `companyPlans.planAmount.plan,companyPlans.planAmount.currency,currency`,
        };
        return this.http.post(ClientUrls.getCompanies(this.clientsBaseUrl), requestObject, this.options);
    }

    /**
     * Fetches the plan details
     *
     * @param {*} requestObject API params
     * @return {Observable<any>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public getPlan(requestObject: any): Observable<any> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const params = {
            ...requestObject,
            with: `planAmounts.planType,planAmounts.currency,serviceCredits.service`,
        };
        return this.http.post(ClientUrls.getPlans(this.clientsBaseUrl), { ...params }, this.options).pipe(
            map((res) => {
                const data: any = res;
                return data['data'];
            })
        );
    }

    /**
     * Fetches the service credits
     *
     * @return {Observable<BaseResponse<IAdminGetAllServicesCreditsResModel[], any>>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public fetchServices(): Observable<BaseResponse<any[], any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(ClientUrls.fetchServiceCredits(this.clientsBaseUrl), null, this.options);
    }

    /**
     * Assigns the plan to a client
     *
     * @param {any} params Request object for API
     * @return {Observable<BaseResponse<IAdminGetAllServicesCreditsResModel[], any>>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public assignNewPlan(params: any): Observable<BaseResponse<any[], any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post(ClientUrls.assignNewPlan(this.clientsBaseUrl), params, this.options);
    }

    /**
     * Fetches the subscription details
     *
     * @param {{ id: number }} request ID of subscription
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public fetchSubscriptionDetails(request: { id: number }): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const requestObject = {
            with: 'company,planAmount.plan.microservice,companyPlanServices.appliedDiscounts.discountType,planAmount.currency,planAmount.planType,appliedDiscounts.discountType,companyPlanServices.planService.serviceCredit.service',
            ...request,
        };
        return this.http.post(ClientUrls.fetchSubscriptionDetails(this.clientsBaseUrl), requestObject, this.options);
    }

    /**
     * Fetches the plan details on a subscription
     *
     * @param {{ id: number }} request ID of plan
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public fetchPlanDetails(request: { id: number }): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const requestObject = {
            with: 'microservice,serviceCredits.service,serviceCredits.serviceCreditRates.currency,planAmounts.planType,planAmounts.currency',
            ...request,
        };
        return this.http.post(ClientUrls.getPlans(this.clientsBaseUrl), requestObject, this.options);
    }

    /**
     * Fetches plans for upgrade/downgrade of subscription
     *
     * @param {IFetchUpgradeDowngradePlansReq} request Request params for API
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public fetchPlansForUpgradeDowngrade(request: IFetchUpgradeDowngradePlansReq): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const requestObject = {
            with: 'plan',
            ...request,
        };
        return this.http.get(
            ClientUrls.fetchPlansForUpgradeDowngrade(this.clientsBaseUrl),
            requestObject,
            this.options
        );
    }

    /**
     * Modifies the subscription upgrade or downgrade
     *
     * @param {IModifySubscriptionReq} request API request params
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public modifySubscription(request: IModifySubscriptionReq): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.patch(ClientUrls.fetchPlansForUpgradeDowngrade(this.clientsBaseUrl), request, this.options);
    }

    /**
     * Modifies the subscription status start, stop, reactivate, deactivate
     *
     * @param {IModifySubscriptionStatusReq} request Request object for API
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public modifySubscriptionStatus(request: IModifySubscriptionStatusReq): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.patch(ClientUrls.modifySubscriptionStatus(this.clientsBaseUrl), request, this.options);
    }

    /**
     * Calculates the prorated amound for a client during new plan assignment
     *
     * @param {ICalculateProRatedReq} request Request object for API
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public calculateProRatedAmount(request: ICalculateProRatedReq): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(ClientUrls.calculateProRatedAmount(this.clientsBaseUrl), request, this.options);
    }

    /**
     * Loads voice DID numbers based on search text
     *
     * @param {{ didNumber?: string, currency_code?: string }} requestObj Request object for the API
     * @return {Observable<BaseResponse<VoiceDidNumberResponse, any>>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public loadVoiceDidNumbers(requestObj: {
        didNumber?: string;
        currency_code?: string;
    }): Observable<BaseResponse<VoiceDidNumberResponse, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        let url = ClientUrls.loadVoiceDidNumbers(this.voiceBaseUrl);
        const requestObject: any = {};
        if (requestObj.didNumber) {
            requestObject.number = requestObj.didNumber;
        }
        if (requestObj.currency_code) {
            requestObject.currency_code = requestObj.currency_code;
        }
        return this.http.get(url, { ...requestObject, page_size: 100 }, this.options);
    }

    /**
     * Loads information if the company has global number assigned in any subscription
     *
     * @param {string} companyId Company ID
     * @return {dialplan_id: number, subscription_id: number} Observable to carry out further operations
     * @memberof ClientsService
     */
    public checkIfGlobalNumberAssigned(
        companyId: string
    ): Observable<BaseResponse<{ dialplan_id: number; subscription_id: number }, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        let url = ClientUrls.checkIfGlobalNumberAssigned(this.voiceBaseUrl).replace(':companyId', companyId);
        return this.http.get(url, {}, this.options);
    }

    /**
     * Fetches the integrated whatsapp numbers for a company
     *
     * @param {company_id?: number} request Request object for API
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public fetchWhatsappIntegratedNumbers(requestObject: { company_id?: number }): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        if (requestObject?.company_id) {
            return this.http.get(
                ClientUrls.fetchWhatsappIntegratedNumbers(`${this.whatsAppBaseUrl}`),
                requestObject,
                this.options
            );
        } else {
            return this.http.get(
                ClientUrls.fetchWhatsappIntegratedNumbers(this.whatsAppBaseUrl),
                requestObject,
                this.options
            );
        }
    }

    /**
     * Fetches the longcode whatsapp numbers for a company
     *
     * @param {service_selected?: string} params params object for API
     * @return {Observable<MicroserviceBaseResponse<INumberAvailableLongCode, any>>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public getAvailableLongcodeNumbers(
        params: IGetAvailableLongCodeReq
    ): Observable<MicroserviceBaseResponse<INumberAvailableLongCode, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<MicroserviceBaseResponse<INumberAvailableLongCode, any>>(
            NumbersUrls.adminAvailableLongcode(this.numberBaseUrl),
            params,
            this.options
        );
    }

    /**
     * Fetches the integrated whatsapp numbers in a subscription
     *
     * @param {number} id Request object for API
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof ClientsService
     */
    public fetchPlanServiceDetails(id: number): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(
            ClientUrls.fetchPlanServiceDetails(`${this.clientsBaseUrl}`).replace(':plan_id', String(id)),
            null,
            this.options
        );
    }
}
