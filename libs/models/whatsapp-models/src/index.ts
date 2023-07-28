export * from './client';

export interface IWhatsAppDashboardReqModel {
    from_date: number | Date;
    to_date: number | Date;
    country_id: number;
}

export interface IWhatsAppDashboardResModel {
    whatsapp_active_clients: number;
    message_graph_report: IWhatsAppGraphData[];
    outbound_graph_data: IWhatsAppGraphData[];
}

export interface IWhatsAppGraphData {
    name: string;
    series: IWhatsAppGraphSeries[];
}

export interface IWhatsAppGraphSeries {
    value: number;
    name: number | string | Date;
}

export interface IWhatsAppLogResModel {
    log_data: IWhatsAppLogData[];
    current_page_log_count: number;
    total_log_count: number;
}

export interface IWhatsAppLogData {
    company_id: number;
    client_name: string;
    team_id: string;
    sent_time: string;
    message_type: string;
    event: string;
    direction: string;
    customer_number: string;
    status: string;
    failure_reason: string;
    content: IWhatsAppKeyValuePair;
    showTrimEvent?: string;
    id: string;
}

export interface IWhatsAppKeyValuePair {
    [key: string]: string;
}

export interface IWhatsAppClient {
    id: string;
    company_id: number;
    client_name: string;
    monthly_usage: number;
    last_seen: string;
    // whatsapp_account_count: number;
    whatsapp_number: string;
    vendor_application_id?: any;
    d360_api_key?: string;
    vendor_name: string;
    vendor_id: unknown;
    status: string;
    team_id?: string;
}

export interface IWhatsAppClientResModel {
    client_data: IWhatsAppClient[];
    client_count: number;
    current_page_clients_count: number;
    total_clients_count: number;
}

export interface IWhatsAppClientReqModel {
    min_monthly_usage?: number;
    max_monthly_usage?: number;
    from_date?: number;
    to_date?: number;
    page_size?: number;
    page_number?: number;
    country_id: number;
}

export interface IWhatsAppLogReqModel {
    team_id: string;
    status: string;
    direction: string;
    from_date: number;
    to_date: number;
    message_type: string;
    page_size?: number;
    page_number?: number;
}

export interface IWhatsAppVendorResModel {
    id: number;
    vendor_name: string;
}

export interface IWhatsAppNumbersResModel {
    id: number;
    whatsapp_number: string;
}

export interface IWhatsAppClientsDropdownResModel {
    numbers: string[];
    vendors: { id: string; vendor_name: string }[];
    status: string[];
}

export interface IWhatsAppLogsDropdownResModel {
    status: string[];
    message_type: string[];
    direction: string[];
    vendors: { id: number; vendor_name: string }[];
    usage_type: string[];
}

export interface GetAllDialPlans {
    id: number;
    dial_plan_name: string;
    currency: string;
    dial_plan_type: number;
    has_pricing: boolean;
}

export interface GetAllDialPlansResponse {
    current_page_dial_plan_count: number;
    dial_plans: Array<GetAllDialPlans>;
    total_dial_plan_count: number;
}

// Dial Plan
export interface CreateDialPlanRequest {
    dial_plan_name: string;
    currency: string;
    dial_plan_type: 0 | 1;
}

export interface DialPlanPricing {
    pricing_id: number | undefined;
    country_name: string;
    country_prefix: string;
    business_initiated_rate: string;
    user_initiated_rate: string;
    marketing_rate: string;
    authentication_rate: string;
    utility_rate: string;
    is_edit?: boolean;
    plan_id?: number;
}

export interface DialPlan {
    dial_plan_id: number;
    dial_plan_name: string;
    currency: string;
    user_count?: number;
    prefix_count?: number;
    pricing_list: Array<DialPlanPricing>;
}

export enum IWhatsappTemplateMessageType {
    Header = 'HEADER',
    Body = 'BODY',
    Footer = 'FOOTER',
    Button = 'BUTTONS',
}

export enum IWhatsappTemplateHeaderFormat {
    Text = 'TEXT',
    Document = 'DOCUMENT',
    Image = 'IMAGE',
    Video = 'VIDEO',
}

export enum IWhatsappTemplateButtonFormat {
    QuickReply = 'QUICK_REPLY',
    PhoneNumber = 'PHONE_NUMBER',
    Url = 'URL',
}

export interface IWhatsappTemplate {
    format?: IWhatsappTemplateHeaderFormat;
    type: IWhatsappTemplateMessageType;
    text: string;
}
