import { createAction, props } from '@ngrx/store';

export interface IRegistrationPayload {
    email: string;
    password: string;
}

export const registrationSubmitAction = createAction(
    '[Registration] Submit Registration',
    props<{ payload: IRegistrationPayload }>()
);

export const registrationSubmitComplete = createAction(
    '[Registration] Submit Registration Complete',
    props<{ registeredEmail: string }>()
);

export const registrationSubmitError = createAction(
    '[Registration] Submit Registration Error',
    props<{ errors: string[] }>()
);

export const registrationResetAction = createAction('[Registration] Reset State');
