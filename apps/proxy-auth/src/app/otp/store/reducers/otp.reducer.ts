import { Action, createReducer, on } from '@ngrx/store';
import { cloneDeep } from 'lodash-es';
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
    })
);
