import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseResponse, IIdNameModel, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import { map } from 'rxjs/operators';
import { AdminVoiceReportsUrls } from 'libs/service/src/lib/utils/admin/voice/reports';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminVoiceReportsModule {}

@Injectable({
    providedIn: ServicesAdminVoiceReportsModule,
})
export class AdminVoiceReportsService {
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

    public getAdminVoiceReportsService(request: any): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...request, company_id: this.token.companyId ? this.token.companyId : '' };
        return this.http
            .get(AdminVoiceReportsUrls.getAdminVoiceReports(this.voiceBaseUrl), newParam, this.options)
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, any> = res;
                    data.request = request;
                    return data;
                })
            );
    }

    public getVoiceCallRecording(id: number): Observable<Blob> {
        const options = {
            responseType: 'blob',
            headers: {
                Authorization: '',
            },
            withCredentials: false,
        };
        options.headers.Authorization = this.authService.getTokenSync();

        return this.http
            .get(
                AdminVoiceReportsUrls.getAdminVoiceCallRecording(this.voiceBaseUrl).replace(':id', id.toString()),
                {},
                options
            )
            .pipe(
                map((res) => {
                    return new Blob([res], { type: 'audio/wav' });
                })
            );
    }

    public getCallServersList(): Observable<any> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<IIdNameModel[], any>>(
            AdminVoiceReportsUrls.getCallServersList(this.voiceBaseUrl),
            {},
            this.options
        );
    }

    public GetColumn(): Observable<BaseResponse<string[], null>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<string[], null>>(
            AdminVoiceReportsUrls.columnsFilter(this.voiceBaseUrl),
            {},
            this.options
        );
    }

    public updateColumns(param: { columns: string[] }): Observable<BaseResponse<any, { columns: string[] }>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<BaseResponse<any, { columns: string[] }>>(
            AdminVoiceReportsUrls.columnsFilter(this.voiceBaseUrl),
            param,
            this.options
        );
    }
}
