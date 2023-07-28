import { CommonModule } from '@angular/common';
import { NgModule, Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IBlockKeywordsResModel,
    ICreateBlockKeywordsReqModel,
    IEmailKeywordModel,
    IEmailKeywordReqPayload,
    IEmailKeywordUpdateReqPayload,
} from '@msg91/models/email-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { ServicesHttpWrapperModule, HttpWrapperService } from '@msg91/services/httpWrapper';
import { AdminEmailBlockKeywordsUrls } from 'libs/service/src/lib/utils/admin/email/block-keywords-urls';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminEmailBlockKeywordsModule {}

@Injectable({
    providedIn: ServicesAdminEmailBlockKeywordsModule,
})
export class AdminEmailBlockKeywordsService {
    public options = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': '',
        },
        withCredentials: false,
    };

    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getAllBlockKeywords(): Observable<BaseResponse<IBlockKeywordsResModel[], null>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        // add below line if they tell call api with selected user.
        // panel_user_id: (this.token.companyId) ? this.token.companyId : '',
        const newParam = { panel_id: 2 };
        return this.http.get<BaseResponse<IBlockKeywordsResModel[], null>>(
            AdminEmailBlockKeywordsUrls.blockKeywords(this.emailBaseUrl),
            newParam,
            this.options
        );
    }

    public createBlockKeywords(
        body: ICreateBlockKeywordsReqModel
    ): Observable<BaseResponse<string[], ICreateBlockKeywordsReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = { ...body, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.post<BaseResponse<string[], ICreateBlockKeywordsReqModel>>(
            AdminEmailBlockKeywordsUrls.blockKeywords(this.emailBaseUrl),
            newBody,
            this.options
        );
    }

    public removeBlockKeywords(blockKeywordId: string): Observable<BaseResponse<IBlockKeywordsResModel, string>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.delete<BaseResponse<IBlockKeywordsResModel, string>>(
            AdminEmailBlockKeywordsUrls.deleteBlockKeyword(this.emailBaseUrl).replace(
                ':blockKeywordId',
                blockKeywordId.toString()
            ),
            {},
            this.options
        );
    }

    public getAllKeywords(params: any): Observable<BaseResponse<IEmailKeywordModel[], any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<IEmailKeywordModel[], string>>(
            AdminEmailBlockKeywordsUrls.getAllKeywords(this.emailBaseUrl),
            params,
            this.options
        );
    }

    public addKeywords(payload: IEmailKeywordReqPayload): Observable<BaseResponse<any, IEmailKeywordReqPayload>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<BaseResponse<any, string>>(
            AdminEmailBlockKeywordsUrls.addKeywords(this.emailBaseUrl),
            payload,
            this.options
        );
    }

    public updateKeyword(req: {
        payload: IEmailKeywordUpdateReqPayload;
        id: string;
    }): Observable<BaseResponse<IBlockKeywordsResModel, { payload: IEmailKeywordUpdateReqPayload; id: string }>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.patch<
            BaseResponse<IBlockKeywordsResModel, { payload: IEmailKeywordUpdateReqPayload; id: string }>
        >(
            AdminEmailBlockKeywordsUrls.updateKeyword(this.emailBaseUrl).replace(':id', req?.id),
            req?.payload,
            this.options
        );
    }

    public deleteKeyword(id: string): Observable<BaseResponse<IBlockKeywordsResModel, string>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.delete<BaseResponse<IBlockKeywordsResModel, string>>(
            AdminEmailBlockKeywordsUrls.deleteKeyword(this.emailBaseUrl).replace(':id', id),
            {},
            this.options
        );
    }
}
