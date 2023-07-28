import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    IWhatsAppClientReqModel,
    IWhatsAppClientResModel,
    IWhatsAppDashboardReqModel,
    IWhatsAppDashboardResModel,
    IWhatsAppLogReqModel,
    IWhatsAppLogResModel,
    IWhatsAppClientsDropdownResModel,
    IWhatsAppLogsDropdownResModel,
    CreateDialPlanRequest,
    DialPlan,
    DialPlanPricing,
    GetAllDialPlansResponse,
    IClientLogDropdown,
    IFailedLogResponse,
} from '@msg91/models/whatsapp-models';
import { BaseResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import { WhatsappUrls } from 'libs/service/src/lib/utils/admin/whatsapp/whatsapp-urls';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { DialPlanUrls } from '@msg91/urls/whatsapp';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminWhatsappModule {}
@Injectable({
    providedIn: ServicesAdminWhatsappModule,
})
export class WhatsAppService {
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
        @Inject(ProxyBaseUrls.WhatsAppProxy) private whatsAppBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getWhatsAppDashboardDataService(
        param: IWhatsAppDashboardReqModel
    ): Observable<BaseResponse<IWhatsAppDashboardResModel, IWhatsAppDashboardReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, company_id: this.token.companyId ? this.token.companyId : '' };
        return this.http.get(WhatsappUrls.getDashboardData(this.whatsAppBaseUrl), newParam, this.options).pipe(
            map((res) => {
                const data: BaseResponse<IWhatsAppDashboardResModel, IWhatsAppDashboardReqModel> = res;
                data.request = newParam;
                return data;
            })
        );
    }

    public getWhatsAppClientsService(
        param: IWhatsAppClientReqModel | null
    ): Observable<BaseResponse<IWhatsAppClientResModel, IWhatsAppClientReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, company_id: this.token.companyId ? this.token.companyId : '' };
        return this.http.get(WhatsappUrls.getClients(this.whatsAppBaseUrl), newParam, this.options).pipe(
            map((res) => {
                const data: BaseResponse<IWhatsAppClientResModel, IWhatsAppClientReqModel> = res;
                data.request = newParam;
                return data;
            })
        );
    }

    public getWhatsAppLogsService(
        param: IWhatsAppLogReqModel | null
    ): Observable<BaseResponse<IWhatsAppLogResModel, IWhatsAppLogReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, company_id: this.token.companyId ? this.token.companyId : '' };

        return this.http.get(WhatsappUrls.getLogs(this.whatsAppBaseUrl), newParam, this.options).pipe(
            map((res) => {
                const data: BaseResponse<IWhatsAppLogResModel, IWhatsAppLogReqModel | null> = res;
                data.request = newParam;
                return data;
            })
        );
    }

    // need to change when chandan provide apis
    public createWhatsAppClientService(param: any): Observable<BaseResponse<any, any>> {
        // delete this.options.headers['Content-Type'];
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<BaseResponse<any, any>>(
            WhatsappUrls.createWhatsAppClient(this.whatsAppBaseUrl),
            param,
            this.options
        );
    }

    public updateWhatsAppClientService(param: any, id: number): Observable<BaseResponse<any, any>> {
        // delete this.options.headers['Content-Type'];
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.put<BaseResponse<any, any>>(
            WhatsappUrls.updateWhatsAppClient(this.whatsAppBaseUrl).replace(':id', id.toString()),
            param,
            this.options
        );
    }

    public getWhatsAppClientsDropdownService(): Observable<BaseResponse<IWhatsAppClientsDropdownResModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = {};
        return this.http.get<BaseResponse<IWhatsAppClientsDropdownResModel, any>>(
            WhatsappUrls.getClientsDropdown(this.whatsAppBaseUrl),
            newParam,
            this.options
        );
    }

    public getWhatsAppLogsDropdownService(): Observable<BaseResponse<IWhatsAppLogsDropdownResModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<IWhatsAppLogsDropdownResModel, any>>(
            WhatsappUrls.getLogsDropdown(this.whatsAppBaseUrl),
            {},
            this.options
        );
    }

    public adminWhatsAppExportLogs(param: any): Observable<BaseResponse<string, IWhatsAppLogReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, company_id: this.token.companyId ? this.token.companyId : '' };
        return this.http.get(WhatsappUrls.exportLog(this.whatsAppBaseUrl), newParam, this.options).pipe(
            map((res) => {
                const data: BaseResponse<string, IWhatsAppLogReqModel> = res;
                data.request = newParam;
                return data;
            })
        );
    }
    /**
     * Fetches all the dial plans
     *
     * @param {*} requestObj Request object for API
     * @return {Observable<BaseResponse<GetAllDialPlansResponse, any>>} Observable to carry out further operations
     * @memberof WhatsAppService
     */
    public getAllDialPlans(requestObj: any): Observable<BaseResponse<GetAllDialPlansResponse, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(DialPlanUrls.getAllDialPlans(this.whatsAppBaseUrl), { ...requestObj }, this.options);
    }

    /**
     * Fetches the dial plan details
     *
     * @param {number} dialPlanId Dial plan ID for API
     * @return {Observable<BaseResponse<DialPlan, any>>} Observable to carry out further operations
     * @memberof WhatsAppService
     */
    public getDialPlanDetails(dialPlanId: number): Observable<BaseResponse<DialPlan, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(
            `${DialPlanUrls.getDialPlanDetails(this.whatsAppBaseUrl)}${dialPlanId}`,
            null,
            this.options
        );
    }

    /**
     * Updates the dial plan pricing details
     *
     * @param {DialPlanPricing} pricingDetails Pricing details to be updated
     * @return {Observable<BaseResponse<DialPlan, any>>} Observable to carry out further operations
     * @memberof WhatsAppService
     */
    public updateDialPlanPricing(pricingDetails: DialPlanPricing): Observable<BaseResponse<DialPlan, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const dialPlanId = pricingDetails.plan_id;
        delete pricingDetails.plan_id;
        return this.http.put(
            `${DialPlanUrls.updateDialPlanPricing(this.whatsAppBaseUrl)}${dialPlanId}`,
            { ...pricingDetails },
            this.options
        );
    }

    /**
     * Creates new dial plan
     *
     * @param {CreateDialPlanRequest} dialPlan Dial plan details
     * @return {Observable<BaseResponse<DialPlan, any>>} Observable to carry out further operations
     * @memberof WhatsAppService
     */
    public createDialPlan(dialPlan: CreateDialPlanRequest): Observable<BaseResponse<DialPlan, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post(`${DialPlanUrls.createDialPlans(this.whatsAppBaseUrl)}`, { ...dialPlan }, this.options);
    }

    /**
     * Deletes the dial plan with ID
     *
     * @param {number} dialPlanId Dial plan ID to be deleted
     * @return {Observable<BaseResponse<string, any>>} Observable to carry out further operations
     * @memberof WhatsAppService
     */
    public deleteDialPlan(dialPlanId: number): Observable<BaseResponse<string, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.delete(`${DialPlanUrls.deleteDialPlan(this.whatsAppBaseUrl)}${dialPlanId}`, {}, this.options);
    }

    /**
     * Fetches the supported currencies for dial plan
     *
     * @return {Observable<BaseResponse<{currency: Array<string>}, any>>} Observable to carry out further operations
     * @memberof WhatsAppService
     */
    public getCurrencies(): Observable<BaseResponse<{ currency: Array<string> }, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(`${DialPlanUrls.getCurrencies(this.whatsAppBaseUrl)}`, null, this.options);
    }

    public getFailedLogs(params: any): Observable<BaseResponse<IFailedLogResponse, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<IFailedLogResponse, void>>(
            WhatsappUrls.getFailedLogs(this.whatsAppBaseUrl),
            {
                ...params,
                company_id: this.token.companyId ? this.token.companyId : '',
            },
            this.options
        );
    }

    public exportFailedLogs(params: any): Observable<any> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<any, void>>(
            WhatsappUrls.exportFailedLogs(this.whatsAppBaseUrl),
            {
                ...params,
                company_id: this.token.companyId ? this.token.companyId : '',
            },
            this.options
        );
    }

    public getLogDropDownData(params: any): Observable<BaseResponse<IClientLogDropdown, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<IClientLogDropdown, void>>(
            WhatsappUrls.getLogDropDownData(this.whatsAppBaseUrl),
            {
                ...params,
                company_id: this.token.companyId ? this.token.companyId : '',
            },
            this.options
        );
    }
}
