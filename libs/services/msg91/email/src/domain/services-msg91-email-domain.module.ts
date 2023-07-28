import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, IPaginatedEmailResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAddDomain,
    IAddDomainRespModel,
    IMailTypes,
    IGetAllDomainRespModel,
    IGetReport,
    IPutDomainReqModel,
    ISettings,
    IVerifyDomain,
} from '@msg91/models/email-models';
import { DomainUrls } from '@msg91/urls/email/domain';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailDomainModule {}

@Injectable({
    providedIn: ServicesMsg91EmailDomainModule,
})
export class DomainService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any) {}

    public getAllDomainsService(
        params: IGetReport
    ): Observable<BaseResponse<IPaginatedEmailResponse<IGetAllDomainRespModel[]>, IGetReport>> {
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IGetAllDomainRespModel[]>, IGetReport>>(
            DomainUrls.getAllDomainsUrl(this.emailBaseUrl),
            params
        );
    }

    public getMailTypesService(): Observable<BaseResponse<IMailTypes[], any>> {
        return this.http.get<BaseResponse<IMailTypes[], any>>(DomainUrls.mailTypes(this.emailBaseUrl));
    }

    public addDomainService(request: IAddDomain): Observable<BaseResponse<IAddDomainRespModel, IAddDomain>> {
        return this.http.post<BaseResponse<IAddDomainRespModel, IAddDomain>>(
            DomainUrls.addDomainUrl(this.emailBaseUrl),
            request
        );
    }

    public verifyDomainService(request: IVerifyDomain): Observable<BaseResponse<IAddDomainRespModel, IVerifyDomain>> {
        return this.http.post<BaseResponse<IAddDomainRespModel, IVerifyDomain>>(
            DomainUrls.verifyDomainUrl(this.emailBaseUrl),
            request
        );
    }

    public getDomainByIdService(request: number, params = null): Observable<BaseResponse<IAddDomainRespModel, number>> {
        return this.http.get<BaseResponse<IAddDomainRespModel, number>>(
            DomainUrls.domainURL(this.emailBaseUrl).replace(':domainId', request.toString()),
            params
        );
    }

    public updateSettings(request: number, params: any): Observable<BaseResponse<ISettings, number>> {
        return this.http.put<BaseResponse<ISettings, number>>(
            DomainUrls.updateSettingUrl(this.emailBaseUrl).replace(':settingId', request.toString()),
            params
        );
    }

    public updateDomainService(
        request: IPutDomainReqModel,
        domainId: number
    ): Observable<BaseResponse<IAddDomainRespModel, IPutDomainReqModel>> {
        return this.http.put<BaseResponse<IAddDomainRespModel, IPutDomainReqModel>>(
            DomainUrls.domainURL(this.emailBaseUrl).replace(':domainId', domainId.toString()),
            request
        );
    }

    public updateDomainSMTPService(request: any, smtpId: number): Observable<BaseResponse<any, any>> {
        return this.http.patch<BaseResponse<any, any>>(
            DomainUrls.updateSMTPData(this.emailBaseUrl).replace(':smtpId', smtpId.toString()),
            request
        );
    }

    public activateDomainSMTP(domainId: number): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(DomainUrls.activateSMTP(this.emailBaseUrl), {
            domain_id: domainId,
        });
    }

    public deleteDomainService(domainId: number): Observable<BaseResponse<IAddDomainRespModel, number>> {
        return this.http.delete<BaseResponse<IAddDomainRespModel, number>>(
            DomainUrls.domainURL(this.emailBaseUrl).replace(':domainId', domainId.toString())
        );
    }

    public sendRecords(params: any): Observable<BaseResponse<ISettings, number>> {
        return this.http.post<BaseResponse<ISettings, number>>(DomainUrls.sendRecords(this.emailBaseUrl), params);
    }
}
