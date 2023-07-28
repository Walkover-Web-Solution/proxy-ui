import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseResponse, IPaginatedEmailResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    ISubscriptionOperationPermissionAdminReqModel,
    ISubscriptionOperationPermissionAdminResModel,
} from '@msg91/models/subscription-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { AdminSubscriptionOperationPermissionUrls } from '@msg91/urls/subscription';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminBillingOperationModule {}
@Injectable({
    providedIn: ServicesAdminBillingOperationModule,
})
export class AdminBillingOperationService {
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
        @Inject(ProxyBaseUrls.SubscriptionProxy) private subscriptionBaseUrl: string,
        private authService: AuthService
    ) {}

    public getAdminList(
        params: ISubscriptionOperationPermissionAdminReqModel
    ): Observable<
        BaseResponse<
            IPaginatedEmailResponse<ISubscriptionOperationPermissionAdminResModel[]>,
            ISubscriptionOperationPermissionAdminReqModel
        >
    > {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<
            BaseResponse<
                IPaginatedEmailResponse<ISubscriptionOperationPermissionAdminResModel[]>,
                ISubscriptionOperationPermissionAdminReqModel
            >
        >(AdminSubscriptionOperationPermissionUrls.getAdminList(this.subscriptionBaseUrl), params, this.options);
    }

    public getAdminAllPermission(): Observable<BaseResponse<string[], any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<string[], any>>(
            AdminSubscriptionOperationPermissionUrls.getAdminAllPermission(this.subscriptionBaseUrl),
            null,
            this.options
        );
    }

    public getLoggedInUser(): Observable<BaseResponse<ISubscriptionOperationPermissionAdminResModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<ISubscriptionOperationPermissionAdminResModel, any>>(
            AdminSubscriptionOperationPermissionUrls.getLoggedInUser(this.subscriptionBaseUrl),
            null,
            this.options
        );
    }

    public updateAdminPermission(
        payload: { permissions: string[] },
        userId: string
    ): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.patch<BaseResponse<any, any>>(
            AdminSubscriptionOperationPermissionUrls.updateAdminPermission(this.subscriptionBaseUrl),
            { ...payload, id: userId },
            this.options
        );
    }
}
