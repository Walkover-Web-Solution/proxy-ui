import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { IDayWiseData, IExtraParam, Reports } from '@msg91/models/email-models';
import { Observable } from 'rxjs';
import { ReportUrls } from '@msg91/urls/email/report';
import { EmailReportResponse } from '@msg91/models/report-models';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailReportModule {}

@Injectable({
    providedIn: ServicesMsg91EmailReportModule,
})
export class ReportsService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any,
        @Inject(ProxyBaseUrls.ReportsUrl) private reportsUrl: any
    ) {}

    public getDomainMailStatusService(params: IExtraParam): Observable<BaseResponse<Reports, IExtraParam>> {
        return this.http.get<BaseResponse<Reports, IExtraParam>>(
            ReportUrls.getUsersDomainsMailStatus(this.emailBaseUrl),
            params
        );
    }

    public getDomainMailStatusDayWiseService(
        params: IExtraParam
    ): Observable<BaseResponse<IDayWiseData[], IExtraParam>> {
        return this.http.get<BaseResponse<IDayWiseData[], IExtraParam>>(
            ReportUrls.getDomainMailStatusDayWise(this.emailBaseUrl),
            params
        );
    }

    public exportDomainMailStatusDayWiseService(params: IExtraParam): Observable<BaseResponse<string, IExtraParam>> {
        const convertToQueryParam = this.http.objectToParams(params);
        const url = ReportUrls.exportEmailReports(this.reportsUrl) + '?' + convertToQueryParam;
        return this.http.post<BaseResponse<string, IExtraParam>>(url, null);
    }

    public mailReportByReportsMicroService(params: IExtraParam): Observable<EmailReportResponse> {
        return this.http.get<EmailReportResponse>(ReportUrls.fetchEmailReports(this.reportsUrl), params);
    }
}
