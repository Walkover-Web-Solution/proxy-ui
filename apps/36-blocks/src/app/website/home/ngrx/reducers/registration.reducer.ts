import { Action, createReducer, on } from '@ngrx/store';
import * as registrationActions from '../actions/registration.action';

export interface IRegistrationState {
    registrationInProgress: boolean;
    registrationSuccess: boolean;
    registeredEmail: string | null;
    registrationErrors: string[];
}

export const registrationInitialState: IRegistrationState = {
    registrationInProgress: false,
    registrationSuccess: false,
    registeredEmail: null,
    registrationErrors: [],
};

const _registrationReducer = createReducer(
    registrationInitialState,
    on(registrationActions.registrationSubmitAction, (state) => ({
        ...state,
        registrationInProgress: true,
        registrationSuccess: false,
        registeredEmail: null,
        registrationErrors: [],
    })),
    on(registrationActions.registrationSubmitComplete, (state, { registeredEmail }) => ({
        ...state,
        registrationInProgress: false,
        registrationSuccess: true,
        registeredEmail,
        registrationErrors: [],
    })),
    on(registrationActions.registrationSubmitError, (state, { errors }) => ({
        ...state,
        registrationInProgress: false,
        registrationSuccess: false,
        registeredEmail: null,
        registrationErrors: errors,
    })),
    on(registrationActions.registrationResetAction, () => ({ ...registrationInitialState }))
);

export function registrationReducer(state: IRegistrationState, action: Action): IRegistrationState {
    return _registrationReducer(state, action);
}
