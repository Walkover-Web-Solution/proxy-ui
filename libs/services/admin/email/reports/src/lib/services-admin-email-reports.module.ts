/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminReportsUrls } from 'libs/service/src/lib/utils/admin/email/reports-urls';
import { BaseResponse, IPaginatedEmailResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAdminEmailClient,
    IExportReportResModel,
    IGetReportsDashboardReqModel,
    IGetReportsDashboardResModel,
    IGetReportsIpResModel,
    ITemplateResModel,
} from '@msg91/models/email-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminEmailReportsModule {}

@Injectable({
    providedIn: ServicesAdminEmailReportsModule,
})
export class ReportsService {
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

    public getReportsDashboardService(
        param: any
    ): Observable<BaseResponse<IGetReportsDashboardResModel, IGetReportsDashboardReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<BaseResponse<IGetReportsDashboardResModel, IGetReportsDashboardReqModel>>(
            AdminReportsUrls.getReportsDashboard(this.emailBaseUrl),
            newParam,
            this.options
        );
    }

    public getReportsIpsService(
        param: any
    ): Observable<BaseResponse<IPaginatedEmailResponse<IGetReportsIpResModel[]>, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.post<BaseResponse<IPaginatedEmailResponse<IGetReportsIpResModel[]>, any>>(
            AdminReportsUrls.getReportsIp(this.emailBaseUrl),
            newParam,
            this.options
        );
    }

    public getReportsTemplateService(
        param: any
    ): Observable<BaseResponse<IPaginatedEmailResponse<ITemplateResModel[]>, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.post<BaseResponse<IPaginatedEmailResponse<ITemplateResModel[]>, any>>(
            AdminReportsUrls.getReportsTemplate(this.emailBaseUrl),
            newParam,
            this.options
        );
    }

    public exportIpReportService(param: any): Observable<BaseResponse<IExportReportResModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.post<BaseResponse<IExportReportResModel, any>>(
            AdminReportsUrls.exportIpReport(this.emailBaseUrl),
            newParam,
            this.options
        );
    }

    public exportTemplateReportService(param: any): Observable<BaseResponse<string, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.post<BaseResponse<string, any>>(
            AdminReportsUrls.exportTemplateReport(this.emailBaseUrl),
            newParam,
            this.options
        );
    }

    public getEmailClientList(param: any): Observable<BaseResponse<IPaginatedEmailResponse<IAdminEmailClient[]>, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '' };
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IAdminEmailClient[]>, any>>(
            AdminReportsUrls.getEmailClientList(this.emailBaseUrl),
            newParam,
            this.options
        );
    }
}
