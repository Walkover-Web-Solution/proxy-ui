import { BaseEmailFilterRequest } from '@msg91/models/root-models';

export interface ISupressionReqModel extends BaseEmailFilterRequest {
    event_id: number;
    domain_id: number;
    with?: string;
}

export interface ISupressionRespModel {
    id: number;
    user_id: number;
    domain_id: number;
    recipient_id: number;
    outbound_email_id: number;
    event_id: number;
    opened: number;
    clicked: number;
    reason: string;
    meta: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    event: Event;
    recipient: Recipient;
}

export interface Recipient {
    id: number;
    email: string;
    meta: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface Event {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface IDateTime {
    start: Date;
    end: Date;
}

export interface IUnsubscribeReqModel {
    ids: number[];
}

export interface IRecipentsDeleteReqModel {
    domain_id: number;
    event_id: number;
    ids: { recipient_id: number | string; mail_type_id?: number }[];
}

export interface IUnsubscribeResModel {
    deleted_records_count: number;
}

export interface IUnsubscribeDataReqModel extends BaseEmailFilterRequest {
    domain_id: number;
    with?: string;
    event_id?: number;
    email?: string;
}

export interface IUnsubscribesDataReqModel {
    id: number;
    user_id: number;
    recipient_id: number;
    domain_id: number;
    mail_type_id: number;
    meta?: any;
    account_id?: number | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    recipient: IUnsubscribesRecipient;
    mail_type: IUnsubscribesMailType;
    is_added_by_user?: 1 | 0;
    reasonMessage: string;
    event_id?: number;
}

interface IUnsubscribesMailType {
    id: number;
    type: string;
    meta?: unknown;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface IUnsubscribesRecipient {
    id: number;
    email: string;
    meta?: unknown;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface IExportSupressionResModel {
    parameters: {
        from_date_time: string;
        to_date_time: string;
        domain_id: number;
    };
    user_id: number;
    updated_at: string;
    created_at: string;
    id: number;
}

export interface SelectedSectionIndex {
    type: 0 | 1 | 2;
}

export interface IConvertedDateTime {
    from_date_time: string;
    to_date_time: string;
}

export interface IAddRecipientReq {
    email: string;
    domain_id: number;
    event_id: number;
    mail_type_ids?: number[];
}

export interface IAddCSVRecipientReq {
    csv_file: any;
    domain_id: number;
    event_id: number;
}
