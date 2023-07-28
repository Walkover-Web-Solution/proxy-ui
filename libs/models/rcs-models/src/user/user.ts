//#region POST :: /rcs-user-creds/
export interface IUserCredsReqModel {
    company_id: number;
    user_rcs_creds: File;
}

//#endregion

//#region POST (response):: /rcs-user-creds/
export interface IUserCredsResModel {
    message: string;
    status: string;
}

//#endregion
