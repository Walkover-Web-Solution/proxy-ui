import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { SuperAdminUrls } from '@msg91/urls/super-admin';
import { BaseResponse, IPaginatedResponse, IToken, ProxyBaseUrls, keyValuePair } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import {
    IAddUser,
    IUsersModel,
    ILogsFilterRequest,
    ILogsResponse,
    IMicroserviceModel,
    IGetPermission,
    IPermission,
    IAddPermissionRequest,
} from '@msg91/models/super-admin-models';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminSuperAdminModule {}

@Injectable({
    providedIn: ServicesAdminSuperAdminModule,
})
export class AdminSuperAdminService {
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
        private authService: AuthService,
        @Inject(ProxyBaseUrls.AdminProxy) private adminProxy: string,
        @Inject(ProxyBaseUrls.IToken) private token: IToken
    ) {}

    /** User Services */
    public getMicroservices(): Observable<BaseResponse<Array<IMicroserviceModel>, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const url = SuperAdminUrls.getMicroservices(this.adminProxy);
        return this.http.get<BaseResponse<Array<IMicroserviceModel>, void>>(url, {}, this.options);
    }

    public getUsersList(
        request: keyValuePair<number>
    ): Observable<BaseResponse<IPaginatedResponse<Array<IUsersModel>>, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request };
        const url = SuperAdminUrls.getUsersList(this.adminProxy);
        return this.http.get<BaseResponse<IPaginatedResponse<Array<IUsersModel>>, void>>(
            url,
            { ...newParam },
            this.options
        );
    }

    public addNewUser(request: IAddUser): Observable<BaseResponse<IUsersModel, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request };
        const url = SuperAdminUrls.getUsersList(this.adminProxy);
        return this.http.post<BaseResponse<IUsersModel, void>>(url, { ...newParam }, this.options);
    }

    public updateUser(request: IAddUser): Observable<BaseResponse<IUsersModel, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request };
        const url = SuperAdminUrls.updateUser(this.adminProxy).replace(':userID', request?.id);
        return this.http.put<BaseResponse<IUsersModel, void>>(url, { ...newParam }, this.options);
    }

    public deleteUser(id: number): Observable<BaseResponse<{ Message: string }, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const url = SuperAdminUrls.updateUser(this.adminProxy).replace(':userID', id.toString());
        return this.http.delete<BaseResponse<{ Message: string }, void>>(url, {}, this.options);
    }

    /** Permission Services */
    public getPermissions(request: IGetPermission): Observable<BaseResponse<Array<IPermission>, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request };
        const url = SuperAdminUrls.getPermissions(this.adminProxy);
        return this.http.get<BaseResponse<IPermission, void>>(url, { ...newParam }, this.options);
    }

    public addPermission(request: IAddPermissionRequest): Observable<BaseResponse<IPermission, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request };
        const url = SuperAdminUrls.getPermissions(this.adminProxy);
        return this.http.post<BaseResponse<IPermission, void>>(url, { ...newParam }, this.options);
    }

    public deletePermission(id: number): Observable<BaseResponse<{ Message: string }, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const url = SuperAdminUrls.updatePermission(this.adminProxy).replace(':permissionId', id.toString());
        return this.http.delete<BaseResponse<{ Message: string }, void>>(url, {}, this.options);
    }

    /** Logs Services */
    public getLogs(
        request: ILogsFilterRequest,
        route: string
    ): Observable<BaseResponse<IPaginatedResponse<ILogsResponse[]>, null>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request };
        const url = SuperAdminUrls.getLogs(this.adminProxy).replace(':route', route);
        return this.http.get<BaseResponse<IPaginatedResponse<ILogsResponse[]>, null>>(
            url,
            { ...newParam },
            this.options
        );
    }
}
