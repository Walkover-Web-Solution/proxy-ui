import { BaseFilterRequest } from '@msg91/models/root-models';

export interface IUserSetting {
    id: number;
    userName: string;
    email: string;
    mobileNo: string;
    firstName: string;
    lastName: string;
    alternateContact: string;
    adminPanelLink: string;
}

export interface IVerifyUserNameModel {
    userId: number;
    userName: string;
}

export interface IChangePasswordModel {
    newPass: string;
    newPass2: string;
}

export interface IGetUserLoginHistoryReqModel extends BaseFilterRequest {
    usedId: number;
}

export interface IBlockedIp {
    id: string;
    ip: string;
    isUnBlockInProgress?: boolean;
}

export interface IUnBlockedIpReq {
    ip: string;
}

export interface IUnBlockedIpResp {
    msg: string;
    msg_type: string;
}

export interface IGetUserLoginHistoryRespModel {
    id: number;
    date: Date;
    ip: string;
    browser: string;
    login_method: string;
    isSuspicious: boolean;
}

export interface IUserSideMenuModel {
    href: string;
    name: string;
}

export interface IUserSideMenuVM extends IUserSideMenuModel {
    url: string;
    hasHash: boolean;
    isAngularRoute: boolean;
}

export interface IUpdateUserMobileReq {
    act: UpdateNumberActionEnum;
    otp?: string;
    newMobileNo?: number;
}

export interface IUpdateUserMobileResp {
    msgType: string;
    msg: string;
}

export interface IAccount {
    id: string;
    name: string;
    uniqueName: string;
}

export interface ICurrentAccount {
    id: string;
    name: string;
    uniqueName: string;
    type: string;
    prv: string[];
    billingCompanyName: string;
    email: string;
}

export enum UpdateNumberActionEnum {
    CONFIRM_NUMBER = 1,
    SEND_OTP_TO_OLD_NUMBER,
    RESEND_OTP,
    VERIFY_OTP,
    SEND_OTP_TO_NEW_NUMBER,
    VERIFY_OTP_AND_UPDATE_NUMBER,
}

export interface ITimezone {
    GMT: string;
    name: string;
}

export interface IForgotPasswordReqModel {
    act: number;
    otp?: number;
    newPass?: string;
}

export interface IForgotPasswordResModel {
    msgType: string;
    msg: string;
    actId?: number;
}

export interface IBalanceRoute {
    route_name: string;
    balance: string;
}

export type IRcsStatus = null | 'pending' | 'in review' | 'integrated';
