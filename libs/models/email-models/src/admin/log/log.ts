import { IEmailMx, IEmailVerification } from '../domain/domain';

export interface IEmailGetAllLogsReqModel {
    with: string;
    event_id: string;
}

export interface IAdminGetAllLogsResModel {
    id: number;
    user_id: number;
    domain_id: number;
    recipient_id: number;
    outbound_email_id: number;
    event_id: number;
    opened: number;
    clicked: number;
    reason: string;
    meta: IMeta;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    domain: IAdminDomain;
    event: IEvent;
    recipient: IRecipient;
    spamScore: number;
}

export interface IRecipient {
    id: number;
    email: string;
    meta?: unknown;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface IEvent {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface IAdminDomain {
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
    deleted_at?: any;
}

export interface IMeta {
    code: number;
    state: string;
    reason: string[];
    enhanced: number[];
    spamScores: any;
}
