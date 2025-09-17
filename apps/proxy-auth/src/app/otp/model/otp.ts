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
    referenceId: string;
    variables?: any;
    authkey?: string;
}

export interface IRetryOtpReq extends ISendOtpReq {
    reqId: string;
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
