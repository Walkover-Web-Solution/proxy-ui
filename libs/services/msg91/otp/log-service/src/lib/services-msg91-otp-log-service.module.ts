import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProxyBaseUrls, BaseResponse } from '@msg91/models/root-models';
import { ISMSFailedLogRequestBody, ISMSFailedLogs, ISMSFailedLogsCount } from '@msg91/models/otp-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { LogsUrls } from '@msg91/urls/otp';
import { Observable } from 'rxjs';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91OtpLogServiceModule {}

@Injectable({
    providedIn: ServicesMsg91OtpLogServiceModule,
})
export class LogsService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private emailBaseUrl: any) {}

    public getDeliveryLogs(params: any, selectActiveMicroService: string): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(
            LogsUrls.getDeliveryLogs(this.emailBaseUrl).replace(':microservice', selectActiveMicroService),
            params
        );
    }

    public deliveryDetails(params: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(LogsUrls.deliveryDetails(this.emailBaseUrl), params);
    }

    public deliveryDetailsCount(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(LogsUrls.deliveryDetailsCount(this.emailBaseUrl), params);
    }

    public resendSmsFromUser(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(LogsUrls.resendSmsFromUser(this.emailBaseUrl), params);
    }

    public playPauseRequest(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(LogsUrls.playPauseRequest(this.emailBaseUrl), params);
    }

    public cancelScheduledSms(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(LogsUrls.cancelScheduledSms(this.emailBaseUrl), params);
    }

    public getAllCampaigns(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(LogsUrls.getAllCampaigns(this.emailBaseUrl));
    }

    public getSmsRoutes(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(LogsUrls.getSmsRoutes(this.emailBaseUrl));
    }

    public getFailedLogsStatus(): Observable<BaseResponse<string[], any>> {
        return this.http.get<BaseResponse<string[], any>>(LogsUrls.getFailedLogsStatus(this.emailBaseUrl));
    }

    public getFailedLogs(
        payload: ISMSFailedLogRequestBody
    ): Observable<BaseResponse<ISMSFailedLogs, ISMSFailedLogRequestBody>> {
        return this.http.post<BaseResponse<ISMSFailedLogs, ISMSFailedLogRequestBody>>(
            LogsUrls.getFailedLogs(this.emailBaseUrl),
            payload
        );
    }

    public exportFailedLogs(payload: { codes: number[] }): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(LogsUrls.exportFailedLogs(this.emailBaseUrl), payload);
    }

    public getAllFailedLogs(): Observable<BaseResponse<ISMSFailedLogsCount[], any>> {
        return this.http.get<BaseResponse<ISMSFailedLogsCount[], any>>(LogsUrls.getFailedApis(this.emailBaseUrl));
    }
}
