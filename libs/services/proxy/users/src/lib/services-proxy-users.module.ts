import { NgModule, Injectable, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import {
    HttpWrapperService as HttpWrapperServiceNoAuth,
    ServicesHttpWrapperNoAuthModule,
} from '@proxy/services/http-wrapper-no-auth';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { IUser, IUserReq } from '@proxy/models/users-model';
import { UsersUrl } from '@proxy/urls/users-urls';
import { Observable } from 'rxjs';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperNoAuthModule],
})
export class ServicesProxyUsersModule {}

@Injectable({
    providedIn: 'root',
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
    public register(formData: any): Observable<any> {
        return this.httpNoAuth.post(UsersUrl.register(this.baseURL), formData, this.options);
    }
}
