import { createAction, props } from '@ngrx/store';

export const headerTitleAction = createAction('[set header name] Header Title Action ', props<{ title: string }>());

export const setAuthToken = createAction('[Root] Set Auth Token', props<{ token: string }>());
