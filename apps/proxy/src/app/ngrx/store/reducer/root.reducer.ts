import { Action, createReducer, on } from '@ngrx/store';
import { rootActions } from '../../actions';
import { IClientSettings } from '@proxy/models/root-models';

export interface IRootState {
    errors: string[];
    headerTitle: string;
    clientSettings: IClientSettings;
    clientSettingsInProcess: boolean;
}

export const initialState: IRootState = {
    errors: null,
    headerTitle: null,
    clientSettings: null,
    clientSettingsInProcess: false,
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
