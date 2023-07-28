export interface ITelegramAdminClientResponse {
    client_data: ITelegramAdminClient[];
    current_page_client_count: number;
    total_client_count: number;
}

export interface ITelegramAdminClient {
    id: number;
    company_id: number;
    bot_id: number;
    bot_username: string;
    mobile_number: number;
    status: 'active' | 'inactive';
    last_seen: string;
    statusValue?: boolean;
}

export interface ITelegramAdminClientUpdateReq {
    company_id: number;
    status: 'active' | 'inactive';
}

export interface ITelegramClientIntegrationReq {
    mobile_number: string;
    access_token: string;
    inbound_setting: string;
    webhook?: string;
}
export interface ITelegramClientQRIntegrationReq {
    mobile_number: string;
    bot_name: string;
    inbound_setting: string;
    webhook?: string;
}

export interface ITelegramClientIntegrationDataRes {
    integrations: IIntegrationsData[];
    total_integration_count: number;
}

export interface IIntegrationsData {
    id: number;
    bot_id: number;
    bot_username: string;
    inbound_setting: string;
    status: string;
    webhook: string;
}
export interface ITelegramUpdateReq {
    inbound_setting: string;
    webhook?: string;
    status?: 'active' | 'inactive';
}

export interface IQrIntegrateBotRes {
    integration_uuid: string;
    message: string;
}
