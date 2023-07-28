export interface ILogReqModel {
    receiver: string;
    from_date: Date;
    to_date: Date;
    status: string;
    failure_reason: string;
    page_number?: number;
    page_size?: number;
    direction?: string;
    whatsapp_number?: string;
    customer_number?: string;
    order_type?: string;
    order_by?: string;
    time_zone?: string;
    usage_type?: string;
    client_name?: string;
    request_id?: string;
}

export interface ILogModel {
    id: string;
    sent_time: string;
    sender: number;
    receiver: string;
    message_type: string;
    status: string;
    failure_reason: string;
    direction: string;
    customer_number?: string | number;
    company_id?: number;
}

export interface ILogRespModel {
    log_count: number;
    log_data: ILogModel[];
    total_log_count: string | number;
}
