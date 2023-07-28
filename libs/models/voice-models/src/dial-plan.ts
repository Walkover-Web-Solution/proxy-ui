export interface VoiceDialPlan {
    id: number;
    name: string;
    currency: string;
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
    direction?: string;
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
export type VoiceDidNumberAndDialPlanAssignmentApiData = { data: VoiceDidNumberAndDialPlanAssignment[] };
export type VoiceDialPlanResponse = VoiceDialPlanData<VoiceDialPlanPagination & VoiceDialPlanApiData>;
export type VoiceDidNumberResponse = VoiceDialPlanData<VoiceDialPlanPagination & VoiceDidApiData>;
export type VoiceDidNumberAndDialPlanAssignmentResponse = VoiceDialPlanData<
    VoiceDialPlanPagination & VoiceDidNumberAndDialPlanAssignmentApiData
>;

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

export interface VoiceDidNumberAndDialPlanAssignment {
    company_id: number;
    did_number: string;
    did_number_id: number;
    dialplan_id: number;
    dialplan_name: string;
    currency_code: string;
    isEdit?: boolean;
}
