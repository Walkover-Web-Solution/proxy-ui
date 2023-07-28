export interface IGetReportsDashboardReqModel {
    from_date_time: string;
    to_date_time: string;
}

export interface IGetReportsDashboardResModel {
    IPv4: number;
    IPv6: number;
    IPv4_address_count: number;
    IPv6_address_count: number;
    total_domains_count: number;
    total_users_count: number;
    used_domains_count: number;
    used_users_count: number;
    senders_email_count: number;
    Queued: number;
    Accepted: number;
    Rejected: number;
    Delivered: number;
    Opened: number;
    Unsubscribed: number;
    Clicked: number;
    Bounced: number;
    Failed: number;
    Complaints: number;
    totalCount: number;
    Stopped: number;
}

export interface IGetReportsIpResModel {
    Domains_count: number;
    Domains: string;
    dedicated_ip: string;
    dedicated_ip_id: number;
    user_id: number;
    ip_type: string;
    Delivered: number;
    Unsubscribed: number;
    Bounced: number;
    Failed: number;
    Total: number;
    user: IUser;
}

export interface IUser {
    id: number;
    name: string;
    email: string;
    firebase_uid?: any;
    firebase_token?: any;
    panel_user_id: number;
    panel_id: number;
    role_id: number;
    mail_count: number;
    remaining_per_hour_mail_count: number;
    per_hour_mail_rate_limit: number;
    is_enabled: number;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
}

export interface ITemplateResModel {
    template_id: number;
    domain_id: number;
    domain_name: string;
    user_id: number;
    Delivered: number;
    Unsubscribed: number;
    Bounced: number;
    Failed: number;
    Total: number;
    user: IUser;
    template: IReportsTemplate;
}

export interface IReportsTemplate {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    subject: string;
    body: string;
    variables: any[];
    files: any[];
    meta?: any;
    status_id: number;
    description?: any;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
}

export interface IExportReportResModel {
    parameters: unknown;
    user_id: number;
    updated_at: string;
    created_at: string;
    id: number;
}

export interface IAdminEmailClient {
    created_at: string;
    deleted_at: string;
    email: string;
    id: number;
    is_enabled: number;
    mails_sent: number;
    meta: any;
    name: string;
    panel_id: number;
    panel_user_id: number;
    role_id: number;
    updated_at: string;
    user_id: number;
}
