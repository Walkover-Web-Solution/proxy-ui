import { Action, createReducer, on } from '@ngrx/store';
import { rootActions } from '../../actions';
import { IClient, IClientSettings, IPaginatedResponse } from '@proxy/models/root-models';

export interface IRootState {
    errors: string[];
    headerTitle: string;

    // Client settings
    clientSettings: IClientSettings;
    clientSettingsInProcess: boolean;

    // Client Company
    clientCompanies: IPaginatedResponse<IClient[]>;
}

export const initialState: IRootState = {
    errors: null,
    headerTitle: null,

    // Client settings
    clientSettings: null,
    clientSettingsInProcess: false,

    // Client Company
    clientCompanies: null,
};

export function rootReducer(state: IRootState, action: Action) {
    return _rootReducer(state, action);
}

const _rootReducer = createReducer(
    initialState,
    on(rootActions.headerTitleAction, (state, { title }) => {
        return {
            ...state,
            headerTitle: title,
        };
    }),

    on(rootActions.getClientSettings, (state) => {
        return {
            ...state,
            clientSettings: null,
            clientSettingsInProcess: true,
        };
    }),
    on(rootActions.getClientSettingsSuccess, (state, { response }) => {
        return {
            ...state,
            clientSettings: response,
            clientSettingsInProcess: false,
        };
    }),
    on(rootActions.getClientSettingsError, (state) => {
        return {
            ...state,
            clientSettings: null,
            clientSettingsInProcess: false,
        };
    })
);
