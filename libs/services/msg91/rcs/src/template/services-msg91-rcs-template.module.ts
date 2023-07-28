import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { IRCSTemplateDropDown, IRCSTemplate, IRCSTemplateCreateReq } from '@msg91/models/rcs-models';
import { map } from 'rxjs/operators';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { RCSTemplateUrls } from '@msg91/urls/client-rcs';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91RcsTemplateModule {}

@Injectable({
    providedIn: ServicesMsg91RcsTemplateModule,
})
export class RCSTemplateService {
    constructor(private _http: HttpWrapperService, @Inject(ProxyBaseUrls.RcsProxy) private rcsBaseUrl: string) {}

    public getRCSClientPanelTemplateDropdown(params: any): Observable<BaseResponse<IRCSTemplateDropDown, any>> {
        return this._http.get(RCSTemplateUrls.getRCSClientPanelTemplateDropdown(this.rcsBaseUrl), params).pipe(
            map((res) => {
                const data: BaseResponse<IRCSTemplateDropDown, any> = res;
                return data;
            })
        );
    }

    public getTemplateData(
        params: any
    ): Observable<
        BaseResponse<{ template_data: IRCSTemplate[]; template_count: number; total_template_count: number }, any>
    > {
        return this._http.get(RCSTemplateUrls.getTemplateData(this.rcsBaseUrl), params).pipe(
            map((res) => {
                const data: BaseResponse<
                    { template_data: IRCSTemplate[]; template_count: number; total_template_count: number },
                    any
                > = res;
                return data;
            })
        );
    }

    public createTemplateData(payload: IRCSTemplateCreateReq): Observable<BaseResponse<string, IRCSTemplateCreateReq>> {
        return this._http.post(RCSTemplateUrls.createRCSTemplate(this.rcsBaseUrl), payload).pipe(
            map((res) => {
                const data: BaseResponse<string, IRCSTemplateCreateReq> = res;
                return data;
            })
        );
    }

    public deleteTemplateData(
        templateId: string,
        projectId: string
    ): Observable<BaseResponse<string, IRCSTemplateCreateReq>> {
        return this._http
            .delete(RCSTemplateUrls.createRCSTemplate(this.rcsBaseUrl) + `${templateId}/?project_id=${projectId}`)
            .pipe(
                map((res) => {
                    const data: BaseResponse<string, IRCSTemplateCreateReq> = res;
                    return data;
                })
            );
    }
}
