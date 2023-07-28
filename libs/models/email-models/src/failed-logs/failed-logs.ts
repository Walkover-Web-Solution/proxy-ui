export interface IFailedLogsResModel {
    id: number;
    method: string;
    request_body: IRequestBody;
    user_id: number;
    ip: string;
    url: string;
    response_status: string;
    status_code: number;
    response_body: IResponseBody;
    meta: IFailedLogsMeta;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
    user: IFailedLogsUser;
}

export interface IFailedLogsUser {
    id: number;
    name: string;
    email: string;
    panel_user_id: number;
    panel_id: number;
    role_id: number;
    deduct_mail_count: number;
    mail_count: number;
    remaining_per_hour_mail_count: number;
    per_hour_mail_rate_limit: number;
    has_insufficient_balance: number;
    is_enabled: number;
    meta: IFailedLogsMeta2;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
}

export interface IFailedLogsMeta2 {
    permissions: any[];
}

export interface IFailedLogsMeta {
    ips: string;
}

export interface IResponseBody {
    data: Data;
    errors: string[];
    status: string;
    message: string;
    hasError: boolean;
}

export interface Data {}

export interface IRequestBody {
    path: string;
    template_id: string;
}

export interface IStatusCode {
    code: number;
    description: string;
    short_description?: string;
}
