import { CommonModule } from '@angular/common';
import { NgModule, Inject, Injectable } from '@angular/core';
import { BaseResponse, ProxyBaseUrls, IToken } from '@msg91/models/root-models';
import {
    CreateUserDialPlanReq,
    CreateUserDialPlanResponse,
    CreateVendorDialPlanReq,
    CreateVendorDialPlanResponse,
    VoiceDialPlanCurrency,
    VoiceDialPlanDetailsApiResponse,
    VoiceDialPlanResponse,
    VoiceDidNumberAndDialPlanAssignmentResponse,
} from '@msg91/models/voice-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';

import { VoiceDialPlanUrls } from '@msg91/urls/voice';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminVoiceDialPlanModule {}

@Injectable({
    providedIn: ServicesAdminVoiceDialPlanModule,
})
export class VoiceDialPlanService {
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
        @Inject(ProxyBaseUrls.VoiceBaseURL) private voiceBaseUrl: any,
        @Inject(ProxyBaseUrls.SubscriptionProxy) private billingProxy: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    /**
     * Fetches the user dial plans
     *
     * @param {*} requestObject Request object for the API
     * @return {Observable<BaseResponse<VoiceDialPlanResponse, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    fetchUserDialPlans(requestObject: any): Observable<BaseResponse<VoiceDialPlanResponse, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(VoiceDialPlanUrls.fetchUserDialPlans(this.voiceBaseUrl), requestObject, this.options);
    }

    /**
     * Fetches the vendor dial plans
     *
     * @param {*} requestObject Request object for the API
     * @return {Observable<BaseResponse<VoiceDialPlanResponse, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    fetchVendorDialPlans(requestObject: any): Observable<BaseResponse<VoiceDialPlanResponse, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(VoiceDialPlanUrls.fetchVendorDialPlans(this.voiceBaseUrl), requestObject, this.options);
    }

    /**
     * Fetches all the supported currencies
     *
     * @return {Observable<VoiceDialPlanCurrency, void>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public fetchCurrencies(): Observable<BaseResponse<VoiceDialPlanCurrency[], void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(VoiceDialPlanUrls.fetchCurrencies(this.billingProxy), {}, this.options);
    }

    /**
     * Creates the new user dial plan
     *
     * @param {CreateUserDialPlanReq} requestObject Request object for the API
     * @return {Observable<BaseResponse<CreateUserDialPlanResponse, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public createUserDialPlan(
        requestObject: CreateUserDialPlanReq
    ): Observable<BaseResponse<CreateUserDialPlanResponse, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post(VoiceDialPlanUrls.createUserDialPlan(this.voiceBaseUrl), requestObject, this.options);
    }

    /**
     * Creates the new vendor dial plan
     *
     * @param {CreateVendorDialPlanReq} requestObject Request object for the API
     * @return {Observable<BaseResponse<CreateVendorDialPlanResponse, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public createVendorDialPlan(
        requestObject: CreateVendorDialPlanReq
    ): Observable<BaseResponse<CreateVendorDialPlanResponse, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post(VoiceDialPlanUrls.createVendorDialPlan(this.voiceBaseUrl), requestObject, this.options);
    }

    /**
     * Deletes the user dial plan
     *
     * @param {number} id Dial plan ID
     * @return {Observable<BaseResponse<string, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public deleteUserDialPlan(id: number, direction: string): Observable<BaseResponse<string, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.delete(
            `${VoiceDialPlanUrls.deleteUserDialPlan(this.voiceBaseUrl)}${direction}/${id}`,
            {},
            this.options
        );
    }

    /**
     * Deletes the vendor dial plan
     *
     * @param {number} id Dial plan ID
     * @return {Observable<BaseResponse<string, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public deleteVendorDialPlan(id: number): Observable<BaseResponse<string, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.delete(`${VoiceDialPlanUrls.deleteVendorDialPlan(this.voiceBaseUrl)}${id}`, {}, this.options);
    }

    /**
     * Fetches the vendor dial plan details
     *
     * @param requestObject Request object for the API
     * @return {Observable<BaseResponse<VoiceDialPlanDetailsApiResponse, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public fetchVendorDialPlanDetails(
        requestObject: any
    ): Observable<BaseResponse<VoiceDialPlanDetailsApiResponse, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const id = requestObject.id;
        delete requestObject.id;
        return this.http.get(
            `${VoiceDialPlanUrls.fetchVendorDialPlanDetails(this.voiceBaseUrl)}${id}`,
            requestObject,
            this.options
        );
    }

    /**
     * Fetches the user dial plan details
     *
     * @param requestObject Request object for the API
     * @return {Observable<BaseResponse<VoiceDialPlanDetailsApiResponse, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public fetchUserDialPlanDetails(
        requestObject: any
    ): Observable<BaseResponse<VoiceDialPlanDetailsApiResponse, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const id = requestObject.id;
        const direction = requestObject.direction;
        delete requestObject.id;
        delete requestObject.direction;
        return this.http.get(
            `${VoiceDialPlanUrls.fetchUserDialPlanDetails(this.voiceBaseUrl)}${direction}/${id}`,
            requestObject,
            this.options
        );
    }

    /**
     * Creates/Updates pricing to a user dial plan
     *
     * @param {*} requestObject Request object for the API
     * @return {Observable<BaseResponse<VoiceDialPlanDetailsApiResponse, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public addPricingToUserDialPlan(
        requestObject: any
    ): Observable<BaseResponse<VoiceDialPlanDetailsApiResponse, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const isUpdateInProgress = requestObject.isUpdateInProgress;
        const rate_id = requestObject.rate_id;
        const id = requestObject.id;
        const direction = requestObject.direction;
        delete requestObject.id;
        delete requestObject.isUpdateInProgress;
        delete requestObject.rate_id;
        delete requestObject.direction;
        return isUpdateInProgress
            ? this.http.put(
                  `${VoiceDialPlanUrls.fetchUserDialPlanDetails(this.voiceBaseUrl)}${direction}/${id}/rates/${rate_id}`,
                  requestObject,
                  this.options
              )
            : this.http.post(
                  `${VoiceDialPlanUrls.fetchUserDialPlanDetails(this.voiceBaseUrl)}${direction}/${id}`,
                  requestObject,
                  this.options
              );
    }

    /**
     * Creates/Updates pricing to a vendor dial plan
     *
     * @param requestObject Request object for the API
     * @return {Observable<BaseResponse<VoiceDialPlanDetailsApiResponse, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public addPricingToVendorDialPlan(
        requestObject: any
    ): Observable<BaseResponse<VoiceDialPlanDetailsApiResponse, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const isUpdateInProgress = requestObject.isUpdateInProgress;
        const rate_id = requestObject.rate_id;
        const id = requestObject.id;
        delete requestObject.id;
        delete requestObject.isUpdateInProgress;
        delete requestObject.rate_id;
        return isUpdateInProgress
            ? this.http.put(
                  `${VoiceDialPlanUrls.fetchVendorDialPlanDetails(this.voiceBaseUrl)}${id}/rates/${rate_id}`,
                  requestObject,
                  this.options
              )
            : this.http.post(
                  `${VoiceDialPlanUrls.fetchVendorDialPlanDetails(this.voiceBaseUrl)}${id}`,
                  requestObject,
                  this.options
              );
    }

    /**
     * Imports the CSV for user dial plan
     *
     * @param {FormData} formData Form data for file
     * @param {number} id Dial plan ID
     * @return {Observable<BaseResponse<string, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public importUserDialPlanCsv(
        formData: FormData,
        id: number,
        direction: string
    ): Observable<BaseResponse<string, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post(
            `${VoiceDialPlanUrls.createUserDialPlan(this.voiceBaseUrl)}${direction}/${id}`,
            formData,
            {
                headers: { noHeader: true, Authorization: this.authService.getTokenSync() },
                withCredentials: false,
            }
        );
    }

    /**
     * Imports CSV for vendor dial plan
     *
     * @param {FormData} formData Form data for file
     * @param {number} id Dial plan ID
     * @return {*}  {Observable<BaseResponse<string, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public importVendorDialPlanCsv(formData: FormData, id: number): Observable<BaseResponse<string, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post(`${VoiceDialPlanUrls.createVendorDialPlan(this.voiceBaseUrl)}${id}`, formData, {
            headers: { noHeader: true, Authorization: this.authService.getTokenSync() },
            withCredentials: false,
        });
    }

    /**
     * Exports the CSV for User dial plan
     *
     * @param {number} id Dial plan ID
     * @return {Observable<BaseResponse<string, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public exportUserDialPlanCsv(id: number, direction: string): Observable<BaseResponse<string, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(
            `${VoiceDialPlanUrls.exportUserDialPlanCsv(this.voiceBaseUrl)}${direction}/${id}?export=1`,
            null,
            this.options
        );
    }

    /**
     * Exports the CSV for vendor dial plan
     *
     * @param {number} id Dial plan ID
     * @return {Observable<BaseResponse<string, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public exportVendorDialPlanCsv(id: number): Observable<BaseResponse<string, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(
            `${VoiceDialPlanUrls.exportVendorDialPlanCsv(this.voiceBaseUrl)}${id}?export=1`,
            null,
            this.options
        );
    }

    /**
     * Fetch DID Number And Dial Plan Assignment List
     *
     * @param params: {[key: string]: any}
     * @return {Observable<BaseResponse<VoiceDidNumberAndDialPlanAssignment, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public getDidNumberAndDialPlanAssignments(params: {
        [key: string]: any;
    }): Observable<BaseResponse<VoiceDidNumberAndDialPlanAssignmentResponse, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParams = { ...params, ...(this.token.companyId && { company_id: this.token.companyId }) };
        return this.http.get<Observable<BaseResponse<VoiceDidNumberAndDialPlanAssignmentResponse, void>>>(
            VoiceDialPlanUrls.didNumberAndDialPlanAssignment(this.voiceBaseUrl),
            newParams,
            this.options
        );
    }

    /**
     * Set Dial Plan in DID Number Assignment List
     *
     * @param didNumberId: number
     * @param  request: { [key: string]: any }
     * @return {Observable<BaseResponse<any, void>>} Observable to carry out further operations
     * @memberof VoiceDialPlanService
     */
    public setDidNumberAndDialPlanAssignments(
        didNumberId: number,
        request: { [key: string]: any }
    ): Observable<BaseResponse<any, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.put<Observable<BaseResponse<any, void>>>(
            VoiceDialPlanUrls.didNumberAndDialPlanAssignment(this.voiceBaseUrl) + didNumberId.toString(),
            request,
            this.options
        );
    }
}
