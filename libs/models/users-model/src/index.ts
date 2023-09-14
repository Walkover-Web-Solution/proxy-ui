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
