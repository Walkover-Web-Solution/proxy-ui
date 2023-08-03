import { Action, createReducer, on } from '@ngrx/store';
import { rootActions } from '../../actions';

export interface IRootState {
    errors: string[];
    headerTitle: string;
    token: string;
}

export const initialState: IRootState = {
    errors: null,
    headerTitle: null,
    token: null,
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

    on(rootActions.setAuthToken, (state, { token }) => {
        return {
            ...state,
            token,
        };
    })
);
