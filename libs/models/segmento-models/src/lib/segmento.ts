/* eslint-disable @typescript-eslint/interface-name-prefix */
export interface IGetAllSegmentsResModel {
    id: number;
    name: string;
    count: number;
}

export interface IGetAllPhoneBookResModel {
    created_at: string;
    id: string | number;
    is_deleted: string | null;
    deleted_at: string;
    permanently_deleted_on: string;
    name: string;
    company_id: string;
    idEditEnable?: boolean;
    is_contact_exists?: boolean;
}

export interface ISegmentGetAllCampaignReqModel {
    name?: string;
    is_active?: number;
    [key: string]: any;
}

export interface ICreatePhoneBookReqModel {
    name: string;
}

export interface UpdatePhoneBookResModel {
    message: string;
    phonebook: ISegmentGetAllCampaignReqModel;
}

export interface IGetAllInboxResModel {
    inboxes_list: IInboxData[];
}

export interface IInboxData {
    id: string;
    name: string;
}

export interface ISegmentoRegisterData {
    authkey: string;
    default_phonebook: IGetAllPhoneBookResModel;
    ref_id: string;
}
