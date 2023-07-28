import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { DashboardUrls } from '@msg91/urls/email/dashboard';
import { Reports } from '@msg91/models/email-models';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailDashboardModule {}

@Injectable({
    providedIn: ServicesMsg91EmailDashboardModule,
})
export class DashboardService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any) {}

    public getUsersDomainsMailStatusService(): Observable<BaseResponse<Reports, null>> {
        return this.http.get<BaseResponse<Reports, null>>(
            DashboardUrls.getUsersDomainsMailStatus(this.emailBaseUrl),
            ''
        );
    }

    // public getGraphData(param: IDashboardReqModel): Observable<BaseResponse<any[], any>> {
    //     return this.http.get(DashboardUrls.getGraphData(this.emailBaseUrl), param).pipe(
    //         map((res) => {
    //             const data: BaseResponse<any[], any> = res;
    //             data['request'] = param;
    //             return data;
    //         })
    //     );
    // }
}
