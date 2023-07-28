import { Injectable, NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, IPaginatedEmailResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { IAddWebhookRespModel, IWebhookReqModel } from '@msg91/models/email-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { webhookUrls } from '@msg91/urls/email/webhook';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailWebhookModule {}

@Injectable({
    providedIn: ServicesMsg91EmailWebhookModule,
})
export class WebhookService {
    public options = {
        withCredentials: false,
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json',
            Authorization: 'B2yB10BeRTuP0gwkEcChWSEHz7f/OqAXMhZuD9nqYTl27.vQHXOft0UM9Sje1596059130',
        },
    };
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any) {}

    public getAllWebhookService(): Observable<
        BaseResponse<IPaginatedEmailResponse<IAddWebhookRespModel[]>, IWebhookReqModel>
    > {
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IAddWebhookRespModel[]>, null>>(
            webhookUrls.getAllWebhookUrl(this.emailBaseUrl),
            null
        );
    }

    // method="POST"&url="any valid url"&event:"sent_mail_updates || mail_received"
    public addWebhookService(
        request: IWebhookReqModel
    ): Observable<BaseResponse<IAddWebhookRespModel, IWebhookReqModel>> {
        return this.http.post<BaseResponse<IAddWebhookRespModel, IWebhookReqModel>>(
            webhookUrls.addWebhookUrl(this.emailBaseUrl),
            request
        );
    }

    public getWebhookByIdService(request: number): Observable<BaseResponse<IAddWebhookRespModel, number>> {
        return this.http.get<BaseResponse<IAddWebhookRespModel, number>>(
            webhookUrls.getWebhookByIdUrl(this.emailBaseUrl).replace(':webhookId', request.toString())
        );
    }

    public removeWebhookByIdService(request: number): Observable<BaseResponse<any, number>> {
        return this.http
            .delete(webhookUrls.getWebhookByIdUrl(this.emailBaseUrl).replace(':webhookId', request.toString()))
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, number> = res;
                    data.request = request;
                    return data;
                })
            );
    }
}
