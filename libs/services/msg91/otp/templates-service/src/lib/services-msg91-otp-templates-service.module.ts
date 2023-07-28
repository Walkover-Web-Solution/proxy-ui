import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProxyBaseUrls, BaseResponse } from '@msg91/models/root-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { TemplatesUrls } from '@msg91/urls/otp';
import { WebhookUrls } from '@msg91/urls/otp';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91OtpTemplatesServiceModule {}

@Injectable({
    providedIn: ServicesMsg91OtpTemplatesServiceModule,
})
export class TemplatesService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private emailBaseUrl: any) {}

    public getSenderIds(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(TemplatesUrls.getSenderIds(this.emailBaseUrl));
    }

    public getAllOtpTemplates(requestParam: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(TemplatesUrls.getAllOtpTemplate(this.emailBaseUrl), requestParam);
    }

    public addOtpTemplates(postData: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(TemplatesUrls.addOtpTemplate(this.emailBaseUrl), postData);
    }

    public updateOtpTemplates(postData: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(TemplatesUrls.updateOtpTemplate(this.emailBaseUrl), postData);
    }

    public getWebhookUrl(): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(WebhookUrls.getWebhookUrl(this.emailBaseUrl));
    }

    public deleteWebhookUrl(): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(WebhookUrls.deleteWebhookUrl(this.emailBaseUrl), {});
    }

    public addWebhookUrl(payload: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(WebhookUrls.addWebhookUrl(this.emailBaseUrl), payload);
    }
}
