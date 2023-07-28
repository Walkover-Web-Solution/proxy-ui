import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CampaignUrls } from '@msg91/urls/campaign';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    ICampaignActionLog,
    ICampaignAnalyticsRoot,
    ICampaignLog,
    ICampaignToken,
    ICompanyCampaignLogsApiResModal,
    ICreateCampaignReqModel,
    ICreateCampaignResModel,
    ICreateNewTokenReqModel,
    IGetAllCampaignReqModel,
    IGetAllCampaignResModel,
    IGetAllCampaignsTypeResModel,
    IGetAllTokenReqModel,
    IGetAllTokensIps,
    IGetCampaignDetailsResModel,
    IGetEmailDomainsResModel,
    IGetIpTypesResModel,
    IGetTemplatesByCampaignTypeResModel,
    IGetTokenDetailsResModel,
    IPluginSources,
    IRecordActionLog,
    ISnippetResModel,
    IUpdateTokenIp,
    IUpdateTokenResModel,
} from '@msg91/models/campaign-models';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91CampaignModule {}

@Injectable({ providedIn: ServicesMsg91CampaignModule })
export class CampaignService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.CampaignProxy) private baseUrl: any,
        @Inject(ProxyBaseUrls.ReportsUrl) private baseAnalyticsUrl: any
    ) {}

    public registerUser(request: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, null>>(CampaignUrls.registerUser(this.baseUrl), request);
    }

    public getAllCampaignTypesService(): Observable<BaseResponse<IGetAllCampaignsTypeResModel[], null>> {
        return this.http.get<BaseResponse<IGetAllCampaignsTypeResModel[], null>>(
            CampaignUrls.getAllCampaignTypes(this.baseUrl),
            ''
        );
    }

    public getTemplatesByTypesService(
        campaignTypeId: number,
        url: string,
        body: any
    ): Observable<BaseResponse<IGetTemplatesByCampaignTypeResModel[], number>> {
        const newBody = body ? body : {};
        return this.http.get(this.baseUrl + url, newBody).pipe(
            map((res) => {
                const data: BaseResponse<any, number> = res;
                data.request = campaignTypeId;
                return data;
            })
        );
    }
    public getTemplateDetailService(
        campaignTypeId: number,
        templateId: number,
        url: string,
        body: any,
        addOrNot: boolean
    ): Observable<BaseResponse<any, { campaignTypeId: number; addOrNot: boolean }>> {
        const newBody = body ? body : {};
        return this.http.get(this.baseUrl + url, newBody).pipe(
            map((res) => {
                const data: BaseResponse<any, { campaignTypeId: number; addOrNot: boolean }> = res;
                data.request = {
                    campaignTypeId: campaignTypeId,
                    addOrNot: addOrNot,
                };
                return data;
            })
        );
    }
    public getEmailDomainsService(): Observable<BaseResponse<IGetEmailDomainsResModel[], null>> {
        return this.http.get<BaseResponse<IGetEmailDomainsResModel[], null>>(
            CampaignUrls.getEmailDomains(this.baseUrl),
            ''
        );
    }

    public getAllCampaignService(
        param: IGetAllCampaignReqModel
    ): Observable<BaseResponse<IPaginatedResponse<IGetAllCampaignResModel[]>, IGetAllCampaignReqModel>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IGetAllCampaignResModel[]>, IGetAllCampaignReqModel>>(
            CampaignUrls.campaigns(this.baseUrl),
            param
        );
    }

    public createCampaignService(
        request: ICreateCampaignReqModel
    ): Observable<BaseResponse<ICreateCampaignResModel, IGetAllCampaignReqModel>> {
        return this.http.post<BaseResponse<ICreateCampaignResModel, ICreateCampaignReqModel>>(
            CampaignUrls.campaigns(this.baseUrl),
            request
        );
    }

    public updateCampaignService(
        request: ICreateCampaignReqModel,
        campaignId: number
    ): Observable<BaseResponse<IGetCampaignDetailsResModel, IGetAllCampaignReqModel>> {
        // change patch to post
        return this.http.post<BaseResponse<IGetCampaignDetailsResModel, ICreateCampaignReqModel>>(
            CampaignUrls.getAndUpdateCampaign(this.baseUrl).replace(':campaignId', campaignId.toString()),
            request
        );
    }

    public getCampaignDetailsService(
        campaignId: string
    ): Observable<BaseResponse<IGetCampaignDetailsResModel, string>> {
        return this.http.get<BaseResponse<IGetCampaignDetailsResModel, string>>(
            CampaignUrls.getAndUpdateCampaign(this.baseUrl).replace(':campaignId', campaignId.toString()),
            ''
        );
    }

    public getAllTokensService(
        param: IGetAllTokenReqModel | null
    ): Observable<BaseResponse<IPaginatedResponse<ICampaignToken[]>, IGetAllTokenReqModel | null>> {
        return this.http.get<BaseResponse<IPaginatedResponse<ICampaignToken[]>, IGetAllTokenReqModel | null>>(
            CampaignUrls.tokens(this.baseUrl),
            param
        );
    }

    public getTokenDetailsService(tokenId): Observable<BaseResponse<IGetTokenDetailsResModel, null>> {
        return this.http.get<BaseResponse<IGetTokenDetailsResModel, null>>(
            CampaignUrls.getAndUpdateToken(this.baseUrl).replace(':tokenId', tokenId.toString()),
            ''
        );
    }

    public createTokenService(
        request: ICreateNewTokenReqModel
    ): Observable<BaseResponse<ICampaignToken, IGetAllCampaignReqModel>> {
        return this.http.post<BaseResponse<ICampaignToken, ICreateNewTokenReqModel>>(
            CampaignUrls.tokens(this.baseUrl),
            request
        );
    }

    public updateTokenService(
        request: ICreateNewTokenReqModel,
        tokenId: number
    ): Observable<BaseResponse<IUpdateTokenResModel, IGetAllCampaignReqModel>> {
        return this.http.patch<BaseResponse<IUpdateTokenResModel, ICreateNewTokenReqModel>>(
            CampaignUrls.getAndUpdateToken(this.baseUrl).replace(':tokenId', tokenId.toString()),
            request
        );
    }

    public updateTokenAssociateService(request: any, tokenId: number): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(
            CampaignUrls.updateTokenAssociate(this.baseUrl).replace(':tokenId', tokenId.toString()),
            request
        );
    }

    public dynamicApiCallService(
        request: string,
        which: { id: number; index: number; name: string }
    ): Observable<BaseResponse<any, any>> {
        return this.http.get(request, '').pipe(
            map((res) => {
                const data: BaseResponse<any, { id: number; index: number; name: string }> = res;
                data['request'] = which;
                return data;
            })
        );
    }

    public getIpTypes(): Observable<BaseResponse<IGetIpTypesResModel[], number>> {
        return this.http.get<BaseResponse<IGetIpTypesResModel[], number>>(CampaignUrls.ipTypes(this.baseUrl), '');
    }

    public getTokenIps(
        request: any,
        tokenId: number
    ): Observable<BaseResponse<IPaginatedResponse<IGetAllTokensIps[]>, number>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IGetAllTokensIps[]>, number>>(
            CampaignUrls.tokenIps(this.baseUrl).replace(':tokenId', tokenId.toString()),
            request
        );
    }

    public updateTokenIps(request: IUpdateTokenIp, tokenId: number): Observable<BaseResponse<any, IUpdateTokenIp>> {
        return this.http.post<BaseResponse<any, IUpdateTokenIp>>(
            CampaignUrls.tokenIps(this.baseUrl).replace(':tokenId', tokenId.toString()),
            request
        );
    }

    public deleteTokenIps(tokenId: number, ipId: number): Observable<BaseResponse<any, number>> {
        return this.http.delete<BaseResponse<any, number>>(
            CampaignUrls.removeTokenIps(this.baseUrl)
                .replace(':tokenId', tokenId.toString())
                .replace(':ipId', ipId.toString())
        );
    }

    public getCampaignWiseSnippet(campaignId: number): Observable<BaseResponse<ISnippetResModel[], number>> {
        return this.http.get<BaseResponse<ISnippetResModel[], number>>(
            CampaignUrls.campaignWiseSnippet(this.baseUrl).replace(':campaignId', campaignId.toString()),
            ''
        );
    }

    public runCampaign(request: any, campaignId: number): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(
            CampaignUrls.runCampaign(this.baseUrl).replace(':campaignId', campaignId.toString()),
            request
        );
    }

    public getCampaignLog(
        slug: string,
        params: any
    ): Observable<BaseResponse<IPaginatedResponse<ICampaignLog[]>, any>> {
        return this.http.get<BaseResponse<IPaginatedResponse<ICampaignLog[]>, any>>(
            CampaignUrls.getCampaignLogs(this.baseUrl).replace(':slug', slug),
            params
        );
    }

    public getCampaignActionLog(
        slug: string,
        id: number,
        params: any
    ): Observable<BaseResponse<IPaginatedResponse<ICampaignActionLog[]>, any>> {
        return this.http.get<BaseResponse<IPaginatedResponse<ICampaignActionLog[]>, any>>(
            CampaignUrls.getActionLogs(this.baseUrl).replace(':slug', slug).replace(':id', id.toString()),
            params
        );
    }

    public getRecordActionLog(
        slug: string,
        id: number,
        params: any
    ): Observable<BaseResponse<IPaginatedResponse<IRecordActionLog[]>, any>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IRecordActionLog[]>, any>>(
            CampaignUrls.getRecordActionLogs(this.baseUrl).replace(':slug', slug).replace(':id', id.toString()),
            params
        );
    }

    public getCampaignReport(campaignId: string): Observable<any> {
        return this.http.get<BaseResponse<any, any>>(
            CampaignUrls.getCampaignReport(this.baseUrl).replace(':campaignId', campaignId)
        );
    }

    public getStatusList(field: string): Observable<BaseResponse<string[], any>> {
        return this.http.get<BaseResponse<string[], any>>(
            CampaignUrls.getStatusList(this.baseUrl).replace(':field', field)
        );
    }

    public getCampaignCompanyLogs(
        params: any
    ): Observable<BaseResponse<IPaginatedResponse<ICompanyCampaignLogsApiResModal[]>, any>> {
        return this.http.get<BaseResponse<IPaginatedResponse<ICompanyCampaignLogsApiResModal[]>, any>>(
            CampaignUrls.getCompanyCampaignLogs(this.baseUrl),
            params
        );
    }

    public getPluginSources(params: any): Observable<BaseResponse<IPaginatedResponse<IPluginSources[]>, any>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IPluginSources[]>, any>>(
            CampaignUrls.getPluginSource(this.baseUrl),
            params
        );
    }

    public getCampaignAnalytics(params: any): Observable<ICampaignAnalyticsRoot> {
        return this.http.post<ICampaignAnalyticsRoot>(CampaignUrls.getCampaignAnalytics(this.baseAnalyticsUrl), params);
    }

    public getRefIds(params: any, slug: string): Observable<any> {
        return this.http.get<any>(CampaignUrls.getRefIds(this.baseUrl).replace(':slug', slug), params);
    }
    public getNodeName(slug: string): Observable<any> {
        return this.http.get<any>(CampaignUrls.getNodeName(this.baseUrl).replace(':slug', slug));
    }

    public getCampaignLogData(
        slug: string,
        logId: string
    ): Observable<BaseResponse<IPaginatedResponse<ICampaignLog[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<ICampaignLog[]>, void>>(
            CampaignUrls.getCampaignLogData(this.baseUrl).replace(':slug', slug).replace(':logId', logId)
        );
    }

    public getGroupCompanyLogs(
        params: any
    ): Observable<BaseResponse<IPaginatedResponse<ICompanyCampaignLogsApiResModal[]>, any>> {
        return this.http.get<BaseResponse<IPaginatedResponse<ICompanyCampaignLogsApiResModal[]>, any>>(
            CampaignUrls.getGroupCompanyLogs(this.baseUrl),
            params
        );
    }
}
