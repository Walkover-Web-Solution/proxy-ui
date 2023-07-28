import { IPivot } from '../../domains/domain';

export interface IEmailGetAllDomainsReqModel {
    with: string;
    get_reports: boolean;
    order_by?: string;
    order_type?: 'DESC' | 'ASC';
    page?: number;
    per_page?: number;
}

export interface IEmailGetAllDomainsResModel {
    id: number;
    user_id: number;
    title: string;
    domain: string;
    verification_status_id: number;
    spf_status_id: number;
    dkim_status_id: number;
    mx_status_id: number;
    status_id: number;
    mail_count: number;
    remaining_per_hour_mail_count: number;
    per_hour_mail_rate_limit: number;
    public_logo: string;
    verification: IEmailVerification;
    spf: IEmailVerification;
    dkim: IEmailVerification;
    mx: IEmailMx;
    is_enabled: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    reports: IEmailReports;
    user: IEmailUser;
    dedicated_ips: IEmailDedicatedIp[];
    meta: { [key: string]: IDomainKeyValuePair | string };
    delayed_outbound: any;
}

export interface IEmailDedicatedIp {
    id: number;
    address: string;
    host: string;
    host_ip: string;
    gateway: string;
    data_center: string;
    node_number: number;
    mail_count: number;
    remaining_per_hour_mail_count: number;
    per_hour_mail_rate_limit: number;
    is_assigned: number;
    meta?: unknown | null;
    created_at: string;
    updated_at: string;
    deleted_at?: unknown;
    pivot: IPivot;
}

export interface IEmailUser {
    id: number;
    name: string;
    email: string;
    firebase_uid?: string | null;
    firebase_token?: string | null;
    panel_user_id?: string | null;
    panel_id: number;
    role_id: number;
    mail_count: number;
    remaining_per_hour_mail_count: number;
    per_hour_mail_rate_limit: number;
    is_enabled: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface IEmailReports {
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
    emailCount?: number;
}

export interface IEmailMx {
    key: string;
    record: string;
    values: string[];
    priority: number[];
    current_value: unknown[];
}

export interface IEmailVerification {
    key: string;
    value: string;
    record: string;
    current_value: string;
}

export interface IEmailAssignIpsReqModel {
    dedicated_ip_ids: string;
    domain_id: string;
}

export interface IEmailToggleDomainReqModel {
    domain_id: number;
    enable_delayed?: boolean;
}

export interface IEmailIpDetailsResModel {
    nodes: INodes[];
    gateways: IGateways[];
}

export interface INodes {
    node_number: number;
}

export interface IGateways {
    gateway: string;
}

export interface IGetIpsReqModel {
    with_count: string;
    node?: string;
    gateway?: string;
    keyword?: string;
}

export interface IGetIpsResModel {
    id: number;
    address: string;
    host: string;
    host_ip: string;
    gateway: string;
    data_center: string;
    node_number: number;
    mail_count: number;
    remaining_per_hour_mail_count: number;
    per_hour_mail_rate_limit: number;
    is_assigned: number;
    meta?: any;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
    domains_count: number;
    toggleCheck?: boolean;
}

export interface IEmailUnAssignIpReqModel {
    dedicated_ip_id: string;
    domain_id: string;
}

export interface IUpdatePerHourEmailReqModel {
    per_hour_mail_rate_limit?: number;
    domain_id: number;
}

export interface IDomainKeyValuePair {
    [key: string]: string;
}
