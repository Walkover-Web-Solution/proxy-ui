import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAddUnsubscribeReqModel,
    IAddUnsubscribeResModel,
    IGetUnsubscribeReqModel,
    IGetUnsubscribeResModel,
} from '@msg91/models/setting-models';
import { Observable } from 'rxjs';
import { UnsubscribeUrls } from '@msg91/urls/email/unsubscribe';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailUnsubscribeModule {}

@Injectable({ providedIn: ServicesMsg91EmailUnsubscribeModule })
export class UnsubscribeService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any) {}

    public getUnsubscribeData(
        request: IGetUnsubscribeReqModel,
        callV2Api: boolean = false
    ): Observable<BaseResponse<IGetUnsubscribeResModel, IGetUnsubscribeReqModel>> {
        return this.http.get<BaseResponse<IGetUnsubscribeResModel, IGetUnsubscribeReqModel>>(
            (callV2Api
                ? UnsubscribeUrls.getUnsubscribeV2DataUrl(this.baseUrl)
                : UnsubscribeUrls.getUnsubscribeDataUrl(this.baseUrl)
            )
                .replace(':id', request.id)
                .replace(':email', request.email)
        );
    }

    public addUnsubscribe(
        request: IAddUnsubscribeReqModel,
        callV2Api: boolean = false
    ): Observable<BaseResponse<IAddUnsubscribeResModel, IAddUnsubscribeReqModel>> {
        return this.http.post<BaseResponse<IAddUnsubscribeResModel, IAddUnsubscribeReqModel>>(
            callV2Api
                ? UnsubscribeUrls.addUnsubscribeV2Url(this.baseUrl)
                : UnsubscribeUrls.addUnsubscribeUrl(this.baseUrl),
            request
        );
    }
}
