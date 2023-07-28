import { CommonModule } from '@angular/common';
import { Inject, Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse, ProxyBaseUrls, IPaginatedResponse } from '@msg91/models/root-models';
import {
    ISmsTemplateVersionReqModel,
    ISmsTemplateReqModel,
    ISmsTemplateVersionDetailsReqModel,
    ISmsTemplateVersionDetailsRes,
    IAddTemplateReq,
    IAddTemplateVersionReq,
    IUpdateTemplateVersion,
    IDeleteTemplateVersion,
    ITemplateResponse,
    IAddVersionRes,
    IUpdateVersionResModel,
    IDeleteVersionResModel,
    ITestDltReq,
} from '@msg91/models/sms-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { SmsTemplateUrls } from '@msg91/urls/sms';
import { ISenderId } from '@msg91/models/setting-models';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91SmsTemplateServiceModule {}

@Injectable({
    providedIn: ServicesMsg91SmsTemplateServiceModule,
})
export class SmsTemplatesService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private emailBaseUrl: any) {}

    // All Sms Template Service
    public getAllTemplateService(
        requestData: ISmsTemplateReqModel
    ): Observable<BaseResponse<IPaginatedResponse<ITemplateResponse[]>, ISmsTemplateReqModel>> {
        return this.http.post<BaseResponse<IPaginatedResponse<ITemplateResponse[]>, ISmsTemplateReqModel>>(
            SmsTemplateUrls.getAllSmsTemplateUrl(this.emailBaseUrl),
            requestData
        );
    }

    public getTemplateVersions(
        request: ISmsTemplateVersionReqModel
    ): Observable<BaseResponse<ISmsTemplateVersionDetailsRes[], any>> {
        return this.http.get<BaseResponse<ISmsTemplateVersionDetailsRes[], any>>(
            SmsTemplateUrls.getTemplateVersions(this.emailBaseUrl),
            request
        );
    }

    public getTemplateVersionDetails(
        request: ISmsTemplateVersionDetailsReqModel
    ): Observable<BaseResponse<ISmsTemplateVersionDetailsRes, ISmsTemplateVersionDetailsReqModel>> {
        return this.http.get<BaseResponse<ISmsTemplateVersionDetailsRes, ISmsTemplateVersionDetailsReqModel>>(
            SmsTemplateUrls.getTemplateVersionDetails(this.emailBaseUrl),
            request
        );
    }

    public addTemplate(postData: IAddTemplateReq): Observable<BaseResponse<string[], IAddTemplateReq>> {
        return this.http.post<BaseResponse<{ msg: string; flowId: string }, IAddTemplateReq>>(
            SmsTemplateUrls.addTemplate(this.emailBaseUrl),
            postData
        );
    }

    public addTemplateVersion(
        postData: IAddTemplateVersionReq
    ): Observable<BaseResponse<IAddVersionRes, IAddTemplateVersionReq>> {
        return this.http.post<BaseResponse<IAddVersionRes, IAddTemplateVersionReq>>(
            SmsTemplateUrls.addTemplateVersion(this.emailBaseUrl),
            postData
        );
    }

    public updateTemplateVersion(
        postData: IUpdateTemplateVersion
    ): Observable<BaseResponse<IUpdateVersionResModel[], IUpdateTemplateVersion>> {
        return this.http.post<BaseResponse<IUpdateVersionResModel[], IUpdateTemplateVersion>>(
            SmsTemplateUrls.updateTemplateVersion(this.emailBaseUrl),
            postData
        );
    }

    public markVersionActive(postData: { id: number; template_id: string }): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(SmsTemplateUrls.markVersionActive(this.emailBaseUrl), postData);
    }

    public testDLT(postData: ITestDltReq): Observable<BaseResponse<string, any>> {
        return this.http.post<BaseResponse<any, any>>(SmsTemplateUrls.testDLT(this.emailBaseUrl), postData);
    }

    public deleteTemplateVersion(
        postData: IDeleteTemplateVersion
    ): Observable<BaseResponse<IDeleteVersionResModel[], IDeleteTemplateVersion>> {
        return this.http.post<BaseResponse<IDeleteVersionResModel[], IDeleteTemplateVersion>>(
            SmsTemplateUrls.deleteTemplateVersion(this.emailBaseUrl),
            postData
        );
    }

    public getSenderIds(): Observable<BaseResponse<ISenderId[], null>> {
        return this.http.get<BaseResponse<ISenderId[], null>>(SmsTemplateUrls.getSenderIds(this.emailBaseUrl));
    }
}
