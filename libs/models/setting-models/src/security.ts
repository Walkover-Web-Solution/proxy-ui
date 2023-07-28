import { FormControl } from '@angular/forms';

export interface IBlockUnblockCountryReqModel {
    country_code: string;
    block?: string;
    price?: string;
}

export interface ISaveBlockedByPriceReqModel {
    price: string;
}

export interface ICountriesResModel {
    code: string;
    name: string;
    block: string;
    price?: string;
    priceForm?: FormControl;
}

export interface IAppPermissionStatus {
    MicroserviceId: number;
    MicroserviceName: string;
    permissions: IAppPermissions[];
}

export interface IAppPermissions {
    permissionName: string;
    permissionValues: IAppPermissionValue[];
    permissionId: string;
    permissionDisplayName: string;
}

export interface IAppPermissionValue {
    permissionId: number;
    permissionType: string;
}

export interface IRule {
    ruleId: number;
    ruleName: string;
    microservices: string[];
}

export interface IRuleRes {
    microservices: IRuleResMicroservices[];
    ruleId: number;
    ruleName: string;
}

export interface IRuleResMicroservices {
    microserviceId: number;
    permission: IRuleResPermissions[];
}

export interface IRuleResPermissions {
    permissionId: string;
    value: string;
}

export interface IUserLoginHistory {
    browser: string;
    time: string;
    ip: string;
    tag: string;
}

export interface IUserChangeStatusReq {
    userId: string;
    status?: 0 | 1;
    reassign_client?: any;
}

export interface ISecurityUser {
    id: string;
    name: string;
    username: string;
    rule: { ruleName: string; ruleId: string };
    inviteStatus: { value: string; name: string };
    lastLogin: string;
    userStatus: { value: string; name: string };
    ip: string[];
    mobile?: string;
}

export interface IInviteUserReq {
    email: string;
    rule: number;
    ip: string[];
    verify_user?: 0 | 1;
}
export interface IGenerateOtpReq {
    member_name: string;
    member_email: string;
    member_phone: string;
    member_country_code: string;
}
export interface IVerifyOtp {
    member_email: string;
    email_otp: string;
    mobile_otp: string;
}

export interface ISecurityUserUpdateReq {
    userId: string;
    rule: number;
    ip: string[];
}

export interface ISecurityIP {
    ip: string;
    users: string;
}

export interface ISecurityNotAddedIP {
    ip: string;
    dateTime: string;
    id: string;
}
