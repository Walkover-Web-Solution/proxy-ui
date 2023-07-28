import { CommonModule } from '@angular/common';
import { Inject, Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import {
    BaseResponse,
    IPaginatedEmailResponse,
    IToken,
    MicroserviceBaseResponse,
    ProxyBaseUrls,
} from '@msg91/models/root-models';
import {
    IAdminGetAllLogsResModel,
    IEmailGetAllLogsReqModel,
    IEmailOutboundResModel,
    PreviewDataReq,
} from '@msg91/models/email-models';
import { AdminEmailLogUrls } from 'libs/service/src/lib/utils/admin/email/log-urls';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule, ServicesAdminAuthModule],
})
export class ServicesAdminEmailLogModule {}
@Injectable({
    providedIn: ServicesAdminEmailLogModule,
})
export class AdminEmailLogService {
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
        @Inject(ProxyBaseUrls.ReportsUrl) private reportsBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService,
        @Inject(ProxyBaseUrls.EmailServerURL) private emailServerUrl: any
    ) {}

    public getAllLogs(
        params: IEmailGetAllLogsReqModel
    ): Observable<BaseResponse<IPaginatedEmailResponse<IAdminGetAllLogsResModel[]>, IEmailGetAllLogsReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...params };
        return this.http.get<
            BaseResponse<IPaginatedEmailResponse<IAdminGetAllLogsResModel[]>, IEmailGetAllLogsReqModel>
        >(AdminEmailLogUrls.getAllLogs(this.reportsBaseUrl), newParam, this.options);
    }

    public exportLogsService(params: any): Observable<MicroserviceBaseResponse<string, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const convertToQueryParam = this.http.objectToParams(params);
        const url = AdminEmailLogUrls.exportLogs(this.reportsBaseUrl) + '?' + convertToQueryParam;
        const newParam = { ...params, panel_user_id: this.token.companyId ? this.token.companyId : '' };
        return this.http.post<MicroserviceBaseResponse<string, any>>(url, newParam, this.options);
    }

    // public getOutboundDetailService(outboundId: any): Observable<BaseResponse<any, any>> {
    //     this.options.headers.Authorization = this.authService.getTokenSync();
    //     const newParam = { panel_user_id: this.token.companyId ? this.token.companyId : '', with: 'templateVersion' };
    //     return this.http.get<BaseResponse<any, any>>(
    //         AdminEmailLogUrls.getOutboundDetailsAction(this.emailBaseUrl).replace(':outboundId', outboundId.toString()),
    //         newParam,
    //         this.options
    //     );
    // }

    public getEmailEvents(): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<any, any>>(
            AdminEmailLogUrls.getEvents(this.emailServerUrl + '/api'),
            {},
            this.options
        );
    }

    public getInboundLogs(params: any): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParams = { ...params };
        return this.http.get<BaseResponse<any, any>>(
            AdminEmailLogUrls.getInboundLogs(this.emailBaseUrl),
            newParams,
            this.options
        );
    }

    public getInboundLogsDetails(id: any): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<any, any>>(
            AdminEmailLogUrls.getInboundLogsDetails(this.emailBaseUrl).replace(':id', id.toString()),
            {},
            this.options
        );
    }

    public getPreviewDataService(body: PreviewDataReq): Observable<BaseResponse<IEmailOutboundResModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<BaseResponse<IEmailOutboundResModel, any>>(
            AdminEmailLogUrls.getPreviewData(this.emailBaseUrl),
            body,
            this.options
        );
    }
}
