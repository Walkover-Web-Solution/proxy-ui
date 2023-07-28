import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProxyBaseUrls, BaseResponse } from '@msg91/models/root-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { ReportSummaryUrls } from '@msg91/urls/otp';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91OtpReportSummaryServiceModule {}

@Injectable({
    providedIn: ServicesMsg91OtpReportSummaryServiceModule,
})
export class ReportSummaryService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private emailBaseUrl: any) {}

    public getAllCampaigns(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(ReportSummaryUrls.getAllCampaigns(this.emailBaseUrl));
    }

    public getSummaryReport(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(ReportSummaryUrls.getSummaryReport(this.emailBaseUrl), params);
    }

    public exportSummaryReport(postData: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(
            ReportSummaryUrls.exportSummaryReport(this.emailBaseUrl),
            postData
        );
    }

    public getWeeklyUserReports(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(ReportSummaryUrls.getWeeklyUserReports(this.emailBaseUrl));
    }
}
