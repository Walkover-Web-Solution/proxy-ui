import { createAction, props } from '@ngrx/store';
import { CreateMutable } from '../../model/otp';
import { IOtpState } from '../reducers/otp.reducer';

export const resetAnyState = createAction('[OTP] Reset Any State', props<{ request: CreateMutable<IOtpState> }>());
export const resetAll = createAction('[OTP Reset All]');

export const getWidgetData = createAction(
    '[Auth] Get Widget Data',
    props<{ referenceId: string; payload?: { [key: string]: any } }>()
);
export const getWidgetDataComplete = createAction('[OTP] Get Widget Data Complete', props<{ response: any }>());
export const getWidgetDataError = createAction(
    '[OTP] Get Widget Data Error',
    props<{ errors: string[]; errorResponse: any }>()
);

export const sendOtpAction = createAction('[OTP] Send OTP', props<{ request: any }>());
export const sendOtpActionComplete = createAction('[OTP] Send OTP Complete', props<{ response: any }>());
export const sendOtpActionError = createAction(
    '[OTP] Send OTP Error',
    props<{ errors: string[]; errorResponse: any }>()
);

export const getOtpResendAction = createAction('[OTP] Get OTP Resend', props<{ request: any }>());
export const getOtpResendActionComplete = createAction('[OTP] Get OTP Resend Complete', props<{ response: any }>());
export const getOtpResendActionError = createAction(
    '[OTP] Get OTP Resend Error',
    props<{ errors: string[]; errorResponse: any }>()
);

export const getOtpVerifyAction = createAction('[OTP] Get OTP Verify', props<{ request: any }>());
export const getOtpVerifyActionComplete = createAction('[OTP] Get OTP Verify Complete', props<{ response: any }>());
export const getOtpVerifyActionError = createAction(
    '[OTP] Get OTP Verify Error',
    props<{ errors: string[]; errorResponse: any }>()
);
