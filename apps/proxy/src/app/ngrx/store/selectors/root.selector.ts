import { createSelector } from '@ngrx/store';
import { IAppState } from '../app.state';
import { IRootState } from '../reducer/root.reducer';

export const selectState = (state: IAppState) => state;

export const selectRootState = createSelector(selectState, (p) => p.root);

export const selectRootErrors = createSelector(selectRootState, (rootState: IRootState) => rootState.errors);
export const selectTitle = createSelector(selectRootState, (rootState: IRootState) => rootState.headerTitle);

export const clientSettings = createSelector(selectRootState, (rootState: IRootState) => rootState.clientSettings);
export const clientSettingsInProcess = createSelector(
    selectRootState,
    (rootState: IRootState) => rootState.clientSettingsInProcess
);
