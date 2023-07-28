import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminEmailDashboardUrls } from 'libs/service/src/lib/utils/admin/email/dashboard-urls';
import { BaseResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IEmailGetReportEventWiseResModel,
    IEmailGraphDataResModel,
    IEmailGraphReqModel,
} from '@msg91/models/email-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { ServicesHttpWrapperModule, HttpWrapperService } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule, ServicesAdminAuthModule],
})
export class ServicesAdminEmailDashboardModule {}

@Injectable({
    providedIn: ServicesAdminEmailDashboardModule,
})
export class AdminEmailDashboardService {
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
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getEmailReportEventWiseService(): Observable<BaseResponse<IEmailGetReportEventWiseResModel[], null>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<BaseResponse<IEmailGetReportEventWiseResModel[], null>>(
            AdminEmailDashboardUrls.getReportEventWise(this.emailBaseUrl),
            newParam,
            this.options
        );
    }

    public getEmailGraphData(
        param: IEmailGraphReqModel
    ): Observable<BaseResponse<IEmailGraphDataResModel, IEmailGraphReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get(AdminEmailDashboardUrls.getNewGraphData(this.emailBaseUrl), newParam, this.options).pipe(
            map((res) => {
                const data: BaseResponse<IEmailGraphDataResModel, IEmailGraphReqModel> = res;
                data['request'] = param;
                return data;
            })
        );
    }
}
