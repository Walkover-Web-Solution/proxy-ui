export enum UserManagementTab {
    Members = 'members',
    Roles = 'roles',
    Permissions = 'permissions',
}

export type CreateMutable<Type> = {
    -readonly [Property in keyof Type]?: Type[Property];
};

export interface OtpResModel {
    request_id: string;
    type: 'success' | 'error';
    message?: string;
    request?: any;
}

export interface IWidgetResponse {
    ciphered: string;
}

export interface IGetWidgetData {
    referenceId: string;
}

export interface IGetOtpRes {
    reqId: string;
}

export interface ISendOtpReq {
    referenceId?: string;
    identifier?: string;
    mobile?: string;
    origin?: string;
    variables?: any;
    authToken?: string;
    useRetry?: boolean;
}

export interface IRetryOtpReq extends ISendOtpReq {
    reqId: string;
}

export interface IVerifyOtpV2Req {
    referenceId?: string;
    identifier?: string;
    mobile?: string;
    otp: string;
    origin?: string;
    authToken?: string;
}

export interface IRegisterReq {
    proxy_state?: string;
    state?: string;
    email_verification_token?: string;
    mobile_verification_token?: string;
}

export interface IVerifyOtpReq {
    tokenAuth: string;
    widgetId: string;
    otp: string;
    reqId: string;
}
export interface IlogInData {
    state: string;
    user: string;
    password: string;
    hCaptchaToken?: string;
}
export interface IResetPassword {
    state: string;
    user: string;
}
export interface IOtpData {
    state: string;
    user: string;
    password: string;
    otp: number;
}
export interface UserData {
    userId: string;
    name: string;
    email: string;
    mobileNumber?: string;
    role: string;
    permissions: string[];
    additionalpermissions?: string[];
}

export interface Role {
    id: number;
    name: string;
    is_default: boolean;
    feature_configuration_id: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
