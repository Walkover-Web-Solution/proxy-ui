import { IEmailMx, IEmailVerification } from '../domain/domain';

export interface IIDomainModel {
    key: string;
}

export interface IEmailUsedIpReqModel extends IPaginatedReqModel {
    with: string;
}

export interface IUsedIpsResModel {
    dedicated_ip_id: number;
    domain_id: number;
    user_id: number;
    dedicated_ip: IDedicatedIp;
    domain: Domain;
    user: User;
}

export interface User {
    id: number;
    name: string;
    email: string;
    firebase_uid?: any;
    firebase_token?: any;
    panel_user_id?: any;
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

export interface Domain {
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
}

export interface IDedicatedIp {
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
    deleted_at?: string | null;
}

export interface IPaginatedReqModel {
    page?: number;
    per_page?: number;
}
