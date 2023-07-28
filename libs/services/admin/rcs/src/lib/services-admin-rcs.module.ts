import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cloneDeep } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    IRcsAdminClientResModel,
    IRcsAdminLogData,
    IRcsClientRequest,
    IRCSDashboardData,
    IRCSDashboardRequest,
    IRcsLogRequest,
    IRCSAdminLogDropdown,
} from '@msg91/models/rcs-models';
import { IToken, ProxyBaseUrls, BaseResponse } from '@msg91/models/root-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { AdminRCSUrls } from 'libs/service/src/lib/utils/admin/rcs/rcs-urls';
import { RemoveEmptyParam } from '@msg91/utils';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminRcsModule {}
@Injectable({
    providedIn: ServicesAdminRcsModule,
})
export class AdminRCSService {
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
        @Inject(ProxyBaseUrls.RcsProxy) private rcsBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getClientsService(
        param: IRcsClientRequest
    ): Observable<BaseResponse<IRcsAdminClientResModel, IRcsClientRequest>> {
        param = cloneDeep(param);
        this.options.headers.Authorization = this.authService.getTokenSync();
        param.company_id = this.token.companyId ? this.token.companyId : '';
        return this.http.get(AdminRCSUrls.getClients(this.rcsBaseUrl), RemoveEmptyParam(param), this.options).pipe(
            map((res) => {
                const data: BaseResponse<IRcsAdminClientResModel, IRcsClientRequest> = res;
                data['request'] = param;
                return data;
            })
        );
    }

    public getLogsService(param: IRcsLogRequest): Observable<BaseResponse<IRcsAdminLogData, IRcsLogRequest>> {
        param = cloneDeep(param);
        this.options.headers.Authorization = this.authService.getTokenSync();
        param.company_id = this.token.companyId ? this.token.companyId : '';
        return this.http.get(AdminRCSUrls.getLogs(this.rcsBaseUrl), RemoveEmptyParam(param), this.options).pipe(
            map((res) => {
                const data: BaseResponse<IRcsAdminLogData, IRcsLogRequest> = res;
                data['request'] = param;
                return data;
            })
        );
    }

    public getDashboardDataService(
        param: IRCSDashboardRequest
    ): Observable<BaseResponse<IRCSDashboardData, IRCSDashboardRequest>> {
        param = cloneDeep(param);
        this.options.headers.Authorization = this.authService.getTokenSync();
        param.company_id = this.token.companyId ? this.token.companyId : '';
        return this.http
            .get(AdminRCSUrls.getDashboardData(this.rcsBaseUrl), RemoveEmptyParam(param), this.options)
            .pipe(
                map((res) => {
                    const data: BaseResponse<IRCSDashboardData, IRCSDashboardRequest> = res;
                    data['request'] = param;
                    return data;
                })
            );
    }

    public getLogDropDownData(): Observable<BaseResponse<IRCSAdminLogDropdown, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<IRCSAdminLogDropdown, any>>(
            AdminRCSUrls.getLogDropDownData(this.rcsBaseUrl),
            {},
            this.options
        );
    }
}
