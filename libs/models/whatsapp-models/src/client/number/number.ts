export interface IWhatsAppNumberResModel {
    id: number;
    whatsapp_number: string;
    team_id: string;
    inbound_setting: string;
    status: string;
    webhook?: string;
    whatsapp_number_id?: string;
    permanent_access_token?: string;
    whatsapp_business_account_id?: string;
    vendor_id?: number;
    assign_subscription?: boolean;
}
export interface IWhatsAppReqModel {
    request: IWhatsAppUpdateReqModel;
    id?: number;
}

export interface IWhatsAppUpdateReqModel {
    team_id: number | string;
    inbound_setting: string;
    webhook?: string;
    whatsapp_number?: string;
    header?: any;
}

export interface IWhatsAppHelloTeamResModel {
    name: string;
    official_numbers: unknown;
    team_id: number;
    agent: IWhatsAppHelloAgentResModel;
}

export interface IWhatsAppHelloAgentResModel {
    id: number;
    name: string;
    number: string;
}

export interface IWhatsappProfileResModel {
    address: string;
    email: string;
    description: string;
    websites: string[];
    vertical: string;
    about: string;
    profile_pic_url: string;
}

export interface IClientLogDropdown {
    delivery_report: string[];
    direction: string[];
    numbers: string[];
    timezone_list: string[];
    usage_type: string[];
}

export interface IClientNumberDropdown {
    inbound_setting: string[];
    vertical: string[];
}

export interface AssignFreePlanReq {
    panel_user_id: number;
    microservice: string;
    integrated_no: string;
}
