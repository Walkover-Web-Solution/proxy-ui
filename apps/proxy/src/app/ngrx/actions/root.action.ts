import { createAction, props } from '@ngrx/store';
import { IClient, IClientSettings, IPaginatedResponse } from '@proxy/models/root-models';

export const headerTitleAction = createAction('[Set header name] Header Title Action ', props<{ title: string }>());

export const getClientSettings = createAction('[Client Setting] Get Client Settings');
export const getClientSettingsSuccess = createAction(
    '[Client Setting] Get Client Settings Success',
    props<{ response: IClientSettings }>()
);
export const getClientSettingsError = createAction('[Client Setting] Get Client Settings Error');

export const getAllClients = createAction(
    '[Client Setting] Get All Clients',
    props<{ params: { [key: string]: string | number } }>()
);
export const getAllClientsSuccess = createAction(
    '[Client Setting] Get All Clients Success',
    props<{ response: IPaginatedResponse<IClient[]> }>()
);
export const getAllClientsError = createAction('[Client Setting] Get All Clients Error');

export const switchClient = createAction('[Client Setting] Switch Client', props<{ request: { client_id: number } }>());
export const switchClientSuccess = createAction('[Client Setting] Switch Client Success');
export const switchClientError = createAction('[[Client Setting] Switch Client Error');

export const getAllProject = createAction('[project] Get All Projests');
export const getAllProjectSuccess = createAction('[project] Get All Projects Success', props<{ response: any }>());
export const getAllProjectsError = createAction('[project] Get All Project Error');
