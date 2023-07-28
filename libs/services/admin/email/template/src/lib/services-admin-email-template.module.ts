import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse, IPaginatedEmailResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAllRejectReasonResModel,
    IEmailTemplateReqModel,
    IGetAllTemplatesResModel,
    IGetTemplateDetail,
    IUpdateTemplateReqModel,
} from '@msg91/models/email-models';
import { AdminEmailTemplateUrls } from 'libs/service/src/lib/utils/admin/email/template-urls';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminEmailTemplateModule {}

@Injectable({
    providedIn: ServicesAdminEmailTemplateModule,
})
export class AdminEmailTemplateService {
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
        @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getAllTemplates(
        param: IEmailTemplateReqModel | null
    ): Observable<BaseResponse<IPaginatedEmailResponse<IGetAllTemplatesResModel[]>, IEmailTemplateReqModel | null>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<
            BaseResponse<IPaginatedEmailResponse<IGetAllTemplatesResModel[]>, IEmailTemplateReqModel | null>
        >(AdminEmailTemplateUrls.getAllTemplates(this.emailBaseUrl), newParam, this.options);
    }

    public getTemplateDetail(id: number): Observable<BaseResponse<IGetTemplateDetail, number>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<BaseResponse<IGetTemplateDetail, number>>(
            AdminEmailTemplateUrls.template(this.emailBaseUrl).replace(':template_id', id.toString()),
            newParam,
            this.options
        );
    }

    public updateTemplate(
        body: IGetAllTemplatesResModel,
        id: number
    ): Observable<BaseResponse<any, IUpdateTemplateReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = { ...body, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.put<BaseResponse<any, IUpdateTemplateReqModel>>(
            AdminEmailTemplateUrls.template(this.emailBaseUrl).replace(':template_id', id.toString()),
            newBody,
            this.options
        );
    }

    public getAllTemplatesVersion(
        param: IEmailTemplateReqModel | null
    ): Observable<BaseResponse<IPaginatedEmailResponse<IGetAllTemplatesResModel[]>, IEmailTemplateReqModel | null>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<
            BaseResponse<IPaginatedEmailResponse<IGetAllTemplatesResModel[]>, IEmailTemplateReqModel | null>
        >(AdminEmailTemplateUrls.getAllTemplatesVersions(this.emailBaseUrl), newParam, this.options);
    }

    public updateTemplateVersion(
        body: IGetAllTemplatesResModel,
        id: number
    ): Observable<BaseResponse<any, IUpdateTemplateReqModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = {
            ...body,
            panel_user_id: this.token.companyId ? this.token.companyId : '',
            panel_id: 2,
            with: 'template.user',
        };
        return this.http.patch<BaseResponse<any, IUpdateTemplateReqModel>>(
            AdminEmailTemplateUrls.templateVersion(this.emailBaseUrl).replace(':template_id', id.toString()),
            newBody,
            this.options
        );
    }

    public getAllReasons(
        param: any
    ): Observable<BaseResponse<IPaginatedEmailResponse<IAllRejectReasonResModel[]>, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IAllRejectReasonResModel[]>, any>>(
            AdminEmailTemplateUrls.rejectReason(this.emailBaseUrl),
            newParam,
            this.options
        );
    }

    public addRejectedReason(body: any): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = { ...body, panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http.post<BaseResponse<any, IUpdateTemplateReqModel>>(
            AdminEmailTemplateUrls.rejectReason(this.emailBaseUrl),
            newBody,
            this.options
        );
    }

    public removeRejectedReason(id: string): Observable<BaseResponse<any, number>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newBody = { panel_user_id: this.token.companyId ? this.token.companyId : '', panel_id: 2 };
        return this.http
            .delete(
                AdminEmailTemplateUrls.rejectReasonParticular(this.emailBaseUrl).replace(':rejectedReason', id),
                newBody,
                this.options
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, number> = res;
                    data.request = +id;
                    return data;
                })
            );
    }
}
