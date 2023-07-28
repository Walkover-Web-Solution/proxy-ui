import {
    GetAllDialPlans,
    GetAllDialPlansResponse,
    GetDialPlanDetails,
    IAvailableLongCode,
    ICreateDialPlanReq,
    IDialPlanDropDown,
    INumberAvailableLongCode,
    INumberIntegrations,
    INumberIntegrationsWithPagination,
    IUpdateDialPlanReq,
    VoiceServer,
} from '@msg91/models/numbers-models';
import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import { IToken, MicroserviceBaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { NumbersUrls } from '@msg91/urls/numbers';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminNumbersModule {}
@Injectable({
    providedIn: ServicesAdminNumbersModule,
})
export class AdminNumbersService {
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
        private authService: AuthService,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        @Inject(ProxyBaseUrls.NumbersProxy) private numberBaseUrl: any,
        @Inject(ProxyBaseUrls.VoiceBaseURL) private voiceBaseUrl: any
    ) {}

    public getNumberIntegrations(
        params: any
    ): Observable<MicroserviceBaseResponse<INumberIntegrationsWithPagination<INumberIntegrations[]>, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParams = { ...params, ...(this.token.companyId && { company_id: this.token.companyId }) };
        return this.http.get<MicroserviceBaseResponse<INumberIntegrationsWithPagination<INumberIntegrations[]>, any>>(
            NumbersUrls.adminIntegration(this.numberBaseUrl),
            newParams,
            this.options
        );
    }

    public getAvailableLongcodeNumbers(
        params: any
    ): Observable<MicroserviceBaseResponse<INumberAvailableLongCode, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<MicroserviceBaseResponse<INumberAvailableLongCode, any>>(
            NumbersUrls.adminAvailableLongcode(this.numberBaseUrl),
            params,
            this.options
        );
    }

    public addLongcodeNumbers(body: IAvailableLongCode): Observable<MicroserviceBaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<MicroserviceBaseResponse<any, any>>(
            NumbersUrls.adminAvailableLongcode(this.numberBaseUrl),
            body,
            this.options
        );
    }

    public getAllDialPlans(request: any): Observable<MicroserviceBaseResponse<GetAllDialPlansResponse, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<MicroserviceBaseResponse<GetAllDialPlansResponse, any>>(
            NumbersUrls.adminDialPlan(this.numberBaseUrl),
            request,
            this.options
        );
    }

    public getDialPlanDetails(id: string): Observable<MicroserviceBaseResponse<GetDialPlanDetails, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<MicroserviceBaseResponse<GetDialPlanDetails, any>>(
            NumbersUrls.adminDialPlan(this.numberBaseUrl) + `${id}/`,
            {},
            this.options
        );
    }

    public createDialPlan(body: ICreateDialPlanReq): Observable<MicroserviceBaseResponse<GetAllDialPlans, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<MicroserviceBaseResponse<GetAllDialPlans, any>>(
            NumbersUrls.adminDialPlan(this.numberBaseUrl),
            body,
            this.options
        );
    }

    public upadateDialPlan(id: string, body: IUpdateDialPlanReq): Observable<MicroserviceBaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.put<MicroserviceBaseResponse<any, any>>(
            NumbersUrls.adminDialPlan(this.numberBaseUrl) + `${id}/`,
            body,
            this.options
        );
    }

    public deleteDialPlan(id: string): Observable<MicroserviceBaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.delete<MicroserviceBaseResponse<any, any>>(
            NumbersUrls.adminDialPlan(this.numberBaseUrl) + `${id}/`,
            {},
            this.options
        );
    }

    public getDropdownData(): Observable<MicroserviceBaseResponse<IDialPlanDropDown, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<MicroserviceBaseResponse<IDialPlanDropDown, any>>(
            NumbersUrls.adminDialPlanDropdown(this.numberBaseUrl),
            {},
            this.options
        );
    }

    public getVoiceServers(
        request: { [key: string]: any } = {}
    ): Observable<MicroserviceBaseResponse<VoiceServer[], any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<MicroserviceBaseResponse<VoiceServer[], any>>(
            NumbersUrls.adminVoiceServers(this.voiceBaseUrl),
            request,
            this.options
        );
    }
}
