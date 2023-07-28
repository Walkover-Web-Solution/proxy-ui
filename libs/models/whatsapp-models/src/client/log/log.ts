export interface IWhatsAppClientLogReqModel {
    receiver: string;
    from_date: Date;
    to_date: Date;
    status: string;
    failure_reason: string;
    page_number?: number;
    page_size?: number;
}

export interface IWhatsAppClientLogModel {
    sent_time: string;
    sender: number;
    receiver: string;
    message_type: string;
    status: string;
    failure_reason: string;
}

export interface IWhatsAppClientLogRespModel {
    log_count: number;
    log_data: IWhatsAppClientLogModel[];
}

// Failed Logs interface

export interface IFailedLogs {
    id: string;
    content: Record<string, string>;
    customer_number: string;
    whatsapp_number: string;
    failure_reason: string;
    message_type: string;
    sent_time: string;
}

export interface IFailedLogResponse {
    total_log_count: number;
    current_page_log_count: number;
    log_data: Array<IFailedLogs>;
}
