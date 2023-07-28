import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProxyBaseUrls, BaseResponse, IPaginatedResponse } from '@msg91/models/root-models';
import {
    SendDemoOtpReqModel,
    VerifyDemoOtpReqModel,
    IOTPWidget,
    ICreateEditWidgetReq,
    ICreateEditWidgetRes,
    ISendOTPChannels,
} from '@msg91/models/otp-models';
import { IPaginationVoiceResponse } from '@msg91/models/voice-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { DemoUrls } from '@msg91/urls/otp';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91OtpDemoServiceModule {}

@Injectable({
    providedIn: ServicesMsg91OtpDemoServiceModule,
})
export class DemoService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private baseURL: any) {}

    public sendDemoOtp(postData: SendDemoOtpReqModel): Observable<BaseResponse<any, SendDemoOtpReqModel>> {
        return this.http.post<BaseResponse<any, SendDemoOtpReqModel>>(DemoUrls.sendDemoOtp(this.baseURL), postData);
    }

    public verifyDemoOtp(postData: VerifyDemoOtpReqModel): Observable<BaseResponse<any, VerifyDemoOtpReqModel>> {
        return this.http.post<BaseResponse<any, VerifyDemoOtpReqModel>>(DemoUrls.verifyDemoOtp(this.baseURL), postData);
    }

    public resendDemoOtpViaCall(postData: SendDemoOtpReqModel): Observable<BaseResponse<any, SendDemoOtpReqModel>> {
        return this.http.post<BaseResponse<any, SendDemoOtpReqModel>>(
            DemoUrls.resendDemoOtpViaCall(this.baseURL),
            postData
        );
    }

    public getAllWidgetIntegrations(): Observable<BaseResponse<any, IOTPWidget[]>> {
        return this.http.get<BaseResponse<any, IOTPWidget[]>>(DemoUrls.getAllWidgetIntegrations(this.baseURL));
    }

    public addWidgetIntegraion(
        payload: ICreateEditWidgetReq
    ): Observable<BaseResponse<ICreateEditWidgetReq, ICreateEditWidgetRes>> {
        return this.http.post<BaseResponse<ICreateEditWidgetReq, ICreateEditWidgetRes>>(
            DemoUrls.addWidgetIntegraion(this.baseURL),
            payload
        );
    }

    public updateWidgetIntegraion(
        payload: ICreateEditWidgetReq
    ): Observable<BaseResponse<ICreateEditWidgetReq, ICreateEditWidgetRes>> {
        return this.http.post<BaseResponse<ICreateEditWidgetReq, ICreateEditWidgetRes>>(
            DemoUrls.updateWidgetIntegraion(this.baseURL),
            payload
        );
    }

    public getChannels(params: any): Observable<BaseResponse<any, ISendOTPChannels>> {
        return this.http.get<BaseResponse<ICreateEditWidgetReq, ISendOTPChannels>>(
            DemoUrls.getChannels(this.baseURL),
            params
        );
    }

    public getWidgetProcess(id: string): Observable<BaseResponse<string, ICreateEditWidgetRes>> {
        return this.http.get<BaseResponse<string, ICreateEditWidgetRes>>(DemoUrls.getWidgetProcess(this.baseURL) + id);
    }

    public getEmailTemplate(params, keyword?: string): Observable<any> {
        return this.http.get(
            `${this.baseURL}/api/v5/email/templates?status_id=2${keyword ? '&keyword=' + keyword : ''}`,
            params
        );
    }

    public getSMSTemplate(request: any): Observable<any> {
        return this.http.post(`${this.baseURL}${'/api/v5/otp/getAllOtpTemplate'}`, request);
    }

    public getSMSTemplateDetails(id): Observable<any> {
        return this.http.post(`${this.baseURL}${'/api/v5/campaign/getTemplateDetails'}`, { id });
    }

    public getVoiceTemplates(request: any): Observable<BaseResponse<IPaginationVoiceResponse<any[]>, any>> {
        return this.http.get(`${this.baseURL}${'/api/v5/voice/templates/'}`, request).pipe(
            map((res) => {
                const data: BaseResponse<IPaginationVoiceResponse<any[]>, any> = res;
                data.request = request;
                return data;
            })
        );
    }

    public getAllTokensService(params: {
        [key: string]: any;
    }): Observable<BaseResponse<IPaginatedResponse<any[]>, null>> {
        return this.http.get<BaseResponse<any, null>>(`${this.baseURL}/api/v5/otp/getAllTokens`, params);
    }
}
