import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseResponse, IPaginatedEmailResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IEmailAssignIpsReqModel,
    IEmailGetAllDomainsReqModel,
    IEmailGetAllDomainsResModel,
    IEmailIpDetailsResModel,
    IEmailToggleDomainReqModel,
    IEmailUnAssignIpReqModel,
    IGetIpsReqModel,
    IGetIpsResModel,
    IUpdatePerHourEmailReqModel,
} from '@msg91/models/email-models';
import { map } from 'rxjs/operators';
import { AdminEmailDomainUrls } from 'libs/service/src/lib/utils/admin/email/domain-urls';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { ServicesHttpWrapperModule, HttpWrapperService } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminEmailDomainModule {}

@Injectable({
    providedIn: ServicesAdminEmailDomainModule,
})
export class AdminEmailDomainService {
    public options = {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Authorization': '',
        },
        withCredentials: false,
    };

    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getAllDomainsService(
        params: IEmailGetAllDomainsReqModel
    ): Observable<BaseResponse<IPaginatedEmailResponse<IEmailGetAllDomainsResModel[]>, IEmailGetAllDomainsReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...params, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<
            BaseResponse<IPaginatedEmailResponse<IEmailGetAllDomainsResModel[]>, IEmailGetAllDomainsReqModel>
        >(AdminEmailDomainUrls.getAllDomains(this.emailBaseUrl), newParam, this.options);
    }

    public assignIpsToDomainService(
        body: IEmailAssignIpsReqModel
    ): Observable<BaseResponse<string, IEmailAssignIpsReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = { ...body, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.post<BaseResponse<string, IEmailAssignIpsReqModel>>(
            AdminEmailDomainUrls.assignIpsToDomain(this.emailBaseUrl),
            newBody,
            this.options
        );
    }

    public toggleDomainService(
        body: IEmailToggleDomainReqModel
    ): Observable<BaseResponse<string, IEmailToggleDomainReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = { ...body, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.post<BaseResponse<string, IEmailToggleDomainReqModel>>(
            AdminEmailDomainUrls.toggleDomain(this.emailBaseUrl),
            newBody,
            this.options
        );
    }

    public verifyDomainService(body: any): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = { ...body, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.post<BaseResponse<any, any>>(
            AdminEmailDomainUrls.verfiyDomain(this.emailBaseUrl),
            newBody,
            this.options
        );
    }

    public activateSmtopService(request: {
        is_enabled_by_admin: number;
        smtpId: number;
    }): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.patch<BaseResponse<any, any>>(
            AdminEmailDomainUrls.smtpActivate(this.emailBaseUrl) + `/${request.smtpId}`,
            { admin_enabled: request?.is_enabled_by_admin },
            this.options
        );
    }

    public getIpDetailsService(): Observable<BaseResponse<IEmailIpDetailsResModel, null>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<BaseResponse<IEmailIpDetailsResModel, null>>(
            AdminEmailDomainUrls.getIpDetailsDomain(this.emailBaseUrl),
            newParam,
            this.options
        );
    }

    public getIpsService(
        param: IGetIpsReqModel
    ): Observable<BaseResponse<IPaginatedEmailResponse<IGetIpsResModel[]>, IGetIpsReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IGetIpsResModel[]>, IGetIpsReqModel>>(
            AdminEmailDomainUrls.getIpsDomain(this.emailBaseUrl),
            newParam,
            this.options
        );
    }

    public unAssignIpsFromDomainService(
        body: IEmailUnAssignIpReqModel
    ): Observable<BaseResponse<string, IEmailUnAssignIpReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = { ...body, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.post<BaseResponse<string, IEmailUnAssignIpReqModel>>(
            AdminEmailDomainUrls.unAssignIpsFromDomain(this.emailBaseUrl),
            newBody,
            this.options
        );
    }

    public updatePerHourEmailLimitService(
        body: IUpdatePerHourEmailReqModel
    ): Observable<BaseResponse<string, IUpdatePerHourEmailReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = { ...body, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http
            .post(AdminEmailDomainUrls.updatePerHourEmailLimit(this.emailBaseUrl), newBody, this.options)
            .pipe(
                map((res) => {
                    const data: BaseResponse<string, IUpdatePerHourEmailReqModel> = res;
                    data.request = body;
                    return data;
                })
            );
    }

    public updatePermissionDomainService(body: any): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = { ...body, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http
            .post(AdminEmailDomainUrls.updatePermissionDomain(this.emailBaseUrl), newBody, this.options)
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, any> = res;
                    data.request = body;
                    return data;
                })
            );
    }

    public updateAdminPermissionAndFailedRate(payload: any): Observable<BaseResponse<string, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<BaseResponse<string, any>>(
            AdminEmailDomainUrls.updateAdminPermissionAndFailedRate(this.emailBaseUrl),
            payload,
            this.options
        );
    }
}
