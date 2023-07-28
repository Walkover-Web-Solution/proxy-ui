export interface IOperationPermissionAdminResModel {
    created_at: string;
    deduct_mail_count: number;
    deleted_at: string;
    email: string;
    has_insufficient_balance: number;
    id: number;
    is_enabled: number;
    mail_count: number;
    meta: { permissions: string[] };
    name: string;
    panel_id: number;
    panel_user_id: number;
    per_hour_mail_rate_limit: number;
    remaining_per_hour_mail_count: number;
    role_id: number;
    updated_at: string;
}

export interface IOperationPermissionAdminReqModel {
    role_id: number;
    per_page: number;
    page?: number;
    name?: string;
}

export interface IOperationPermissionListResModel {
    mailer: {
        users: string[];
        domains: string[];
        admins: string[];
    };
}

export interface IOperationQueueAdminReqModel {
    per_page: number;
    page?: number;
}

export interface IOperationQueueAdminResModel {
    count: number;
    created_at: string;
    domain: { id: number; domain: string };
    domain_id: number;
    first_outbound_email_id: number;
    id: number;
    is_stopped: 0 | 1;
    updated_at: string;
    user_id: number;
}

export interface IQuickReportData {
    id: number;
    Title: string;
    result: any[];
}
