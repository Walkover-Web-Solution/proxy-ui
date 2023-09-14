import { Action, createReducer, on } from '@ngrx/store';
import { rootActions } from '../../actions';
import { IClient, IClientSettings, IPaginatedResponse } from '@proxy/models/root-models';

export interface IRootState {
    errors: string[];
    headerTitle: string;

    // Client settings
    clientSettings: IClientSettings;
    clientSettingsInProcess: boolean;

    // All Clients
    clients: IPaginatedResponse<IClient[]>;
    clientsInProcess: boolean;
    swtichClientSuccess: boolean;
}

export const initialState: IRootState = {
    errors: null,
    headerTitle: null,

    // Client settings
    clientSettings: null,
    clientSettingsInProcess: false,

    // All Clients
    clients: null,
    clientsInProcess: false,
    swtichClientSuccess: false,
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

    // Client Settings Actions
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
    }),

    // Get All Client Actions
    on(rootActions.getAllClients, (state) => {
        return {
            ...state,
            clients: null,
            clientsInProcess: true,
        };
    }),
    on(rootActions.getAllClientsSuccess, (state, { response }) => {
        return {
            ...state,
            clients: response,
            clientsInProcess: false,
        };
    }),
    on(rootActions.getAllClientsError, (state) => {
        return {
            ...state,
            clients: null,
            clientsInProcess: false,
        };
    }),

    // Switch Client
    on(rootActions.switchClient, (state) => {
        return {
            ...state,
            clientsInProcess: true,
            swtichClientSuccess: false,
        };
    }),
    on(rootActions.switchClientSuccess, (state) => {
        return {
            ...state,
            clientsInProcess: false,
            swtichClientSuccess: true,
        };
    }),
    on(rootActions.switchClientError, (state) => {
        return {
            ...state,
            clientsInProcess: false,
            swtichClientSuccess: false,
        };
    })
);
