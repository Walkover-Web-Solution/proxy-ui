import { createSelector } from '@ngrx/store';
import { IAppState } from '../app.state';
import { IRootState } from '../reducer/root.reducer';

export const selectState = (state: IAppState) => state;

export const selectRootState = createSelector(selectState, (p) => p.root);

export const selectRootErrors = createSelector(selectRootState, (rootState: IRootState) => rootState.errors);
export const selectTitle = createSelector(selectRootState, (rootState: IRootState) => rootState.headerTitle);

export const selectClientSettings = createSelector(
    selectRootState,
    (rootState: IRootState) => rootState.clientSettings
);
export const selectClientSettingsInProcess = createSelector(
    selectRootState,
    (rootState: IRootState) => rootState.clientSettingsInProcess
);

export const selectAllClient = createSelector(selectRootState, (rootState: IRootState) => rootState.clients);
export const selectClientsInProcess = createSelector(
    selectRootState,
    (rootState: IRootState) => rootState.clientsInProcess
);
export const selectSwtichClientSuccess = createSelector(
    selectRootState,
    (rootState: IRootState) => rootState.swtichClientSuccess
);
export const selectAllProjectList = createSelector(selectRootState, ({ allProjects }) => allProjects);
export const selectProjectInProcess = createSelector(
    selectRootState,
    (rootState: IRootState) => rootState.projectInProcess
);
