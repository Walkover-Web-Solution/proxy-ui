import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IRegistrationState } from '../reducers/registration.reducer';

export const selectRegistrationState = createFeatureSelector<IRegistrationState>('registration');

export const selectRegistrationInProgress = createSelector(
    selectRegistrationState,
    (state: IRegistrationState) => state.registrationInProgress
);

export const selectRegistrationSuccess = createSelector(
    selectRegistrationState,
    (state: IRegistrationState) => state.registrationSuccess
);

export const selectRegistrationErrors = createSelector(
    selectRegistrationState,
    (state: IRegistrationState) => state.registrationErrors
);

export const selectRegisteredEmail = createSelector(
    selectRegistrationState,
    (state: IRegistrationState) => state.registeredEmail
);
