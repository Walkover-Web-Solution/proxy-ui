export interface ISmsTemplateReqModel {
    pageNo?: number;
    itemsPerPage?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    filterByStatus?: string[];
}

export interface ISmsTemplateVersionReqModel {
    template_id: string;
}

export interface ISmsTemplateVersionDetailsReqModel {
    id: number;
}

// Request Models
export interface IAddTemplateReq {
    template_name: string;
    template: string;
    sender_id?: string;
    dlt_template_id?: string;
    smsType?: string;
}

export interface IAddTemplateVersionReq {
    template_id: string;
    template: string;
    sender_id?: string;
    dlt_template_id?: string;
    smsType: string;
}

export interface IUpdateTemplateVersion {
    id: number;
    template: string;
    sender_id: string;
    dlt_template_id?: string;
}

export interface IDeleteTemplateVersion {
    id: string;
}

// Response Models
export interface ITemplateResponse {
    id: string;
    user_id: string;
    sender_id: string;
    template_id: string;
    template_name: string;
    template: string;
    approved_date?: any;
    approved_operators: string;
    rejected_operators?: any;
    country_code?: any;
    created_date: string;
    user_data?: any;
    created_by: string;
    is_spam: string;
    spam_response: string;
    company_name: string;
    content_type?: any;
    email_template_id: string;
    is_pending: string;
    voice_template_id: string;
    whatsapp_template_id: string;
    push_payload_id: string;
    message_type: string;
    flow_order: string;
    condition_flow: string;
    condition_flow_whatsapp: string;
    condition_min: string;
    condition_min_whatsapp: string;
    recipients: string;
    status: string;
    condition_flow_notification: string;
    condition_flow_notification_min: string;
    matched_percentage_rejected: string;
    matched_percentage_approve: string;
    condition_flow_sms: string;
    condition_min_sms: string;
    DLT_TE_ID: string;
}

export interface ITemplateVersionRes {
    DLT_ID: string;
    active_status: string;
    id: string;
    sender_id: string;
    status: string;
    template_data: string;
    template_id: string;
    template_name: string;
    user_id: string;
    version: string;
}

export interface ISmsTemplateVersionDetailsRes {
    id: string;
    user_id: string;
    template_id: string;
    template_name: string;
    template_data: string;
    DLT_ID: string;
    sender_id: string;
    version: string;
    status: string;
    active_status: string;
    message_type: string;
    sms_type: string;
}

export interface IAddVersionRes {
    id: number;
    version: string;
    dlt_template_id: string;
    sender_id: string;
    template_data: string;
    template_name: string;
    versionStatus: number;
}

export interface IUpdateVersionResModel {
    dlt_template_id: string;
    sender_id: string;
    status: number;
    template_data: string;
    version_id: string;
}

export interface IDeleteVersionResModel {
    version_id: string;
}

export enum ISmsTemplateDialogType {
    AddVersion = 'add_version',
    UpdateVersion = 'update_version',
    DuplicateVersion = 'duplicate_version',
    CreateTemplate = 'create_template',
}
export interface ITestDltReq {
    DLT_TE_ID: string;
    sender_id: string;
    mobile: string | number;
    type: string;
    message: string;
}
