export interface INumberIntegrations {
    id: number;
    client_name: string;
    inbound_setting: string;
    longcode_number: string;
    service_selected: string;
    callbacks: INumberCallback[];
}

export interface INumberCallback {
    callback_id?: number;
    keyword: string;
    webhook: string;
    header: {
        key: string;
        value: string;
    };
}

export interface INumberIntegrationsWithPagination<N> {
    data: N;
    page_count: number;
    total_integration_count: number;
}

export interface INumberAvailableLongCode {
    service_available: string[];
    inbound_setting: string[];
    available_longcode: IAvailableLongCode[];
    total_longcode_count: number;
}

export interface IAvailableLongCode {
    longcode_number: string;
    service_selected: string;
}

export interface ICreateDialPlanReq {
    dial_plan_name: string;
    currency: string;
    dial_plan_type: string;
}

export interface IUpdateDialPlanReq {
    price: string;
    pricing_id?: string;
}

export interface IDialPlanDropDown {
    currency: string[];
}

export interface GetAllDialPlans {
    currency: string;
    dial_plan_id: number;
    dial_plan_name: string;
    dial_plan_type: number;
}

export interface GetDialPlanDetails extends GetAllDialPlans {
    pricing_list: {
        pricing_id: number;
        price: number;
    }[];
}

export interface GetAllDialPlansResponse {
    current_page_dial_plan_count: number;
    dial_plans: Array<GetAllDialPlans>;
    total_dial_plan_count: number;
}

export interface VoiceServer {
    id: string;
    name: string;
}

export enum NumbersInboundSettings {
    HELLO = 'HELLO',
    CALLBACK = 'CALLBACK',
    BOTH = 'BOTH',
}

export enum NumbersServices {
    VOICE = 'VOICE',
    SMS = 'SMS',
    BOTH = 'BOTH',
}

export interface IGetAvailableLongCodeReq {
    service_selected?: string;
    page_size?: number;
    page_number?: number;
    longcode_number?: string;
}
