import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { ShortUrlsList } from '@msg91/urls/shortUrl';
import {
    IItemClick,
    ILinkItem,
    ILinkLog,
    IShortURLPaginatedResponse,
    IURLLogRequest,
    IURLRequest,
} from '@msg91/models/short-url-models';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91ShortUrlModule {}

@Injectable({
    providedIn: ServicesMsg91ShortUrlModule,
})
export class ShortURLServices {
    constructor(
        private _http: HttpWrapperService,
        @Inject(ProxyBaseUrls.ShortURLProxy) private shortUrlsAPIURl: string
    ) {}

    generateURL(params: any): Observable<BaseResponse<string, any>> {
        return this._http.post(ShortUrlsList.generateURL(this.shortUrlsAPIURl), params);
    }

    noOfLinkGenerated(params: string): Observable<BaseResponse<number, string>> {
        return this._http.get<BaseResponse<number, string>>(
            ShortUrlsList.noOfLinkGenerated(this.shortUrlsAPIURl) + params,
            {}
        );
    }

    getLinkGeneratedByUser(
        params: IURLRequest
    ): Observable<BaseResponse<IShortURLPaginatedResponse<ILinkItem[]>, IURLRequest>> {
        return this._http.get<BaseResponse<IShortURLPaginatedResponse<ILinkItem[]>, IURLRequest>>(
            ShortUrlsList.getLinkGeneratedByUser(this.shortUrlsAPIURl),
            params
        );
    }

    updateLinkExpiry(params: any): Observable<BaseResponse<{ msg: string }, any>> {
        return this._http.post(ShortUrlsList.updateLinkExpiry(this.shortUrlsAPIURl), params);
    }

    getURLLogs(
        params: IURLLogRequest
    ): Observable<BaseResponse<IShortURLPaginatedResponse<ILinkLog[]>, IURLLogRequest>> {
        return this._http.get<BaseResponse<IShortURLPaginatedResponse<ILinkLog[]>, IURLLogRequest>>(
            ShortUrlsList.getURLLogs(this.shortUrlsAPIURl),
            params
        );
    }

    getTotalClicksCount(params: IURLLogRequest): Observable<{ totalClicks: number }> {
        return this._http.get<{ totalClicks: number }>(ShortUrlsList.getTotalClicksCount(this.shortUrlsAPIURl), params);
    }

    getClickDetails(params: string): Observable<BaseResponse<IShortURLPaginatedResponse<IItemClick[]>, string>> {
        return this._http.get<BaseResponse<IShortURLPaginatedResponse<IItemClick[]>, string>>(
            ShortUrlsList.getClickDetails(this.shortUrlsAPIURl) + params,
            {}
        );
    }

    public getShortUrlSettingService(request: { userId: string }): Observable<BaseResponse<any, { userId: string }>> {
        return this._http.get<BaseResponse<any, any>>(ShortUrlsList.getShortUrlSetting(this.shortUrlsAPIURl), request);
    }

    public updateShortUrlSettingService(request: {
        userId: string;
        status: '0' | '1';
    }): Observable<BaseResponse<any, { userId: string; status: '0' | '1' }>> {
        return this._http.post<BaseResponse<any, any>>(
            ShortUrlsList.updateShortUrlSetting(this.shortUrlsAPIURl),
            request
        );
    }

    exportLogs(params: any): Observable<any> {
        // return this._http.get<BaseResponse<any, any>>(ShortUrlsList.exportReport(this.shortUrlsAPIURl), params, {
        //     responseType: 'text',
        // });
        return this._http.get<BaseResponse<any, any>>(ShortUrlsList.exportReport(this.shortUrlsAPIURl), params);
    }
}
