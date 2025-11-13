import { NgModule, Injectable, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { HttpWrapperService as HttpWrapperServiceNoAuth } from '@proxy/services/http-wrapper-no-auth';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { IUser, IUserReq } from '@proxy/models/users-model';
import { UsersUrl } from '@proxy/urls/users-urls';
import { Observable } from 'rxjs';

@NgModule({
    imports: [CommonModule],
})
export class ServicesProxyUsersModule {}

@Injectable({
    providedIn: ServicesProxyUsersModule,
})
export class UsersService {
    public options = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        withCredentials: false,
    };

    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseURL: any,
        @Optional() private httpNoAuth: HttpWrapperServiceNoAuth
    ) {}

    // Get All Users
    public getUsers(params): Observable<BaseResponse<IPaginatedResponse<IUser[]>, IUserReq>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IUser[]>, IUserReq>>(
            UsersUrl.getUsers(this.baseURL),
            params
        );
    }
    public getRoles(params): Observable<BaseResponse<IPaginatedResponse<any[]>, void>> {
        const referenceId = params.referenceId;
        const url = UsersUrl.getRoles(this.baseURL).replace(':referenceId', referenceId);
        const queryParams = { ...params };
        delete queryParams.referenceId;
        return this.http.get<BaseResponse<IPaginatedResponse<any[]>, void>>(url, queryParams);
    }
    public createRole(payload: any): Observable<BaseResponse<any, void>> {
        const referenceId = payload.referenceId;
        const url = UsersUrl.createRole(this.baseURL).replace(':referenceId', referenceId);
        const body = { ...payload };
        delete body.referenceId;
        return this.http.post<BaseResponse<any, void>>(url, body);
    }

    public updateRole(payload: any): Observable<BaseResponse<any, void>> {
        const referenceId = payload.referenceId;
        const id = payload.id;
        const url = UsersUrl.updateRole(this.baseURL).replace(':referenceId', referenceId).replace(':id', id);
        const body = { ...payload };
        delete body.referenceId;
        delete body.id;
        return this.http.put<BaseResponse<any, void>>(url, body);
    }

    public deleteRole(payload: any): Observable<BaseResponse<any, void>> {
        const referenceId = payload.referenceId;
        const id = payload.id;
        const url = UsersUrl.deleteRole(this.baseURL).replace(':referenceId', referenceId).replace(':id', id);
        return this.http.delete<BaseResponse<any, void>>(url);
    }
    public getPermissions(params): Observable<BaseResponse<IPaginatedResponse<any[]>, void>> {
        const referenceId = params.referenceId;
        const url = UsersUrl.getPermissions(this.baseURL).replace(':referenceId', referenceId);
        const queryParams = { ...params };
        delete queryParams.referenceId;
        return this.http.get<BaseResponse<IPaginatedResponse<any[]>, void>>(url, queryParams);
    }
    public createPermission(payload: any): Observable<BaseResponse<any, void>> {
        const referenceId = payload.referenceId;
        const url = UsersUrl.createPermission(this.baseURL).replace(':referenceId', referenceId);
        const body = { ...payload };
        delete body.referenceId;
        return this.http.post<BaseResponse<any, void>>(url, body);
    }
    public deletePermission(payload: any): Observable<BaseResponse<any, void>> {
        const referenceId = payload.referenceId;
        const id = payload.id;
        const url = UsersUrl.deletePermission(this.baseURL).replace(':referenceId', referenceId).replace(':id', id);
        return this.http.delete<BaseResponse<any, void>>(url);
    }
    public updatePermission(payload: any): Observable<BaseResponse<any, void>> {
        const referenceId = payload.referenceId;
        const id = payload.id;
        const url = UsersUrl.updatePermission(this.baseURL).replace(':referenceId', referenceId).replace(':id', id);
        const body = { ...payload };
        delete body.referenceId;
        delete body.id;
        return this.http.put<BaseResponse<any, void>>(url, body);
    }

    public register(formData: any): Observable<any> {
        return this.httpNoAuth.post(UsersUrl.register(this.baseURL), formData, this.options);
    }
}
