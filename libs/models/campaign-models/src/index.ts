import { WhatsappReportData } from '@msg91/models/report-models';

export interface IGetAllCampaignReqModel {
    name?: string;
    is_active?: number;
    itemsPerPage?: number;
    pageNo?: number;
    which?: string;
}

export interface ICampaignReportsParams {
    startDate?: string | Date;
    endDate?: string | Date;
    campaignSlug: string;
    groupBy?: string;
}

export interface IGetAllCampaignResModel {
    id: number;
    campaign_type_id?: number;
    name: string;
    is_active: number | boolean;
    configurations?: IConfigurationsForCreateCampaign;
    slug?: string;
}

export interface ICampaignResModel {
    id: number;
    name: string;
    is_active: boolean;
    slug: string;
    channels: IChannelModel[];
}
export interface IChannelModel {
    campaign_id: number;
    channel_id: number;
    count?: number;
}

interface Configurations {
    [key: string]: string;
}

export interface IConfigurationsForCreateCampaign {
    [key: string]: any[];
}

export interface IGetTemplatesByCampaignTypeResModel {
    id: number | string;
    name: string;
    allowed?: boolean;
    campaign_type?: number;
    slug?: string;
}

export interface IGetCampaignLogsGroupedByPluginSource {
    total_contacts: number;
    source_name: string;
    source: string;
    date: string;
}

export interface IGetCSVLogs {
    id: number;
    created_at: string;
    no_of_contacts: number;
    status: string;
    ip: string;
    need_validation: boolean;
    is_paused: boolean;
    can_retry: boolean;
    deleted_at: string;
    loop_detected: boolean;
    csv: Array<ICSV>;
    message: string;
    expandStatus?: boolean;
}

export interface ICSV {
    file_name: string;
}

export interface IGetAllCampaignsTypeResModel extends IGetTemplatesByCampaignTypeResModel {
    configurations: IConfigurationsForCreateCampaign;
    created_at: string;
    updated_at: string;
}

export interface ICreateCampaignReqModel {
    // name: string;
    // campaign_type_id: string;
    // template_id: string;
    // configurations: Configurations;
    // templates: IUpdateCreateTemplateSendModel;
    name: string;
    flow_action: {
        type: string;
        linked_id: string;
        template: IUpdateCreateTemplateSendModel;
    }[];
}

export interface ICreateCampaignResModel {
    name: string;
    configurations: Configurations;
    campaign_type_id: string;
    is_active: boolean;
    id: number;
}

export interface IGetEmailDomainsResModel {
    name: string;
}

export interface IGetCampaignDetailsResModel {
    id: number;
    campaign_type_id: number;
    name: string;
    is_active: number;
    configurations: IConfigurationsForCreateCampaign;
    template: ITemplate;
    token: ICampaignDetailToken;
    slug: string;
    flow_actions: any[];
}

export interface ICampaignDetailToken {
    name: string;
    token: string;
}

