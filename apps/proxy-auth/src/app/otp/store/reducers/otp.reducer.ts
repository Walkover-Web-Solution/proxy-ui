import { Action, createReducer, on } from '@ngrx/store';
import { cloneDeep, flatMap } from 'lodash-es';
import { IGetOtpRes, IWidgetResponse } from '../../model/otp';
import * as otpActions from '../actions/otp.action';
export interface IOtpState {
    errors: string[];

    otpGenerateData: IGetOtpRes;
    getOtpInProcess: boolean;
    getOtpSuccess: boolean;

    resendOtpInProcess: boolean;
    resendOtpSuccess: boolean;

    verifyOtpData: any;
    verifyOtpInProcess: boolean;
    verifyOtpSuccess: boolean;

    resendCount: number;
    apiErrorResponse: any;
    closeWidgetApiFailed: boolean;

    widgetData: any;

    userProfileData: any;
    userProfileDataInProcess: boolean;
    userDetailsSuccess: boolean;

    leaveCompanyData: any;
    leaveCompanyDataInProcess: boolean;
    leaveCompanySuccess: boolean;
}

export const initialState: IOtpState = {
    errors: null,

    otpGenerateData: null,
    getOtpInProcess: false,
    getOtpSuccess: false,

    resendOtpInProcess: false,
    resendOtpSuccess: false,

    verifyOtpData: null,
    verifyOtpInProcess: false,
    verifyOtpSuccess: false,

    resendCount: 0,
    apiErrorResponse: null,
    closeWidgetApiFailed: false,

    widgetData: null,
    userProfileData: null,
    userProfileDataInProcess: false,
    userDetailsSuccess: false,

    leaveCompanyData: null,
    leaveCompanyDataInProcess: false,
    leaveCompanySuccess: false,
};

export function otpReducer(state: IOtpState, action: Action) {
    return _otpReducer(state, action);
}

const _otpReducer = createReducer(
    initialState,
    on(otpActions.resetAnyState, (state, { request }) => {
        return {
            ...state,
            ...request,
        };
    }),
    on(otpActions.resetAll, (state) => {
        return {
            ...state,
            ...initialState,
        };
    }),

    on(otpActions.sendOtpAction, (state, { request }) => {
        return {
            ...state,
            getOtpInProcess: true,
            getOtpSuccess: false,
            errors: null,
        };
    }),
    on(otpActions.sendOtpActionComplete, (state, { response }) => {
        return {
            ...state,
            otpGenerateData: {
                reqId: response.message,
            },
            getOtpInProcess: false,
            getOtpSuccess: true,
        };
    }),
    on(otpActions.sendOtpActionError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            getOtpInProcess: false,
            getOtpSuccess: false,
            errors: errors,
            apiErrorResponse: errorResponse,
        };
    }),

    on(otpActions.getOtpResendAction, (state, { request }) => {
        return {
            ...state,
            resendOtpInProcess: true,
            resendOtpSuccess: false,
            errors: null,
        };
    }),
    on(otpActions.getOtpResendActionComplete, (state, { response }) => {
        let oldResendCount = cloneDeep(state.resendCount);
        oldResendCount += 1;
        return {
            ...state,
            resendOtpInProcess: false,
            resendOtpSuccess: true,
            resendCount: oldResendCount,
        };
    }),
    on(otpActions.getOtpResendActionError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            resendOtpInProcess: false,
            resendOtpSuccess: false,
            errors: errors,
            apiErrorResponse: errorResponse,
        };
    }),

    on(otpActions.getOtpVerifyAction, (state, { request }) => {
        return {
            ...state,
            verifyOtpData: null,
            verifyOtpInProcess: true,
            verifyOtpSuccess: false,
            errors: null,
            apiErrorResponse: null,
        };
    }),
    on(otpActions.getOtpVerifyActionComplete, (state, { response }) => {
        return {
            ...state,
            verifyOtpData: response,
            verifyOtpInProcess: false,
            verifyOtpSuccess: true,
        };
    }),
    on(otpActions.getOtpVerifyActionError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            verifyOtpData: null,
            verifyOtpInProcess: false,
            verifyOtpSuccess: false,
            errors: errors,
            apiErrorResponse: errorResponse,
        };
    }),
    on(otpActions.getWidgetData, (state) => {
        return {
            ...state,
            widgetDataInProcess: true,
            widgetDataSuccess: false,
            errors: null,
            closeWidgetApiFailed: false,
        };
    }),
    on(otpActions.getWidgetDataComplete, (state, { response }) => {
        return {
            ...state,
            widgetData: response,
            widgetDataInProcess: false,
            widgetDataSuccess: true,
            closeWidgetApiFailed: false,
        };
    }),
    on(otpActions.getWidgetDataError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            widgetDataInProcess: false,
            widgetDataSuccess: false,
            errors: errors,
            apiErrorResponse: errorResponse,
            closeWidgetApiFailed: true,
        };
    }),
    on(otpActions.getUserDetails, (state, { request }) => {
        return {
            ...state,
            userProfileDataInProcess: true,
            userDetailsSuccess: false,
            errors: null,
        };
    }),
    on(otpActions.getUserDetailsComplete, (state, { response }) => {
        return {
            ...state,
            userProfileDataInProcess: false,
            userDetailsSuccess: true,
            userProfileData: response,
        };
    }),
    on(otpActions.getUserDetailsError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            userProfileDataInProcess: false,
            userDetailsSuccess: false,
            errors: errors,
            apiErrorResponse: errorResponse,
        };
    }),

    on(otpActions.leaveCompany, (state, { companyId }) => {
        return {
            ...state,
            leaveCompanyDataInProcess: true,
            leaveCompanySuccess: false,
            errors: null,
        };
    }),
    on(otpActions.leaveCompanyComplete, (state, { response }) => {
        return {
            ...state,
            leaveCompanyDataInProcess: false,
            leaveCompanySuccess: true,
            leaveCompanyData: response,
        };
    }),
    on(otpActions.leaveCompanyError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            leaveCompanyDataInProcess: false,
            leaveCompanySuccess: false,
            errors: errors,
            apiErrorResponse: errorResponse,
        };
    })
);
