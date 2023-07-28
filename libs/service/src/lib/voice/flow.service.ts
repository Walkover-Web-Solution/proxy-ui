import { Inject, Injectable } from '@angular/core';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    Flow,
    FlowListResponseModel,
    IFlowCallerIDResponseModel,
    VoiceLibraryResponseModel,
} from '@msg91/models/voice-models';
import {
    ICampaignReportsParams,
    IGetAllCampaignReqModel,
    IGetCSVLogs,
    IGetCampaignLogsGroupedByPluginSource,
    IPluginSources,
} from '@msg91/models/campaign-models';
import { IRCSTemplate, IRCSTemplateDropDown } from '@msg91/models/rcs-models';
import { IWhatsAppClientTemplatesRespModel, IWhatsAppNumberResModel } from '@msg91/models/whatsapp-models';
import { IPaginationVoiceResponse } from '@msg91/models/voice-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { URLS } from './models/api-urls';
import { VoiceLibServiceModule } from './voice.module';
import { CustomValidators } from '@msg91/custom-validator';

@Injectable({
    providedIn: VoiceLibServiceModule,
})
export class FlowService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.VoiceBaseURL) private voiceBaseUrl: any,
        @Inject(ProxyBaseUrls.CampaignProxy) private campaignBaseUrl: any,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any,
        @Inject(ProxyBaseUrls.EmailProxy) private emailUrl: any,
        @Inject(ProxyBaseUrls.RcsProxy) private rcsBaseUrl: string,
        @Inject(ProxyBaseUrls.ReportsUrl) private reportsBaseUrl: string,
        @Inject(ProxyBaseUrls.WhatsAppProxy) private whatsAppBaseUrl: string
    ) {}

    public getReferenceIds(
        campaignSlug: string,
        logId: string
    ): Observable<BaseResponse<Record<string, string[]>, any>> {
        return this.http.get<BaseResponse<Record<string, string[]>, any>>(
            `${this.campaignBaseUrl}${URLS.FLOW.GET_REFERENCE_IDS}`
                .replace(':slug', campaignSlug)
                .replace(':campaignLogId', logId)
        );
    }

    public getAllVoiceFlowFromAPI(name?: string): Observable<BaseResponse<Flow[], void>> {
        let url = `${this.voiceBaseUrl}${URLS.FLOW.GET_ALL_FLOW}`;
        if (name) {
            url = url.concat(`?name=${name}`);
        }
        return this.http.get<BaseResponse<Flow[], void>>(url);
    }

    public getAllCampaignFlowFromAPI(
        param: IGetAllCampaignReqModel
    ): Observable<BaseResponse<IPaginatedResponse<Flow[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<Flow[]>, void>>(
            `${this.campaignBaseUrl}${URLS.FLOW.FETCH_ALL_CAMPAIGNS}`,
            param
        );
    }

    public getCampaignLogsGroupedByPluginSource(
        campaignSlug: string,
        params: ICampaignReportsParams
    ): Observable<BaseResponse<IPaginatedResponse<IGetCampaignLogsGroupedByPluginSource[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IGetCampaignLogsGroupedByPluginSource[]>, void>>(
            `${this.campaignBaseUrl}${URLS.FLOW.GET_CAMPAIGN_LOGS_GROUPED_BY_PLUGIN_SOURCE}`.replace(
                ':slug',
                campaignSlug
            ),
            params
        );
    }

    public getCsvLogs(params): Observable<BaseResponse<IPaginatedResponse<IGetCSVLogs[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IGetCSVLogs[]>, void>>(
            `${this.campaignBaseUrl}${URLS.FLOW.GET_CSV_LOGS_BY_PLUGIN_SOURCE}`
                .replace(':slug', params?.campaignSlug)
                .replace(':source', params?.source),
            params
        );
    }

    public getCampaignChannelType(): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(`${this.campaignBaseUrl}${URLS.FLOW.CHANNEL_TYPES}`);
    }

    public getAllCampaignConditionAPI(): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(`${this.campaignBaseUrl}${URLS.FLOW.CONDITIONS}`);
    }

    public getSelectedVoiceFlow(id: number): Observable<BaseResponse<Flow[], number>> {
        return this.http.get<BaseResponse<Flow[], number>>(`${this.voiceBaseUrl}${URLS.FLOW.GET_ALL_FLOW}${id}`);
    }

    public getSelectedCampaignFlow(id: number): Observable<BaseResponse<any, number>> {
        return this.http.get<BaseResponse<any, number>>(`${this.campaignBaseUrl}${URLS.FLOW.CAMPAIGNS}/${id}`);
    }

    public createNode(body): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(`${this.voiceBaseUrl}${URLS.FLOW.GET_ALL_FLOW}`, body);
    }

    public createCampaignNode(body, slug): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(
            `${this.campaignBaseUrl}${URLS.FLOW.FLOWACTION}`.replace(':slug', slug),
            body
        );
    }

    public deleteNode(body): Observable<any> {
        return this.http.delete<any>(`${this.voiceBaseUrl}${URLS.FLOW.GET_ALL_FLOW}`, {}, { body });
    }

    public deleteCampaignNode(body, slug, id): Observable<any> {
        return this.http.delete<any>(
            `${this.campaignBaseUrl}${URLS.FLOW.FLOWACTION}`.replace(':slug', slug) + '/' + id,
            {},
            { body }
        );
    }

    public deleteFlow(id): Observable<BaseResponse<any, any>> {
        const body = {
            module_type: 'flow',
            module_id: id,
        };
        const options = {
            body,
        };
        return this.http.delete<BaseResponse<any, any>>(`${this.voiceBaseUrl}${URLS.FLOW.GET_ALL_FLOW}`, body, options);
    }

    public deleteCampaignFlow(id): Observable<BaseResponse<any, any>> {
        return this.http.delete<BaseResponse<any, any>>(`${this.campaignBaseUrl}${URLS.FLOW.CAMPAIGNS}/${id}`);
    }

    public copyFlow(flow): Observable<any> {
        return this.http.post<any>(`${this.voiceBaseUrl}${URLS.FLOW.COPY_FLOW}`, flow);
    }

    public copyCampaignFlow(flow, slug): Observable<any> {
        return this.http.post<any>(
            `${this.campaignBaseUrl}${URLS.FLOW.COPY_CAMPAIGN_FLOW}`.replace(':slug', slug),
            flow
        );
    }

    public createVoiceFlow(request: { name: string; timezone?: string }): Observable<any> {
        const data = {
            module_type: 'flow',
            module_data: null,
            ...request,
            style: {
                x: 5550,
                y: 2620,
                width: 250,
            },
        };
        return this.http.post<any>(`${this.voiceBaseUrl}${URLS.FLOW.GET_ALL_FLOW}`, data);
    }

    public createCampaignFlow(request: { name: string }): Observable<any> {
        const data = {
            module_type: 'flow',
            ...request,
            style: {
                x: 5550,
                y: 2620,
                width: 250,
            },
            module_data: {},
        };
        return this.http.post<any>(`${this.campaignBaseUrl}${URLS.FLOW.CAMPAIGNS}`, data);
    }

    public updateNode(node: any): Observable<any> {
        return this.http.put<any>(`${this.voiceBaseUrl}${URLS.FLOW.GET_ALL_FLOW}`, node);
    }

    public updateCampaignNode(node: any, slug: string, id: number): Observable<any> {
        return this.http.put<any>(
            `${this.campaignBaseUrl}${URLS.FLOW.FLOWACTION}`.replace(':slug', slug) + '/' + id,
            node
        );
    }

    /**
     * Partially updates the campaign with PATCH method
     *
     * @param {*} node Node details to be updated
     * @param {string} slug Campaign slug
     * @param {number} id Flow Action ID
     * @return {Observable<any>} Observable to carry out further operation
     * @memberof FlowService
     */
    public partialUpdateCampaignNode(node: any, slug: string, id: number): Observable<any> {
        // const nodeData = node.module_data
        //     ? { ...node, module_data: CustomValidators.removeNullKeys(node.module_data) }
        //     : { ...node };
        return this.http.patch<any>(
            `${this.campaignBaseUrl}${URLS.FLOW.FLOWACTION}`.replace(':slug', slug) + '/' + id,
            node
        );
    }

    public updateCampaignFlow(node: any, slug: string, id: number): Observable<any> {
        return this.http.put<any>(`${this.campaignBaseUrl}${URLS.FLOW.CAMPAIGNS}/${slug}`, node);
    }

    public getEmailTemplate(params, keyword?: string): Observable<any> {
        params = {
            ...params,
            with: 'activeVersion',
        };
        return this.http.get<any>(
            `${this.emailUrl}/templates?status_id=2${keyword ? '&keyword=' + keyword + '&search_in=slug' : ''}`,
            params
        );
    }

    public getSMSTemplate(request: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}${'/api/v5/campaign/getTemplateList'}`, request);
    }

    public getSMSTemplateDetails(id): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}${'/api/v5/campaign/getTemplateDetails'}`, { id });
    }

    public getEmailDomainList(url, params, keyword?: string): Observable<any> {
        return this.http.get<any>(`${this.emailUrl}/${url}${keyword ? '&keyword=' + keyword : ''}`, params);
    }

    public getCampaignSnippet(slug): Observable<any> {
        return this.http.get<any>(`${this.campaignBaseUrl}${URLS.FLOW.CAMPAIGN_SNIPPET}`.replace(':slug', slug));
    }

    public campaignDryRun(slug, payload): Observable<any> {
        return this.http.post<any>(`${this.campaignBaseUrl}${URLS.FLOW.CHECK_DRY_RUN}`.replace(':slug', slug), payload);
    }

    public getCampaignFields(slug): Observable<any> {
        return this.http.get<any>(`${this.campaignBaseUrl}${URLS.FLOW.CAMPAIGN_FIELD}`.replace(':slug', slug));
    }

    public getCampaignFilters(): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(`${this.campaignBaseUrl}${URLS.FLOW.FILTERS}`);
    }

    public getPluginSources(): Observable<BaseResponse<IPaginatedResponse<IPluginSources[]>, any>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IPluginSources[]>, any>>(
            `${this.campaignBaseUrl}${URLS.FLOW.GET_PLUGIN_SOURCES}`
        );
    }

    public getTemplateData(
        url: string,
        params: any
    ): Observable<
        BaseResponse<{ template_data: IRCSTemplate[]; template_count: number; total_template_count: number }, any>
    > {
        return this.http.get<
            BaseResponse<{ template_data: IRCSTemplate[]; template_count: number; total_template_count: number }, any>
        >(`${this.rcsBaseUrl}/${url}`, params);
    }

    public getRCSClientPanelTemplateDropdown(params: any): Observable<BaseResponse<IRCSTemplateDropDown, any>> {
        return this.http.get<BaseResponse<IRCSTemplateDropDown, any>>(
            `${this.rcsBaseUrl}/${URLS.FLOW.GET_PROJECT_ID_FOR_RCS_TEMPLATE}`,
            params
        );
    }

    public getDropdownData(source: string, controlName: string): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(this.campaignBaseUrl + source).pipe(
            map((res: BaseResponse<any, any>) => {
                const data = res;
                data.request = { controlName };
                return data;
            })
        );
    }

    public setFlowLogActivity(slug, campaign_log_id, activity): Observable<any> {
        return this.http.post<any>(
            `${this.campaignBaseUrl}${URLS.FLOW.FLOW_LOG_ACTIVITY}`
                .replace(':slug', slug)
                .replace(':campaign_log_id', campaign_log_id)
                .replace(':activity', activity),
            {}
        );
    }

    public setFlowActivity(slug, activity): Observable<any> {
        return this.http.post<any>(
            `${this.campaignBaseUrl}${URLS.FLOW.FLOW_ACTIVITY}`.replace(':slug', slug).replace(':activity', activity),
            {}
        );
    }

    /**
     * Loads the campaign reports
     *
     * @param {*} requestObject Request object for the API
     * @return {Observable<any>} Observable to carry out further operations
     * @memberof FlowService
     */
    public loadCampaignReports(requestObject: any): Observable<any> {
        return this.http.post<any>(`${this.reportsBaseUrl}${URLS.FLOW.CAMPAIGN_REPORTS}`, { ...requestObject });
    }

    /**
     * Loads the campaign
     *
     * @param {string} campaignSlug
     * @return {*}  {Observable<BaseResponse<any, void>>}
     * @memberof FlowService
     */
    public loadCampaignNodes(campaignSlug: string): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(
            `${this.campaignBaseUrl}${URLS.FLOW.GET_CAMPAIGN_NODES}`.replace(':slug', campaignSlug)
        );
    }

    public getWhatsAppNumbers(url: string): Observable<BaseResponse<IWhatsAppNumberResModel[], any>> {
        return this.http.get<BaseResponse<IWhatsAppNumberResModel[], any>>(`${this.whatsAppBaseUrl}${url}`);
    }

    public getTemplateDetails(
        url: string,
        phoneNumber: string
    ): Observable<BaseResponse<IWhatsAppClientTemplatesRespModel[], string>> {
        return this.http.get<BaseResponse<IWhatsAppClientTemplatesRespModel[], string>>(
            `${this.whatsAppBaseUrl}${url}`.replace(':phoneNumber', phoneNumber)
        );
    }

    public fetchSyncData(phoneNumber: string): Observable<BaseResponse<IWhatsAppClientTemplatesRespModel[], string>> {
        return this.http.get<BaseResponse<IWhatsAppClientTemplatesRespModel[], string>>(
            `${this.whatsAppBaseUrl}/sync-template/${phoneNumber}/`
        );
    }

    public getVoiceTemplates(request: any): Observable<BaseResponse<IPaginationVoiceResponse<any[]>, any>> {
        return this.http
            .get<BaseResponse<IPaginationVoiceResponse<any[]>, any>>(`${this.voiceBaseUrl}/templates/`, request)
            .pipe(
                map((res) => {
                    const data: BaseResponse<IPaginationVoiceResponse<any[]>, any> = res;
                    data.request = request;
                    return data;
                })
            );
    }

    /**
     * get the email type for email type of node
     *
     * @param {*} url End point for the API
     * @return {Observable<any>} Observable to carry out further operations
     * @memberof FlowService
     */
    public getEmailMailType(url: string): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(`${this.baseUrl}/api/v5/email${url}`);
    }

    /**
     * Get voice module list for drag and drop.
     *
     * @returns {Observable<any>} Observable to carry out library for further operations
     */
    public getVoiceLibrary(): Observable<BaseResponse<VoiceLibraryResponseModel[], any>> {
        return this.http.get<BaseResponse<VoiceLibraryResponseModel[], any>>(`${this.voiceBaseUrl}/flow/modules/`);
    }

    public oneApiCreateCampaign(data: any, slug: string): Observable<any> {
        if (slug) {
            return this.http.put<any>(`${this.campaignBaseUrl}${URLS.FLOW.ONE_API_CREATE_CAMPAIGN}/${slug}`, data);
        } else {
            return this.http.post<any>(`${this.campaignBaseUrl}${URLS.FLOW.ONE_API_CREATE_CAMPAIGN}`, data);
        }
    }

    public oneApiUpdateCampaign(data: any, slug: string): Observable<any> {
        return this.http.put<any>(`${this.campaignBaseUrl}${URLS.FLOW.ONE_API_CREATE_CAMPAIGN}/${slug}`, data);
    }

    public getVoiceFlowList(url: string): Observable<BaseResponse<FlowListResponseModel[], void>> {
        return this.http.get<BaseResponse<FlowListResponseModel[], void>>(`${this.voiceBaseUrl}${url}`);
    }

    public getVoiceFlowCallerIDList(url: string): Observable<BaseResponse<IFlowCallerIDResponseModel, void>> {
        return this.http.get<BaseResponse<IFlowCallerIDResponseModel, void>>(`${this.voiceBaseUrl}${url}`);
    }

    public getCampaignVariables(slug: string): Observable<BaseResponse<{ [key: string]: string }, string>> {
        return this.http.get<BaseResponse<{ [key: string]: string }, string>>(
            `${this.campaignBaseUrl}${URLS.FLOW.GET_CAMPAIGN_VARIABLES.replace(':slug', slug)}`
        );
    }

    public getAllTimezones(): Observable<BaseResponse<string[], void>> {
        return this.http.get<BaseResponse<string[], void>>(`${this.voiceBaseUrl}/timezone/`);
    }
}
