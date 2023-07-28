export interface DidNumber {
    id: number;
    did_number?: string;
    flowType?: 'No Flow Assigned' | 'direct' | 'team' | 'divert' | 'flow';
    type?: 'No Flow Assigned' | 'direct' | 'team' | 'divert' | 'flow' | 'did-number' | 'toll-free' | 'mobile';
    directFlow?: { toEmployee: number; name?: string };
    teamFlow?: { toTeam: number; name?: string };
    divertFlow?: { toDidNumberId: number; name?: string };
    superFlow?: { toFlowId: number; name?: string };
    is_text_enabled?: boolean;
    assign_to?: number | null;
    assign_type?: string | null;
}
export interface Country {
    code: string;
    id: number;
    name: string;
    country_code: string;
}
export interface City {
    id: number;
    name: string;
}

export interface TollFreeNumber {
    is_text_enabled: boolean;
    id: number;
    toll_free_number: string;
}

export interface MobileNumber {
    is_text_enabled: boolean;
    id: number;
    mobile_number: string;
}

export interface NumbersAllResponse {
    did_numbers: DidNumber[];
    toll_free_numbers: TollFreeNumber[];
    mobile_numbers: MobileNumber[];
    Cities: City[];
    has_toll_free_numbers: boolean;
    has_mobile_numbers: boolean;
}
