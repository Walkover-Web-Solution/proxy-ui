import { createSelector } from '@ngrx/store';
import { IAppState } from '../app.state';
import { IRootState } from '../reducer/root.reducer';

export const selectState = (state: IAppState) => state;

export const selectRootState = createSelector(selectState, (p) => p.root);

export const selectRootErrors = createSelector(selectRootState, (rootState: IRootState) => rootState.errors);
export const selectTitle = createSelector(selectRootState, (rootState: IRootState) => rootState.headerTitle);
export const selectAccessToken = createSelector(selectRootState, (rootState: IRootState) => rootState?.token);
