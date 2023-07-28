import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse, IPaginatedEmailResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAddWebhookRespModel,
    IEmailWebhookReqModel,
    IGetAllWebhooksResModel,
    IUpdateWebhookReqModel,
} from '@msg91/models/email-models';
import { AdminEmailWebhookUrls } from 'libs/service/src/lib/utils/admin/email/webhook-urls';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminEmailWebhookModule {}
@Injectable({
    providedIn: ServicesAdminEmailWebhookModule,
})
export class AdminEmailWebhookService {
    public options = {
        withCredentials: false,
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Authorization': '',
        },
    };

    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getAllWebhooks(
        param: IEmailWebhookReqModel | null
    ): Observable<BaseResponse<IPaginatedEmailResponse<IGetAllWebhooksResModel[]>, IEmailWebhookReqModel | null>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<
            BaseResponse<IPaginatedEmailResponse<IGetAllWebhooksResModel[]>, IEmailWebhookReqModel | null>
        >(AdminEmailWebhookUrls.getAllWebhooks(this.emailBaseUrl), newParam, this.options);
    }

    public getWebhookDetail(id: number): Observable<BaseResponse<IAddWebhookRespModel, number>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<BaseResponse<IAddWebhookRespModel, number>>(
            AdminEmailWebhookUrls.webhook(this.emailBaseUrl).replace(':webhook_id', id.toString()),
            newParam,
            this.options
        );
    }

    public updateWebhook(
        body: IUpdateWebhookReqModel,
        id: number
    ): Observable<BaseResponse<any, IUpdateWebhookReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = { ...body, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.put<BaseResponse<any, IUpdateWebhookReqModel>>(
            AdminEmailWebhookUrls.webhook(this.emailBaseUrl).replace(':webhook_id', id.toString()),
            newBody,
            this.options
        );
    }

    public removeAdminWebhookByIdService(request: number): Observable<BaseResponse<any, number>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = { panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http
            .delete(
                AdminEmailWebhookUrls.webhook(this.emailBaseUrl).replace(':webhook_id', request.toString()),
                newBody,
                this.options
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, number> = res;
                    data.request = request;
                    return data;
                })
            );
    }
}
