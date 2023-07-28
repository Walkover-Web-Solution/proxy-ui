export interface IGetUnsubscribeReqModel {
    id: string;
    email: string;
}

export interface IGetUnsubscribeResModel {
    recipient_email: string;
    sender_email: string;
    domain: IDomain;
    mail_types: IMailType[];
}

export interface IMailType {
    id: number;
    type: string;
    meta?: any;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
}

export interface IDomain {
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
    public_logo?: any;
    verification: IVerification;
    spf: IVerification;
    dkim: IVerification;
    mx: IMx;
    is_enabled: number;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
}

export interface IMx {
    key: string;
    record: string;
    values: string[];
    priority: number[];
    current_values: string[];
}

export interface IVerification {
    key: string;
    value: string;
    record: string;
    current_value: string;
}

export interface IAddUnsubscribeReqModel extends IGetUnsubscribeReqModel {
    mail_type_ids: number;
}

export interface IAddUnsubscribeResModel {
    message: string;
    recipient_email: string;
    domain: IDomain;
}
