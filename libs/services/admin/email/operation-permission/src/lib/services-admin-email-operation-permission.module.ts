import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseResponse, IPaginatedEmailResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { AdminEmailOperationPermissionUrls } from 'libs/service/src/lib/utils/admin/email/operation-permission-urls';
import {
    IOperationPermissionAdminReqModel,
    IOperationPermissionAdminResModel,
    IOperationPermissionListResModel,
    IOperationQueueAdminReqModel,
    IOperationQueueAdminResModel,
    IQuickReportData,
} from '@msg91/models/email-models';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminEmailOperationPermissionModule {}
@Injectable({
    providedIn: ServicesAdminEmailOperationPermissionModule,
})
export class AdminEmailOperationPermissionService {
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
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: string,
        private authService: AuthService
    ) {}

    public getAdminList(
        params: IOperationPermissionAdminReqModel
    ): Observable<
        BaseResponse<IPaginatedEmailResponse<IOperationPermissionAdminResModel[]>, IOperationPermissionAdminReqModel>
    > {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<
            BaseResponse<
                IPaginatedEmailResponse<IOperationPermissionAdminResModel[]>,
                IOperationPermissionAdminReqModel
            >
        >(AdminEmailOperationPermissionUrls.getAdminList(this.emailBaseUrl), params, this.options);
    }

    public getAdminAllPermission(): Observable<BaseResponse<IOperationPermissionListResModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<IOperationPermissionListResModel, any>>(
            AdminEmailOperationPermissionUrls.getAdminAllPermission(this.emailBaseUrl),
            null,
            this.options
        );
    }

    public getLoggedInUser(): Observable<BaseResponse<IOperationPermissionAdminResModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<IOperationPermissionAdminResModel, any>>(
            AdminEmailOperationPermissionUrls.getLoggedInUser(this.emailBaseUrl),
            null,
            this.options
        );
    }

    public updateAdminPermission(
        payload: { permissions: string[] },
        userdId: string
    ): Observable<BaseResponse<string, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.patch<BaseResponse<string, any>>(
            AdminEmailOperationPermissionUrls.updateAdminPermission(this.emailBaseUrl).replace(':userId', userdId),
            payload,
            this.options
        );
    }

    public getQueuedMail(
        params: IOperationQueueAdminReqModel
    ): Observable<BaseResponse<IPaginatedEmailResponse<IOperationQueueAdminResModel[]>, IOperationQueueAdminReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<
            BaseResponse<IPaginatedEmailResponse<IOperationQueueAdminResModel[]>, IOperationQueueAdminReqModel>
        >(AdminEmailOperationPermissionUrls.getQueuedMail(this.emailBaseUrl), params, this.options);
    }

    public moveMails(payload: any): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<BaseResponse<any, any>>(
            AdminEmailOperationPermissionUrls.moveMails(this.emailBaseUrl),
            payload,
            this.options
        );
    }

    public changeQueueStatus(payload: any): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<BaseResponse<any, any>>(
            AdminEmailOperationPermissionUrls.changeQueueStatus(this.emailBaseUrl),
            payload,
            this.options
        );
    }

    public getListQuickReports(): Observable<BaseResponse<IQuickReportData, null>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(
            AdminEmailOperationPermissionUrls.getListQuickReports(this.emailBaseUrl),
            {},
            this.options
        );
    }

    public getQuickReports(): Observable<BaseResponse<any[], null>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get(AdminEmailOperationPermissionUrls.getQuickReports(this.emailBaseUrl), {}, this.options);
    }
}
