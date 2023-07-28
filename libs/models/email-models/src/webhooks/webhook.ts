// export type IGetAllDomainReqModel = BaseFilterRequest;

export interface IWebhookReqModel {
    method: string;
    url: string;
    event: string;
    headers?: IHeaders;
}

export interface IAddWebhookRespModel {
    id: number;
    user_id: number;
    method: string;
    url: string;
    event: string;
    headers?: any;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
}

export interface IHeaders {
    key: string;
    value: string;
}

export interface IDomainModdel {
    key: string;
}

export interface IEmailWebhookReqModel {
    with?: string;
    page?: number;
    per_page?: number;
    order_by?: string;
    order_type?: 'DESC' | 'ASC';
    keyword?: string;
}

export interface IGetAllWebhooksResModel {
    id: number;
    user_id: number;
    method: string;
    url: string;
    event: string;
    headers: IHeaders[];
    created_at: string;
    updated_at: string;
    deleted_at?: any;
}

export interface IUpdateWebhookReqModel {
    method: string;
    url: string;
    event: string;
}

export interface IUpdateWebhookResModel {
    [key: string]: string;
}
