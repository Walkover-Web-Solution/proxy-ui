import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, IPaginatedEmailResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { FailedLogsUrls } from '@msg91/urls/email/failedLog';
import { IFailedLogsResModel, IStatusCode } from '@msg91/models/email-models';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailFailedLogModule {}

@Injectable({
    providedIn: ServicesMsg91EmailFailedLogModule,
})
export class FailedLogsService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any) {}

    public getFailedLogsService(
        params: any
    ): Observable<BaseResponse<IPaginatedEmailResponse<IFailedLogsResModel[]>, any>> {
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IFailedLogsResModel[]>, any>>(
            FailedLogsUrls.getFailedLogs(this.emailBaseUrl),
            params
        );
    }

    public getFailedLogsDetailsService(id: number): Observable<BaseResponse<IFailedLogsResModel, any>> {
        return this.http.get<BaseResponse<IFailedLogsResModel, any>>(
            FailedLogsUrls.getFailedLogsDetails(this.emailBaseUrl).replace(':logId', id.toString()),
            {}
        );
    }

    public bulkRemove(request: { ids: number[] }): Observable<BaseResponse<any, any>> {
        return this.http.delete<BaseResponse<any, any>>(
            FailedLogsUrls.bulkRemove(this.emailBaseUrl),
            {},
            { body: request }
        );
    }

    public getFailedLogsStatuses(): Observable<BaseResponse<IStatusCode[], any>> {
        return this.http.get<BaseResponse<IStatusCode[], any>>(FailedLogsUrls.getFailedLogsStatuses(this.emailBaseUrl));
    }
}
