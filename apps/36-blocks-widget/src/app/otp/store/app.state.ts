import { ActionReducerMap } from '@ngrx/store';
import * as rootReducer from './reducers/otp.reducer';

export interface IAppState {
    otp: rootReducer.IOtpState;
}

export const reducers: ActionReducerMap<IAppState> = {
    otp: rootReducer.otpReducer,
};
