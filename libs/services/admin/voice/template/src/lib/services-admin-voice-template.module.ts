import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAdminVoiceTemplateRequestModel,
    IAdminVoiceTemplatesResponseModel,
    IPaginatedVoiceResponse,
} from '@msg91/models/voice-models';
import { map } from 'rxjs/operators';
import { AdminVoiceTemplateUrls } from 'libs/service/src/lib/utils/admin/voice/template';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminVoiceTemplateModule {}

@Injectable({
    providedIn: ServicesAdminVoiceTemplateModule,
})
export class AdminVoiceTemplateService {
    public options = {
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json',
            Authorization: '',
        },
        withCredentials: false,
    };

    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.VoiceBaseURL) private voiceBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getAllTemplates(
        request: IAdminVoiceTemplateRequestModel
    ): Observable<
        BaseResponse<IPaginatedVoiceResponse<IAdminVoiceTemplatesResponseModel[]>, IAdminVoiceTemplateRequestModel>
    > {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = {
            ...request,
            company_id: this.token.companyId ? this.token.companyId : '',
        };
        return this.http.get<
            BaseResponse<IPaginatedVoiceResponse<IAdminVoiceTemplatesResponseModel[]>, IAdminVoiceTemplateRequestModel>
        >(AdminVoiceTemplateUrls.getAllTemplates(this.voiceBaseUrl), newParam, this.options);
    }

    public templateTestOnBrowser(request: number, templateId: number): Observable<BaseResponse<any, any>> {
        const option = {
            responseType: 'blob',
            headers: {
                Authorization: this.authService.getTokenSync(),
            },
            withCredentials: false,
        };
        return this.http
            .post(
                AdminVoiceTemplateUrls.templateTestOnBrowser(this.voiceBaseUrl).replace(
                    ':templateId',
                    templateId.toString()
                ),
                request,
                option
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, any> = res;
                    data.request = request;
                    return data;
                })
            );
    }
}
