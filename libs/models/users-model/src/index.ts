export interface IUser {
    id: number;
    name: string;
    mobile: any;
    email: string;
    client_id: number;
    meta: any;
    created_at: string;
    updated_at: string;
}

export interface IUserReq {
    search: string;
    startDate: string;
    endDate: string;
}

export interface IClientData {
    id: number;
    name: string;
    mobile: string;
    email: string;
    url_unique_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    stage: string;
    setttings: any;
}
