import { createSelector } from '@ngrx/store';
import { ILogInFeatureState } from '../store/login.state';
import { ILogInState } from '../store/login.reducer';

export const selectState = (state: ILogInFeatureState) => state.auth;

export const selectLogInErrors = createSelector(selectState, (auth: ILogInState) => auth?.errors);
export const selectLogInData = createSelector(selectState, (auth: ILogInState) => auth?.logInData);
export const selectLogInDataInProcess = createSelector(selectState, (auth: ILogInState) => auth.logInInProcess);
export const selectLogInDataSuccess = createSelector(selectState, (auth: ILogInState) => auth.logInSuccess);
export const selectLogOutProcess = createSelector(selectState, (auth: ILogInState) => auth.logOutInProcess);
export const selectLogOutSuccess = createSelector(selectState, (auth: ILogInState) => auth.logOutSuccess);
