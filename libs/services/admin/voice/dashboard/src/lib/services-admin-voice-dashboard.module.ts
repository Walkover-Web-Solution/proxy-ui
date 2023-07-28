import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import { AdminVoiceDashboardUrls } from 'libs/service/src/lib/utils/admin/voice/dashboard';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { IAdminVoiceDashboardAcdAsrResModel } from '@msg91/models/voice-models';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminVoiceDashboardModule {}

@Injectable({
    providedIn: ServicesAdminVoiceDashboardModule,
})
export class AdminVoiceDashboardService {
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
        @Inject(ProxyBaseUrls.VoiceBaseURL) private voiceBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getAllAdminVoiceDashboardDataService(
        request: any
    ): Observable<BaseResponse<IAdminVoiceDashboardAcdAsrResModel, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request, company_id: this.token.companyId ? this.token.companyId : '' };
        return this.http.get<BaseResponse<IAdminVoiceDashboardAcdAsrResModel, any>>(
            AdminVoiceDashboardUrls.getDashboardData(this.voiceBaseUrl),
            newParam,
            this.options
        );
    }
}
