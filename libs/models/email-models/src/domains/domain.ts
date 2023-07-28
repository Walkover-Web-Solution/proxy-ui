/* eslint-disable @typescript-eslint/interface-name-prefix */
import { BaseEmailFilterRequest, BaseFilterRequest } from '@msg91/models/root-models';

export type IGetAllDomainReqModel = BaseFilterRequest;

export interface IGetAllDomainRespModel {
    id: number;
    user_id: number;
    domain: string;
    verification_status_id: number;
    spf_status_id: number;
    dkim_status_id: number;
    mx_status_id: number;
    status_id: number;
    verification: ITxtRecord;
    spf: ITxtRecord;
    dkim: ITxtRecord;
    mx: ITxtRecord;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
    reports: Reports;
    dedicated_ips: IDedicatedIps[];
    settings: ISettings;
    public_logo: string;
    title: string;
    is_demo_domain: number;
    smtp_credential?: IDomainSMTPInterface;
    cname_status_id: number;
    cname: ICname;
}

export interface Reports {
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
    Total?: number;
    Date?: string;
}

export interface IAddDomain {
    domain: string;
}

export interface IVerifyDomain {
    domain: string;
    check: string;
}

// its also useful in verify domain response
export interface IAddDomainRespModel {
    domain: string;
    user_id: number;
    updated_at: string;
    created_at: string;
    id: number;
    verification: ITxtRecord;
    spf: ITxtRecord;
    dkim: ITxtRecord;
    mx: ITxtRecord;
    mx_status_id: number;
    verification_status_id: number;
    spf_status_id: number;
    dkim_status_id: number;
    status: null | number;
    verification_status: IStatus;
    spf_status: IStatus;
    dkim_status: IStatus;
    mx_status: IStatus;
}

export interface IDomainSMTPInterface {
    domain_id: number;
    hostname: string;
    id: number;
    is_enabled_by_admin: 1 | 0;
    is_enabled_by_user: 1 | 0;
    password: string;
    port: string;
    username: string;
}

export interface IStatus {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    deleted_at?: null | string;
}

export interface ITxtRecord {
    key: string;
    value: string;
    record: string;
    values?: string[];
}

export interface IGetReport extends BaseEmailFilterRequest {
    get_reports?: boolean;
    with?: string;
}

export interface ISettings {
    id: number;
    user_id: number;
    domain_id: number;
    open_tracking: IOpenTracking;
    click_tracking: IOpenTracking;
    subscription_tracking: ISubscriptionTracking;
    meta?: any;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
}

export interface ISubscriptionTracking {
    html: string;
    enable: boolean;
}

export interface IOpenTracking {
    enable: boolean;
}

export interface IDedicatedIps {
    id: number;
    address: string;
    host: string;
    gateway: string;
    data_center: string;
    node_number: number;
    is_assigned: number;
    meta?: any;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
    pivot: IPivot;
}

export interface IPivot {
    domain_id: number;
    dedicated_ip_id: number;
    user_id: number;
}

export interface IPutDomainReqModel {
    title?: string;
    public_logo?: string;
    hostname_prefix?: string;
}

export interface IMailTypes {
    id: number;
    type: string;
    meta: any;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface ICname {
    current_value: string;
    hostname_prefix: string;
    record: string;
    value: string;
}
