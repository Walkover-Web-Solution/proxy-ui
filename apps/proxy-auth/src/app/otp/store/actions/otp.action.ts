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
export const getUserDetails = createAction('[OTP] Get User Details', props<{ request: any }>());
export const getUserDetailsComplete = createAction('[OTP] Get User Details Complete', props<{ response: any }>());
export const getUserDetailsError = createAction(
    '[OTP] Get User Details Error',
    props<{ errors: string[]; errorResponse: any }>()
);
export const leaveCompany = createAction('[OTP] Leave Company', props<{ companyId: number; authToken: string }>());
export const leaveCompanyComplete = createAction('[OTP] Leave Company Complete', props<{ response: any }>());
export const leaveCompanyError = createAction(
    '[OTP] Leave Company Error',
    props<{ errors: string[]; errorResponse: any }>()
);

export const updateUser = createAction('[OTP] Update Field', props<{ name: string; authToken: string }>());
export const updateUserComplete = createAction('[OTP] Update User Success', props<{ response: any }>());
export const updateUserError = createAction(
    '[OTP] Update User Failure',
    props<{ errors: string[]; errorResponse: any }>()
);

export const addUser = createAction('[OTP] Add User', props<{ payload: any; authToken: string }>());
export const addUserComplete = createAction('[OTP] Add User Complete', props<{ response: any }>());
export const addUserError = createAction('[OTP] Add User Error', props<{ errors: string[]; errorResponse: any }>());

export const getRoles = createAction('[OTP] Get Roles', props<{ authToken: string }>());
export const getRolesComplete = createAction('[OTP] Get Roles Complete', props<{ response: any }>());
export const getRolesError = createAction('[OTP] Get Roles Error', props<{ errors: string[]; errorResponse: any }>());

export const createRole = createAction(
    '[OTP] Create Role',
    props<{ name: string; permissions: string[]; authToken: string }>()
);
export const createRoleComplete = createAction('[OTP] Create Role Complete', props<{ response: any }>());
export const createRoleError = createAction(
    '[OTP] Create Role Error',
    props<{ errors: string[]; errorResponse: any }>()
);
export const createPermission = createAction('[OTP] Create Permission', props<{ name: string; authToken: string }>());
export const createPermissionComplete = createAction('[OTP] Create Permission Complete', props<{ response: any }>());
export const createPermissionError = createAction(
    '[OTP] Create Permission Error',
    props<{ errors: string[]; errorResponse: any }>()
);
export const getPermissions = createAction('[OTP] Get Permissions', props<{ authToken: string }>());
export const getPermissionsComplete = createAction('[OTP] Get Permissions Complete', props<{ response: any }>());
export const getPermissionsError = createAction(
    '[OTP] Get Permissions Error',
    props<{ errors: string[]; errorResponse: any }>()
);

export const getCompanyUsers = createAction('[OTP] Get Company Users', props<{ authToken: string }>());
export const getCompanyUsersComplete = createAction('[OTP] Get Company Users Complete', props<{ response: any }>());
export const getCompanyUsersError = createAction(
    '[OTP] Get Company Users Error',

    props<{ errors: string[]; errorResponse: any }>()
);
