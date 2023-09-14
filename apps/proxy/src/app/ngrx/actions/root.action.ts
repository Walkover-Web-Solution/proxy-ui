import { createAction, props } from '@ngrx/store';
import { IClientSettings } from '@proxy/models/root-models';

export const headerTitleAction = createAction('[Set header name] Header Title Action ', props<{ title: string }>());

export const getClientSettings = createAction('[Client Setting] Get Client Settings');
export const getClientSettingsSuccess = createAction(
    '[Client Setting] Get Client Settings Success',
    props<{ response: IClientSettings }>()
);
export const getClientSettingsError = createAction('[Client Setting] Get Client Settings Error');
