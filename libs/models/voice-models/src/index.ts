export * from './dial-plan';
export * from './flow';

// Dashboard Models
export interface INotPermanent {
    key: string;
}

export interface IAdminVoiceDashboardAcdAsrResModel {
    asr: number;
    acd: number;
    call_count: number;
    queued: number;
}

// Files Models
export interface IAdminVoiceFilesResponseModel {
    id: number;
    name: string;
    content: string;
    version_id: number;
    version: number;
    status: string;
    created_at: string;
    showContent: string;
}

export interface IAdminVoiceFileRequestModel {
    name?: string;
    from?: string;
    to?: string;
    page_size?: number;
    page_num?: number;
}

// Reports Models
export interface IAdminVoiceReportResModel {
    id: number;
    start_time: string;
    end_time: string;
    source: number;
    caller_id: number;
    destination: number;
    connect_type: string;
    duration: number;
    billing_duration: number;
    disconnect_code: string;
    disconnected_by: string;
    rate: string;
    billing: string;
    charged: string;
    country: string;
    network: string;
    type: string;
    direction: string;
    did: string;
    server: string;
    company_id: number;
    vendor_billing: string;
    vendor_charged: string;
    vendor_rate: string;
    trunk: string;
}

export interface IAdminVoicePaginatedReportResModel {
    data: IAdminVoiceReportResModel[];
    page_size: number;
    page_num: number;
    count: number;
}

// Template Models
export interface IAdminVoiceTemplatesResponseModel {
    id: number;
    name: string;
    structural: IStructure[];
}

export interface IStructure {
    type: string;
    value: number;
}

export interface IAdminVoiceTemplateRequestModel {
    name?: string;
    page_size?: number;
    page_num?: number;
}

// Dial Plan Models
export interface VoiceDialPlan {
    id: number;
    name: string;
    currency: string;
    direction?: string;
}
export interface VendorDialPlan extends VoiceDialPlan {
    location: string;
}
export interface UserDialPlan extends VoiceDialPlan {}

export interface VoiceDialPlanPagination {
    page_size: number;
    page_num: number;
    count: number;
}
export interface VoiceDidNumber {
    id: number;
    number: string;
    dialplan_id: number;
    subscription_id: number;
}
export interface VoiceDialPlanCurrency {
    id: number;
    name: string;
    short_name: string;
    slug: string;
}
export interface CreateVoiceDialPlanReq {
    name: string;
    currency: string;
}
export interface CreateUserDialPlanReq extends CreateVoiceDialPlanReq {}

export interface CreateVendorDialPlanReq extends CreateVoiceDialPlanReq {
    location: string;
}
export interface CreateUserDialPlanResponse extends CreateVoiceDialPlanReq {
    id: number;
}
export interface CreateVendorDialPlanResponse extends CreateVoiceDialPlanReq {
    location: string;
    id: number;
}

export type VoiceDialPlanData<Type> = {
    [Property in keyof Type]: Type[Property];
};
export type VoiceDialPlanApiData = { data: VendorDialPlan[] | UserDialPlan[] };

export type VoiceDidApiData = { data: VoiceDidNumber[] };

export type VoiceDialPlanResponse = VoiceDialPlanData<VoiceDialPlanPagination & VoiceDialPlanApiData>;

export type VoiceDidNumberResponse = VoiceDialPlanData<VoiceDialPlanPagination & VoiceDidApiData>;

export interface VoiceDialPlanDetailsResponse {
    id: number;
    country: string;
    network: string;
    prefix: string;
    billing: string;
    rate: number;
    vendor_id?: number;
}
export interface DialPlanDetailsDataResponse {
    id: number;
    name: string;
    rates: Array<VoiceDialPlanDetailsResponse & { isEdit: boolean }>;
}
export type VoiceDialPlanDetailsApiData = { data: DialPlanDetailsDataResponse };

export type VoiceDialPlanDetailsApiResponse = VoiceDialPlanData<VoiceDialPlanPagination & VoiceDialPlanDetailsApiData>;

// Files Models
export interface IFileResponseModel {
    id: number;
    name: string;
    is_active: boolean;
    active_version_id: number | null;
    created_at: string;
    updated_at: string;
    versions: IVersion[];
    version?: number;
}

export interface IVersion {
    id: number;
    status: string;
    version: number;
    created_at: string;
    updated_at: string;
}

export interface ISpeechToTextResponseModel {
    Name: string;
    'BCP-47': string;
    Model: string;
}

export interface ITextToSpeechResponseModel {
    language: string;
    language_code: string;
    voice_name: string;
    ssml_gender: string;
}

export interface IRecordFileFromPhoneReqModel {
    name: string;
    voice_name: string;
    type: string;
}

export interface IRecordFileVersionFromPhoneReqModel {
    voice_name: string;
    type: string;
}

export interface IRecordFileVersionFromPhoneRequestModel {
    request: IRecordFileVersionFromPhoneReqModel;
    fileId: number;
}

// Flow Models
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
    variables?: { [key: string]: string };
}

export interface AudioFile {
    id: number;
    filename: string;
    file_length: number;
    duration?: string | number;
}

// Reports Models
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
}

export interface AudioFile {
    id: number;
    filename: string;
    file_length: number;
    duration?: string | number;
}

export interface IPaginatedVoiceResponse<P> {
    data: P;
    page_size: number;
    page_num: number;
    count: number;
}

export interface IPaginationVoiceResponse<p> {
    data: p;
    page_size: number;
    page_num: number;
    count: number;
}

export enum IncomingCallPreference {
    Off = 0,
    Web = 1,
    Phone = 2,
    WebAndPhone = 3,
}

export enum VoiceDialPlanDirections {
    Inbound = 'inbound',
    Outbound = 'outbound',
}

export enum VoiceDialPlanTypes {
    User = 'user',
    Vendor = 'vendor',
}
export interface IVoiceReportResModel {
    id: number;
    start_time: string;
    end_time: string;
    source: number;
    caller_id: number;
    destination: number;
    connect_type: string;
    duration: number;
    billing_duration: number;
    disconnect_code: string;
    disconnected_by: string;
    rate: string;
    billing: string;
    charged: string;
    country: string;
    network: string;
    type: string;
    direction: string;
    agent_id?: number;
    connected_to?: string;
}

export interface IVoicePaginatedReportResModel {
    data: IVoiceReportResModel[];
    page_size: number;
    page_num: number;
    count: number;
}
