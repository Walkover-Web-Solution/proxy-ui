import { IFirebaseUserModel } from '@proxy/models/root-models';
import { createAction, props } from '@ngrx/store';

export const logInAction = createAction('[Auth] Log In Or Sign Up');
export const logInActionComplete = createAction('[Auth] Log In Or Sign Up Complete');
export const logInActionError = createAction('[Auth] Log In Or Sign Up Error', props<{ errors: string[] }>());

export const authenticatedAction = createAction('[Auth] Authenticated', props<{ response: IFirebaseUserModel }>());

export const NotAuthenticatedAction = createAction('[Auth] Unauthenticated', props<{ response: any }>());

export const logoutAction = createAction('[Logout] User LogOut');
export const logoutActionComplete = createAction('[Logout] User LogOut Complete');
export const logoutActionError = createAction('[Logout] User LogOut Error', props<{ errors: string[] }>());

export const getUserAction = createAction('[Auth] Get User');
