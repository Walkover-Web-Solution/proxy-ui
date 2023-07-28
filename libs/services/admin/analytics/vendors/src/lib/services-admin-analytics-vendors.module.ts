import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { IAdminAnalyticsVendorsModel } from '@msg91/models/analytics-models';
import { AuthService } from '@msg91/services/admin/auth';
import { AdminAnalyticsVendorsUrls } from '@msg91/urls/analytics';
import { HttpWrapperService } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule],
})
export class ServicesAdminAnalyticsVendorsModule {}

@Injectable({
    providedIn: ServicesAdminAnalyticsVendorsModule,
})
export class AdminAnalyticsVendorsService {
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
        @Inject(ProxyBaseUrls.ReportsUrl) private reportsUrl: any
    ) {}

    public getAllAdminAnalyticsVendorsDataService(
        request: any
    ): Observable<BaseResponse<IAdminAnalyticsVendorsModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request };
        return this.http.get<BaseResponse<IAdminAnalyticsVendorsModel, any>>(
            AdminAnalyticsVendorsUrls.getVendorsData(this.reportsUrl),
            { ...newParam, groupBy: 'vendorId,date' },
            this.options
        );
    }
}
