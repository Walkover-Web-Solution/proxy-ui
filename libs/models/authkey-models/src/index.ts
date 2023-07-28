export interface IGenerateAuthKeyReq {
    name: string;
    rule: number;
    ip: string[];
}

export interface IAuthKey {
    authkey: string;
}

export interface IEditAuthKeyReq extends IAuthKey {
    id?: string;
    name: string;
    rule: number;
    ip: string[];
    status: Status;
    ipSetting: IpSetting;
}

export interface IToggleAuthkeyIPSecurityReq extends IAuthKey {
    ipSetting: IpSetting;
}

export interface IToggleAuthkeyReq extends IAuthKey {
    id?: string;
    status: Status;
}

export interface IAddWhitelistIpReq {
    ip: string;
    logId?: string; // IN CASE OF WHITELISTING A “NON-WHITELISTED” IP
}

export interface IToggleCompanyIPSecurityReq {
    status: '1' | '0'; // (1 => 'Enabled', 0 => 'Disabled')
}

export interface IAuthKeyResData {
    data: IAuthKeyRes[];
    total_count: number;
}

export interface IAuthKeyRes {
    id: string;
    userid: string;
    authkey: string;
    panelid: string;
    status: {
        value: Status;
        name: string;
    };
    keyName: string;
    createdAt: string;
    created_by: string;
    ruleId: string;
    rule?: string;
    ipSetting: {
        value: IpSetting;
        name: string;
    };
    rule_name: string;
    IPcount: string;
    insertedIPs?: string[];
}

export interface IWhitelistedIPsResData {
    data: {
        id: number;
        ip: string;
    }[];
}

export interface INonWhitelistedIPsResData {
    data: {
        id: number;
        ip: string;
        dateTime: string;
    }[];
}

export interface IAuthenticationKeyActionDetailsRes {
    id: string;
    admin_id: string;
    updater_id: string;
    prev_val: IAuthKeyBaseStatus;
    curr_val: IAuthKeyBaseStatus;
    type: string;
    action_time: string;
    comment: string;
    row_identifier: string;
    user_name: string;
}

export interface IApiPageAccessValidation {
    redirectUrl: string;
    status: IAuthKeyBaseStatus;
}

export interface IAuthKeyBaseStatus {
    value: number;
    name: string;
}

export interface IIPSecurityStatus {
    status: IAuthKeyBaseStatus;
}

export enum IpSetting {
    Default = '0',
    Inactive = '3',
    Active = '5',
}

export enum Status {
    Enabled = '1',
    Disabled = '2',
}
