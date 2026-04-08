import * as fromEmail from '../../../ngrx/store';
import * as loginReducer from './login.reducer';

export interface ILogInFeatureState {
    auth: loginReducer.ILogInState;
}

export interface ILogInFeatureStateWithRootState extends fromEmail.IAppState {
    auth: loginReducer.ILogInState;
}

export const loginsReducer = loginReducer.loginReducer;
