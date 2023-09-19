import { NgModule, Injectable, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
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
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private baseURL: any) {}

    // Get All Users
    public getUsers(params): Observable<BaseResponse<IPaginatedResponse<IUser[]>, IUserReq>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IUser[]>, IUserReq>>(
            UsersUrl.getUsers(this.baseURL),
            params
        );
    }
}
