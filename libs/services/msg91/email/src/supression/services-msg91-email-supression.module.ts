import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, IPaginatedEmailResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAddRecipientReq,
    IRecipentsDeleteReqModel,
    ISupressionReqModel,
    ISupressionRespModel,
    IUnsubscribeDataReqModel,
    IUnsubscribeReqModel,
    IUnsubscribeResModel,
    IUnsubscribesDataReqModel,
} from '@msg91/models/email-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupressionUrls } from '@msg91/urls/email/supression';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailSupressionModule {}

@Injectable({
    providedIn: ServicesMsg91EmailSupressionModule,
})
export class SupressionService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any) {}

    public getEmailByEventTypeService(
        params: ISupressionReqModel
    ): Observable<BaseResponse<IPaginatedEmailResponse<ISupressionRespModel[]>, ISupressionReqModel>> {
        return this.http.get<BaseResponse<IPaginatedEmailResponse<ISupressionRespModel[]>, ISupressionReqModel>>(
            SupressionUrls.getEmailByEventTypeUrl(this.emailBaseUrl),
            params
        );
    }

    public removeBulkUnsubscribe(
        request: IUnsubscribeReqModel
    ): Observable<BaseResponse<IUnsubscribeResModel, IUnsubscribeReqModel>> {
        return this.http.delete<BaseResponse<IUnsubscribeResModel, IUnsubscribeReqModel>>(
            SupressionUrls.getRemoveUnsubscribeUrl(this.emailBaseUrl),
            {},
            { body: request }
        );
    }

    public getUnsubscribeService(
        params: IUnsubscribeDataReqModel
    ): Observable<BaseResponse<IPaginatedEmailResponse<IUnsubscribesDataReqModel[]>, IUnsubscribeDataReqModel>> {
        return this.http.get<
            BaseResponse<IPaginatedEmailResponse<IUnsubscribesDataReqModel[]>, IUnsubscribeDataReqModel>
        >(SupressionUrls.getUnsubscribeUrl(this.emailBaseUrl), params);
    }

    public getRecipientsService(
        params: IUnsubscribeDataReqModel
    ): Observable<BaseResponse<IPaginatedEmailResponse<IUnsubscribesDataReqModel[]>, IUnsubscribeDataReqModel>> {
        let encodedParams = '?';
        for (let key in params) {
            encodedParams += key + '=' + encodeURIComponent(params[key]) + '&';
        }
        return this.http.get<
            BaseResponse<IPaginatedEmailResponse<IUnsubscribesDataReqModel[]>, IUnsubscribeDataReqModel>
        >(SupressionUrls.getRecipientsUrl(this.emailBaseUrl) + encodedParams);
    }

    public removeBulkRecipients(
        request: IRecipentsDeleteReqModel
    ): Observable<BaseResponse<any, IRecipentsDeleteReqModel>> {
        return this.http.delete<BaseResponse<any, IRecipentsDeleteReqModel>>(
            SupressionUrls.deleteRecipients(this.emailBaseUrl),
            {},
            { body: request }
        );
    }

    public exportUnsubscribeService(
        params: IUnsubscribeDataReqModel
    ): Observable<BaseResponse<string, IUnsubscribeDataReqModel>> {
        return this.http.post<BaseResponse<string, IUnsubscribeDataReqModel>>(
            SupressionUrls.exportUnsubscribeUrl(this.emailBaseUrl),
            params
        );
    }

    public exportEmailByEventTypeService(
        params: ISupressionReqModel
    ): Observable<BaseResponse<string, ISupressionReqModel>> {
        return this.http.post<BaseResponse<string, ISupressionReqModel>>(
            SupressionUrls.exportEmailByEventTypeUrl(this.emailBaseUrl),
            params
        );
    }

    public addRecipientService(
        payload: IAddRecipientReq
    ): Observable<BaseResponse<IUnsubscribesDataReqModel, IAddRecipientReq>> {
        return this.http.post<BaseResponse<IUnsubscribesDataReqModel, IAddRecipientReq>>(
            SupressionUrls.addRecipientsUrl(this.emailBaseUrl),
            payload
        );
    }

    public addCSVRecipientService(payload: any): Observable<BaseResponse<IUnsubscribesDataReqModel, any>> {
        return this.http.post<BaseResponse<IUnsubscribesDataReqModel, any>>(
            SupressionUrls.addCSVRecipientsUrl(this.emailBaseUrl),
            payload,
            { headers: { noHeader: true } }
        );
    }
}
