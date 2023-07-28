import { BaseEmailFilterRequest } from '@msg91/models/root-models';

export interface IParamLogReqModel {
    per_page: number;
    order_by: string;
    order_type: string;
    group_by?: string;
    domain_id: number;
    page?: number;
    event_id?: number;
    sender?: string;
    from_date_time?: string;
    to_date_time?: string;
}

export interface IEmailLogRespModel {
    id: number;
    user_id: number;
    domain_id: number;
    thread_id: number;
    to: To[];
    from: To;
    subject: string;
    body: Body | string;
    cc: any[];
    bcc: any[];
    headers?: any;
    reply_to?: any;
    in_reply_to?: any;
    message_id: string;
    references?: any;
    attachments: null | Attachment[];
    meta?: any;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
    toString?: string;
}

export interface Attachment {
    name: string;
    path: string;
    extension: string;
}

export interface Body {
    data: string;
    type: string;
}

export interface To {
    name: string;
    email: string;
}

export interface IPageLogReqModel extends IParamLogReqModel {
    page: number;
}

export interface IParamDeliveryStatusLogReqModel extends BaseEmailFilterRequest {
    group_by?: string;
    domain_id: number;
    with?: string;
}

export interface Header {
    host: string[];
    'user-agent': string[];
    'content-type': string[];
    'content-length': string[];
    'accept-encoding': string[];
    'x-forwarded-for': string[];
    'x-forwarded-port': string[];
}

export interface MetaVM {
    header: Header;
    code?: number;
    state: string;
    reason: string[];
    enhanced: number[];
    spamScores: any;
}

export interface EventVM {
    id: number;
    title: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
}

export interface RecipientVM {
    id: number;
    email: string;
    meta?: any;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
}

// export interface EmailStatus {
//     id: number;
//     user_id: number;
//     domain_id: number;
//     recipient_id: number;
//     outbound_email_id: number;
//     event_id: number;
//     opened: number;
//     clicked: number;
//     reason?: any;
//     meta: MetaVM;
//     created_at: Date;
//     updated_at: Date;
//     deleted_at?: any;
//     event: EventVM;
//     recipient: RecipientVM;
//     spamScore?: number;
// }

export interface EmailStatus {
    isSmtp: 0 | 1;
    createdAt: string;
    requestId: string;
    subject: string;
    domain: string;
    senderEmail: string;
    recipientEmail: string;
    templateSlug: string;
    mailType: string;
    status: string;
    statusUpdatedAt: string;
    description: string;
    spamScore: any;
    vbls: any;
    sendTo: string | Array<any>;
    cc: string | Array<any>;
    bcc: string | Array<any>;
    attc: string | Array<any>;
    calculatedSpamScore?: number;
    timeline: Array<string>;
}

export interface IEmailOutboundResModel extends IEmailLogRespModel {
    variables: string[] | [];
}

export interface IEmailLog {
    createdAt: string;
    requestId: string;
    subject: string;
    domain: string;
    senderEmail: string;
    recipientEmail: string;
    templateSlug: string;
    mailType: string;
    status: string;
    statusUpdatedAt: string;
    description: string;
}

export interface IEmailLogMetaData {
    datasetId: string;
    tableId: string;
    stats: {
        processedBytes: string;
        billedBytes: string;
        cacheHit: boolean;
    };
    paginationToken: string;
}

export interface IEmailLogsResponse {
    data: Array<IEmailLog>;
    metadata: IEmailLogMetaData;
}

export interface ExportEmailLogsRequest {
    startDate?: string;
    endDate?: string;
    isSmtp?: string;
    eventId?: string;
    fields?: string;
    email?: string;
    senderEmail?: string;
    recipientEmail?: string;
    mailTypeId?: string;
}
export interface PreviewDataReq {
    template_version_id: number;
    variables: { [key: string]: any };
}
