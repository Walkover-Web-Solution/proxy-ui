export * from './integration/integration';
export * from './admin-panel/admin-panel';
export * from './user/user';
export * from './agent/agent';
export * from './log/log';
export * from './report/report';

export interface IRCSClient {
    id: number;
    company_id: number;
    client_name: string;
    monthly_usage: number;
    last_seen: string;
    rcs_account_count: number;
}

export interface IRCSLog {
    company_id: number;
    client_name: string;
    team_id: string;
    sent_time: string;
    message_type:
        | 'text_message'
        | 'media'
        | 'suggested_replies'
        | 'dial'
        | 'view_location'
        | 'share_location'
        | 'open_url'
        | 'calender_event'
        | 'rich_card'
        | 'carousel';
    event: string;
    direction: string;
    customer_number: string;
    status: string;
    failure_reason: string;
    content:
        | ITextContent
        | IMediaContent
        | IRcsSuggestedRepliesContent
        | IRcsDialContent
        | IRcsViewLocationContent
        | IRcsShareLocationContent
        | IRcsUrlContent
        | IRcsCalenderContent
        | IRcsRichCardContent
        | IRcsCarousalContent
        | IRcsRichCardContent[];
}
export interface IMediaContent {
    media_url: string;
    fileExt?: string;
    fileName?: string;
}
export interface ITextContent {
    text: string;
}

export interface IRcsSuggestedRepliesContent extends ITextContent {
    replies_list: string[];
}

export interface IRcsDialContent extends ITextContent {
    dial_number: string;
    text_to_show: string;
}

export interface IRcsViewLocationContent extends ITextContent {
    location_query: string;
    text_to_show: string;
}

export interface IRcsShareLocationContent extends ITextContent {
    text_to_show: string;
}

export interface IRcsUrlContent extends ITextContent {
    text_to_show: string;
    url: string;
}

export interface IRcsCalenderContent extends ITextContent {
    text_to_show: string;
    description: string;
    end_time: string;
    start_time: string;
    title: string;
}

export interface IRcsRichCardContent {
    media_url?: string;
    description?: string;
    replies_list?: string[];
    title?: string;
}

export interface IRcsCarousalContent {
    image_urls: string[];
    descriptions: string[];
    replies_list_of_list: string[][];
    titles: string[];
}

export interface IRCSDashboardData {
    rcs_active_clients: number;
    message_graph_report: IRCSGraphData[];
    outbound_graph_data: IRCSGraphData[];
}

export interface IRCSGraphData {
    name: string;
    series: IRCSGraphSeries[];
}

export interface IRCSGraphSeries {
    value: number;
    name: number;
}

export interface IRcsAdminLogData {
    log_data: IRCSLog[];
    log_count: number;
    total_log_count: string | number;
}

export interface IRcsAdminClientResModel {
    client_count: number;
    client_data: IRCSClient[];
    total_client_count: number;
}

export interface IRCSDashboardRequest {
    company_id: string;
    from_date: string | Date;
    to_date: string | Date;
}

export interface IRcsLogRequest {
    team_name: string;
    status: string;
    direction: string;
    from_date: string;
    to_date: string;
    message_type: string;
    company_id: string;
    page_number: number;
    page_size: number;
    order_by?: string;
    order_type?: string;
}

export interface IRcsClientRequest {
    min_monthly_usage: string;
    max_monthly_usage: string;
    from_date: string;
    to_date: string;
    company_id: string;
    page_number: number;
    page_size: number;
    order_by?: string;
    order_type?: string;
}

export interface IRCSAdminLogDropdown {
    client_list: string[];
    direction: string[];
    message_type: string[];
    status: string[];
}

export interface IRCSBaseResponse<P> {
    data: P;
    status: 'success' | 'fail';
    hasError: boolean;
    errors: string[];
}
