import { Action, createReducer, on } from '@ngrx/store';
import { IFirebaseUserModel } from '@proxy/models/root-models';
import * as logInActions from '../actions/login.action';

export interface ILogInState {
    errors: string[];

    logInData: IFirebaseUserModel;
    // accessToken: string;
    logInInProcess: boolean;
    logInSuccess: boolean;

    logOutInProcess: boolean;
    logOutSuccess: boolean;
}

export const initialState: ILogInState = {
    errors: null,

    logInData: null,
    // accessToken: null,
    logInInProcess: false,
    logInSuccess: false,

    logOutInProcess: false,
    logOutSuccess: false,
};

export function loginReducer(state: ILogInState, action: Action) {
    return _loginReducer(state, action);
}

const _loginReducer = createReducer(
    initialState,
    on(logInActions.logInAction, (state) => {
        return {
            ...state,
            // logInData: null,
            logInInProcess: true,
            logInSuccess: false,
            errors: [],
        };
    }),
    on(logInActions.logInActionComplete, (state) => {
        return {
            ...state,
            // logInData:response,
            logInInProcess: true,
            logInSuccess: false,
            errors: [],
        };
    }),
    on(logInActions.logInActionError, (state, { errors }) => {
        return {
            ...state,
            logInData: null,
            logInInProcess: false,
            logInSuccess: false,
            errors: errors,
        };
    }),

    on(logInActions.authenticatedAction, (state, { response }) => {
        return {
            ...state,
            logInData: response,
            logInInProcess: false,
            logInSuccess: true,
            errors: [],
        };
    }),

    on(logInActions.NotAuthenticatedAction, (state, { response }) => {
        return {
            ...state,
            logInData: null,
            logInInProcess: false,
            logInSuccess: false,
            errors: [],
        };
    }),

    on(logInActions.logoutAction, (state) => {
        return {
            ...state,
            logInData: null,
            logOutInProcess: true,
            logOutSuccess: false,
            errors: [],
        };
    }),
    on(logInActions.logoutActionComplete, (state) => {
        return {
            ...state,
            logInData: null,
            logOutInProcess: false,
            logOutSuccess: true,
            errors: [],
        };
    }),
    on(logInActions.logoutActionError, (state, { errors }) => {
        return {
            ...state,
            logOutInProcess: false,
            logOutSuccess: false,
            errors: errors,
        };
    }),

    on(logInActions.getUserAction, (state) => {
        return {
            ...state,
            logInInProcess: true,
            logInSuccess: false,
            errors: [],
        };
    })
);
