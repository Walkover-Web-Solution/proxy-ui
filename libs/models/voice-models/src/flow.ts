import { IGetCampaignLogsGroupedByPluginSource } from '@msg91/models/campaign-models';

export interface FlowStyle {
    x: number;
    y: number;
    width: number;
}

export interface Flow {
    module_type: string;
    id: number;
    name: string;
    style: FlowStyle;
    module_data: any;
    modules: any;
    slug?: string;
    token?: { name: string; token: string };
    is_complete?: boolean;
}

export interface ICampaignList extends Flow {
    expanded?: boolean;
    innerLogsExpanded?: boolean;
    logs?: Array<IGetCampaignLogsGroupedByPluginSource>;
    csvLogs?: Array<any>;
}

export interface AudioFile {
    id: number;
    filename: string;
    file_length: number;
    duration?: string | number;
}

export interface VoiceLibraryResponseModel {
    icon: string;
    name: string;
    value: string;
    is_enabled: boolean;
}

export interface FlowListResponseModel {
    id: number;
    name: string;
}

export interface IFlowCallerIDResponseModel {
    count: number;
    page_num: number;
    page_size: number;
    data: IFlowCallerIDModel[];
    show_no_caller_id?: boolean;
}

export interface IFlowCallerIDModel {
    assign_to: number;
    assign_type: string;
    did_number: string;
    id: number;
    server_id: number;
}

export interface IPluginSourceModel {
    created_at: string;
    icon: string;
    id: number;
    name: string;
    source: string;
    updated_at: string;
}