export interface ICampaignToken {
    id: number;
    company_id: number;
    name: string;
    token: string;
    is_active: boolean;
    is_primary: boolean;
    deleted_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ITemplate {
    id: number;
    campaign_id: number;
    template_id: string;
    name: string;
    content: string;
    variables: string[];
    meta: ICampaignMeta;
    created_at: string;
    updated_at: string;
}

export interface ICampaignMeta {
    id: number;
    body: string;
    meta?: unknown | null;
    name: string;
    slug: string;
    files: string[];
    subject: string;
    user_id: number;
    status_id: number;
    variables: string[];
    created_at: string;
    deleted_at?: string | null;
    updated_at: string;
    description?: string | null;
}

export interface ICreateNewTokenReqModel extends IUpdateTokenReqModel {
    name?: string;
    // properties?: ITokenProperties
}

export interface IUpdateTokenReqModel {
    throttle_limit?: string;
    temporary_throttle_limit?: string;
    temporary_throttle_time?: number;
}

export interface IUpdateTokenResModel extends ICampaignToken {
    properties: ITokenProperties;
}

export interface ITokenProperties {
    company_token_id?: number;
    throttle_limit?: string;
    whitelist_ips?: string[];
    blacklist_ips?: string[];
}

export interface IGetTemplateDetailResModel {
    id: number;
    name: string;
    content: string;
    variables: string[];
    meta: { [key: string]: any };
}

export interface IGetAllTokenReqModel {
    name?: string;
    itemsPerPage?: number;
    pageNo?: number;
}

export interface IGetTokenDetailsResModel extends IUpdateTokenResModel {
    campaigns: ICampaignsDummy[];
    throttle_limit: string;
    temporary_throttle_limit: string;
    temporary_throttle_time: number;
}

export interface ICampaignsDummy extends Configurations {
    id: string;
}

export interface ICustomAllCampaign extends IGetTemplatesByCampaignTypeResModel {
    is_selected: boolean;
}

export interface ICustomTokenCampaign {
    id: number;
    is_selected: boolean;
    name: string;
    is_active?: number;
    slug?: string;
}

export interface IGetIpTypesResModel {
    id: 1;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface IGetAllTokensIps {
    id: number;
    company_token_id: number;
    ip: string;
    ip_type_id: number;
    expires_at: string;
    created_at: string;
    updated_at: string;
}

export interface IUpdateTokenIp {
    ip: string;
    ip_type_id: number;
}

export interface ISnippetResModel {
    platform: string;
    snippet: string;
}

export interface IUpdateCreateTemplateSendModel {
    template_id: string;
    name: string;
    content: string;
    variables: string[];
}

export interface ICampaignLog {
    id: number;
    campaign_id: number;
    created_at: string;
    no_of_contacts: number;
    status: string;
    ip: string;
    need_validation: boolean;
}

export interface ICampaignActionLog {
    id: number;
    campaign_id: number;
    campaign_log_id: string;
    status: string;
    report_status: string;
    response: {
        data: string;
        errors: any[];
        status: string;
        hasError: boolean;
        duplicate: number;
    };
    ref_id: string;
    no_of_records: number;
    created_at: string;
}

export interface IRecordActionLog {
    id: number;
    action_log_id: number;
    ref_id: string;
    status: string;
    report_status: string;
    response: {
        data: string;
        errors: any[];
        status: string;
        message: string;
        hasError: boolean;
        duplicate: number;
    };
    no_of_records: number;
    created_at: string;
    updated_at: string;
}

export interface CampaignReportsSms {
    date: string;
    company?: string;
    campaign?: string;
    sent: number;
    balanceDeducted: number;
    delivered: number;
    failed: number;
    ndnc: number;
    blocked: number;
    autoFailed: number;
    rejected: number;
    deliveryTime?: number;
    country?: string;
    nodeId?: string;
}

export interface CampaignReportsEmail {
    accepted: number;
    bounced: number;
    date: string;
    delivered: number;
    failed: number;
    nodeId: number;
    rejected: number;
    total: number;
}

export interface CampaignReportsWhatsapp extends WhatsappReportData {
    nodeId: string;
}

export interface CampaignReportsResponse {
    sms: {
        data: Array<CampaignReportsSms>;
    };
    mail: {
        data: Array<CampaignReportsEmail>;
    };
    wa: {
        data: Array<CampaignReportsWhatsapp>;
    };
}

export interface DisplayedDataOnNode {
    delivered: number;
    failed: number;
    rejected?: number;
    sent?: number;
}

/** Type of condition nodes */
export enum ConditionNodeType {
    Country = 1,
    Delay = 2,
    Frequency = 3,
    Editor = 5,
    AbTesting = 4,
}

export enum FieldType {
    Text = 'text',
    Dropdown = 'dropdown',
    Time = 'time',
    Label = 'label',
    Object = 'object',
    Number = 'number',
    ChipList = 'chipList',
    Editor = 'editor',
    Checkbox = 'checkbox',
}

export interface FormattedReportsData {
    SMS: { [key: string]: DisplayedDataOnNode };
    Email: { [key: string]: DisplayedDataOnNode };
    Whatsapp: { [key: string]: DisplayedDataOnNode };
}

export interface ICampaignNodesTemplateIds {
    Email: Array<{ template_id: string }>;
    SMS: Array<{ template_id: string }>;
    Whatsapp: Array<{ template_id: string; language: string; integrated_number: string }>;
}
export enum PreviewType {
    MapVariables,
    Sms,
    Email,
    Whatsapp,
}

export interface ICompanyLogsResModal extends ICampaignResModel {
    campaign_name: string;
    is_campaign_deleted: number;
}

export interface ICompanyCampaignLogsApiResModal {
    data: ICompanyCampaignLogsResModal[];
}

export interface ICompanyCampaignLogsResModal {
    id: number;
    created_at: string;
    no_of_contacts: number;
    status: string;
    ip: string;
    need_validation: boolean;
    is_paused: boolean;
    can_retry: boolean;
    deleted_at: any;
    loop_detected: boolean;
    source: IPluginSources;
    campaign: ICompanyLogsResModal;
}
export interface IPluginSources {
    id: number;
    name: string;
    source: string;
    icon: string;
}

export interface ICampaignAnalyticsRoot {
    [key: string]: ICampaignAnalytics;
}
export interface ICampaignAnalytics {
    data: IAnalyticsCampaignData[];
    total: IAnalyticsCampaignTotal;
    totalClicks?: { [key: string]: number };
    totalPrice?: { [key: string]: number };
}
export interface IAnalyticsCampaignData {
    nodeId: string;
    sent: number;
    balanceDeducted: any;
    deliveredCredit: number;
    failedCredit: number;
    rejectedCredit: number;
    delivered: number;
    failed: number;
    rejected: number;
    ndnc: number;
    clicks: number;
    totalPrice: number;
}

export interface IAnalyticsCampaignTotal {
    message: number;
    delivered: number;
    failed: number;
    rejected: number;
    ndnc: number;
    totalCredits: number;
    failedCredits: number;
    rejectedCredits: number;
    deliveredCredits: number;
    retryCount: number;
    filtered: number;
}

export const ChannelTypeIcons = {
    1: { label_name: 'Email', icon_name: 'email' },
    2: { label_name: 'SMS', icon_name: 'sms' },
    3: { label_name: 'WhatsApp', icon_name: 'whatsapp' },
    4: { label_name: 'Voice', icon_name: 'voice' },
    5: { label_name: 'RCS', icon_name: 'rcs' },
    6: { label_name: 'Condition', icon_name: 'condition' },
    7: { label_name: 'Voice Flow', icon_name: 'voice-flow' },
    8: { label_name: 'Push Notifications', icon_name: 'push-notifications' },
};

export interface IOtherReportsData {
    data: { [key: string]: number };
    totalClicks?: { [key: string]: number };
    totalPrice?: { [key: string]: number };
}
