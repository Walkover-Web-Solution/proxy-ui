import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseResponse, IPaginatedEmailResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import { IFailedLogsResModel, IStatusCode } from '@msg91/models/email-models';
import { AdminEmailIpUrls } from 'libs/service/src/lib/utils/admin/email/ip-urls';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminEmailFailedLogsModule {}

@Injectable({
    providedIn: ServicesAdminEmailFailedLogsModule,
})
export class AdminEmailFailedLogsService {
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
        @Inject(ProxyBaseUrls.EmailServerURL) private emailServerBaseURL: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getFailedLogsService(
        params: any
    ): Observable<BaseResponse<IPaginatedEmailResponse<IFailedLogsResModel[]>, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...params, panel_user_id: this.token.companyId ? this.token.companyId : '' };
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IFailedLogsResModel[]>, any>>(
            AdminEmailIpUrls.getFailedLogs(this.emailBaseUrl),
            newParam,
            this.options
        );
    }

    public getFailedLogsDetailsService(id: number): Observable<BaseResponse<IFailedLogsResModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<IFailedLogsResModel, any>>(
            AdminEmailIpUrls.getFailedLogDetails(this.emailBaseUrl).replace(':logId', id.toString()),
            {},
            this.options
        );
    }

    public getFailedLogsStatuses(): Observable<BaseResponse<IStatusCode[], any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<IStatusCode[], any>>(
            AdminEmailIpUrls.getFailedLogsStatuses(this.emailServerBaseURL),
            {},
            this.options
        );
    }
}
