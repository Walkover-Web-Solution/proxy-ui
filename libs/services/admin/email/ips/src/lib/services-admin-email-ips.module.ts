import { CommonModule } from '@angular/common';
import { Inject, Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponse, IPaginatedEmailResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import { IDedicatedIp, IEmailUsedIpReqModel, IPaginatedReqModel, IUsedIpsResModel } from '@msg91/models/email-models';
import { AdminEmailIpUrls } from 'libs/service/src/lib/utils/admin/email/ip-urls';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminEmailIpsModule {}
@Injectable({
    providedIn: ServicesAdminEmailIpsModule,
})
export class AdminEmailIpService {
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

    public getAvailableIpsService(
        param: IPaginatedReqModel | null
    ): Observable<BaseResponse<IPaginatedEmailResponse<IDedicatedIp[]>, null>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IDedicatedIp[]>, null>>(
            AdminEmailIpUrls.getAvailableIps(this.emailBaseUrl),
            newParam,
            this.options
        );
    }

    public getUsedIpsService(
        params: IEmailUsedIpReqModel
    ): Observable<BaseResponse<IPaginatedEmailResponse<IUsedIpsResModel[]>, IEmailUsedIpReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...params, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IUsedIpsResModel[]>, IEmailUsedIpReqModel>>(
            AdminEmailIpUrls.getUsedIps(this.emailBaseUrl),
            newParam,
            this.options
        );
    }
}
