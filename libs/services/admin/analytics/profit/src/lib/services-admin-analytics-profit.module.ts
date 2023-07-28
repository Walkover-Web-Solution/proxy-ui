import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@msg91/services/admin/auth';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { AdminAnalyticsProfitUrls } from '@msg91/urls/analytics';
import { BaseResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAdminAnalyticsUserProfitModel,
    IAdminAnalyticsAllUsersProfitModel,
    IAdminAnalyticsVendorsProfitModel,
} from '@msg91/models/analytics-models';

@NgModule({
    imports: [CommonModule],
})
export class ServicesAdminAnalyticsProfitModule {}

@Injectable({
    providedIn: ServicesAdminAnalyticsProfitModule,
})
export class AdminAnalyticsProfitService {
    public options = {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Authorization': '',
        },
        withCredentials: false,
    };
    constructor(
        private http: HttpWrapperService,
        private authService: AuthService,
        @Inject(ProxyBaseUrls.ReportsUrl) private reportsUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken
    ) {}

    public getAdminAnalyticsAllUsersProfitService(
        request: any
    ): Observable<BaseResponse<IAdminAnalyticsAllUsersProfitModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request };
        return this.http.get<BaseResponse<IAdminAnalyticsAllUsersProfitModel, any>>(
            AdminAnalyticsProfitUrls.getAllUsersProfitData(this.reportsUrl),
            newParam,
            this.options
        );
    }

    public getAdminAnalyticsUserProfitService(
        request: any
    ): Observable<BaseResponse<IAdminAnalyticsUserProfitModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request };
        return this.http.get<BaseResponse<IAdminAnalyticsUserProfitModel, any>>(
            AdminAnalyticsProfitUrls.getUserProfitData(this.reportsUrl),
            { ...newParam, companyId: this.token.companyId },
            this.options
        );
    }

    public getAdminAnalyticsVendorsProfitService(
        request: any
    ): Observable<BaseResponse<IAdminAnalyticsVendorsProfitModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request };
        return this.http.get<BaseResponse<IAdminAnalyticsVendorsProfitModel, any>>(
            AdminAnalyticsProfitUrls.getVendorsProfitData(this.reportsUrl),
            newParam,
            this.options
        );
    }
}
