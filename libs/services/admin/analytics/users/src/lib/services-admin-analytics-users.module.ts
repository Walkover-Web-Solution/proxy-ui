import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AdminAnalyticsUsersUrls } from '@msg91/urls/analytics';
import { AuthService } from '@msg91/services/admin/auth';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { BaseResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import { IAdminAnalyticsUsersModel } from '@msg91/models/analytics-models';
import { EventVM } from '@msg91/models/email-models';

@NgModule({
    imports: [CommonModule],
})
export class ServicesAdminAnalyticsUsersModule {}

@Injectable({
    providedIn: ServicesAdminAnalyticsUsersModule,
})
export class AdminAnalyticsUsersService {
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
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        @Inject(ProxyBaseUrls.EmailServerURL) private emailServerUrl: any
    ) {}

    public getAllAdminAnalyticsUsersDataService(
        request: any,
        apiEndPoint: string
    ): Observable<BaseResponse<IAdminAnalyticsUsersModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request };
        const url = AdminAnalyticsUsersUrls.getUsersData(this.reportsUrl).replace(':serviceType', apiEndPoint);
        return this.http.get(
            url,
            {
                ...newParam,
                companyId: this.token.companyId,
            },
            this.options
        );
    }

    /**
     * Exports analytics logs
     *
     * @param {*} request Request object for the API
     * @param {string} apiEndPoint API endpoint to use
     * @return {Observable<{message:string; status: string}>} Observable to carry out further operations
     * @memberof AdminAnalyticsUsersService
     */
    public exportAdminAnalyticsLogs(
        request: any,
        apiEndPoint: string
    ): Observable<{ message: string; status: string }> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const convertToQueryParam = this.http.objectToParams({
            ...request,
            ...{ companyId: this.token.companyId },
        });
        const url = AdminAnalyticsUsersUrls.exportLogs(this.reportsUrl)
            .replace(':serviceType', apiEndPoint)
            .concat(`?${convertToQueryParam}`);
        return this.http.post(url, { companyId: this.token.companyId }, this.options);
    }

    /**
     * Exports analytic reports
     *
     * @param {*} request Request object for the API
     * @param {string} apiEndPoint API endpoint to use
     * @return {Observable<{message:string; status: string}>} Observable to carry out further operations
     * @memberof AdminAnalyticsUsersService
     */
    public exportAnalyticReport(request: any, apiEndPoint: string): Observable<{ message: string; status: string }> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const convertToQueryParam = this.http.objectToParams({ ...request, ...{ companyId: this.token.companyId } });
        const url = AdminAnalyticsUsersUrls.exportReport(this.reportsUrl)
            .replace(':serviceType', apiEndPoint)
            .concat(`?${convertToQueryParam}`);
        return this.http.post(url, { companyId: this.token.companyId }, this.options);
    }

    /**
     * Fetches the email events for exporting email report
     *
     * @return {Observable<BaseResponse<EventVM[], any>>} Observable to carry out further operations
     * @memberof AdminAnalyticsUsersService
     */
    public adminEmailEvents(): Observable<BaseResponse<EventVM[], any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<EventVM[], any>>(
            AdminAnalyticsUsersUrls.getEmailEvents(this.emailServerUrl + '/api'),
            {},
            this.options
        );
    }
}
