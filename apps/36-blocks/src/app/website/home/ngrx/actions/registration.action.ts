import { createAction, props } from '@ngrx/store';

export interface IRegistrationPayload {
    user: {
        email: string;
        mobile: string;
        fname: string;
        lname: string;
        username: string;
        password: string;
    };
    client: {
        name: string;
    };
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
