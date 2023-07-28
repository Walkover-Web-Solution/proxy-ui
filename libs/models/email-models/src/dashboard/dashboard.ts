export interface IDashboardReqModel {
    domain_id: string;
    from_date_time: string;
    to_date_time: string;
    mail_type_id?: number;
}

export interface IDashboardRespModel {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    delivery_status_count: number;
}

export interface IGraphData {
    labels: string[];
    data: IEventData;
}

export interface IEventData {
    [key: string]: number[];
}
