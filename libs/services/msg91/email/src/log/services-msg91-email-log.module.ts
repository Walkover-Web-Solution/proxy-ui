import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import {
    BaseResponse,
    IPaginatedEmailResponse,
    MicroserviceBaseResponse,
    ProxyBaseUrls,
} from '@msg91/models/root-models';
import {
    EmailStatus,
    IEmailLogRespModel,
    IEmailOutboundResModel,
    IParamDeliveryStatusLogReqModel,
    IParamLogReqModel,
    PreviewDataReq,
} from '@msg91/models/email-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { LogUrls } from '@msg91/urls/email/log';
import { CustomEncoder } from '@msg91/service';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailLogModule {}

@Injectable({
    providedIn: ServicesMsg91EmailLogModule,
})
export class LogService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any,
        @Inject(ProxyBaseUrls.ReportsUrl) private reportsUrl: any
    ) {}

    public getDomainWiseEmailLogService(
        params: IParamLogReqModel
    ): Observable<BaseResponse<IPaginatedEmailResponse<IEmailLogRespModel[]>, IParamLogReqModel>> {
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IEmailLogRespModel[]>, IParamLogReqModel>>(
            LogUrls.getDomainWiseEmailLogUrl(this.emailBaseUrl),
            params
        );
    }

    public getDeliveryStatusService(
        params
    ): Observable<BaseResponse<IPaginatedEmailResponse<EmailStatus[]>, IParamDeliveryStatusLogReqModel>> {
        const newParams = new HttpParams({
            fromObject: Object.assign({}, params),
            encoder: new CustomEncoder(),
        });
        return this.http.get(LogUrls.getDeliveryStatusSMTPLogUrl(this.emailBaseUrl), newParams).pipe(
            map((res) => {
                const data: BaseResponse<IPaginatedEmailResponse<EmailStatus[]>, IParamDeliveryStatusLogReqModel> = res;
                data['request'] = params;
                return data;
            })
        );
    }

    public getEmailLogs(params): Observable<any> {
        return this.http.get(LogUrls.getEmailLog(this.reportsUrl), params);
    }

    public getMailLogByPageNumberService(
        params: IParamLogReqModel
    ): Observable<BaseResponse<IPaginatedEmailResponse<IEmailLogRespModel[]>, IParamLogReqModel>> {
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IEmailLogRespModel[]>, IParamLogReqModel>>(
            LogUrls.getDomainWiseEmailLogUrl(this.emailBaseUrl),
            params
        );
    }

    public getEmailEventsService(): Observable<BaseResponse<any[], null>> {
        return this.http.get<BaseResponse<any[], null>>(LogUrls.getEvents(this.emailBaseUrl), {});
    }

    public exportLogService(params: any): Observable<MicroserviceBaseResponse<any, any>> {
        const convertToQueryParam = this.http.objectToParams(params);
        const url = LogUrls.getDeliveryStatusLogUrl(this.reportsUrl) + '?' + convertToQueryParam;
        return this.http.post<BaseResponse<any, IParamDeliveryStatusLogReqModel>>(url, params);
    }

    // public getOutboundDetailService(outboundId: any): Observable<BaseResponse<IEmailOutboundResModel, any>> {
    //     return this.http.get<BaseResponse<IEmailOutboundResModel, any>>(
    //         LogUrls.getOutboundDetailsAction(this.emailBaseUrl).replace(':outboundId', outboundId.toString()),
    //         { with: 'templateVersion' }
    //     );
    // }

    public getPreviewDataService(body: PreviewDataReq): Observable<BaseResponse<IEmailOutboundResModel, any>> {
        return this.http.post<BaseResponse<IEmailOutboundResModel, any>>(
            LogUrls.getPreviewData(this.emailBaseUrl),
            body
        );
    }
}
