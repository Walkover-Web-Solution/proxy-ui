import { CommonModule } from '@angular/common';
import { NgModule, Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponse, IPaginatedEmailResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import { map } from 'rxjs/operators';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { AdminSecurityLogUrls } from '@msg91/urls/security';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminSecurityLogsModule {}

@Injectable({
    providedIn: ServicesAdminSecurityLogsModule,
})
export class AdminSecurityLogsService {
    public options = {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Authorization': '',
        },
        withCredentials: false,
    };

    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getAdminEmailActivityService(params: any): Observable<BaseResponse<IPaginatedEmailResponse<any[]>, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...params, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<BaseResponse<IPaginatedEmailResponse<any[]>, any>>(
            AdminSecurityLogUrls.getEmailActivityLogs(this.emailBaseUrl),
            newParam,
            this.options
        );
    }
}
