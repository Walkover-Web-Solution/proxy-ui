import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse, IGetClientResModule, ProxyBaseUrls } from '@msg91/models/root-models';
import { RootUrls } from 'libs/service/src/lib/utils/admin/root-urls';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminRootModule {}
@Injectable({
    providedIn: ServicesAdminRootModule,
})
export class RootService {
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
        @Inject(ProxyBaseUrls.MsgAdminProxy) private msgBaseUrl: any,
        @Inject(ProxyBaseUrls.MsgProxy) private msgProxyBaseUrl: any,
        private authService: AuthService
    ) {}

    public getClient(param: any): Observable<BaseResponse<IGetClientResModule[], any>> {
        this.options.headers['Authorization'] = this.authService.getTokenSync();
        return this.http.get<BaseResponse<IGetClientResModule[], null>>(
            RootUrls.getClient(this.msgProxyBaseUrl),
            param,
            this.options
        );
    }
}
