import { createSelector } from '@ngrx/store';
import { IAppState } from '../app.state';

export const selectState = (state: IAppState) => state;

export const selectRootState = createSelector(selectState, (p) => p.otp);

export const errors = createSelector(selectRootState, (p) => p.errors);

export const selectGetOtpRes = createSelector(selectRootState, (p) => p.otpGenerateData);
export const selectGetOtpInProcess = createSelector(selectRootState, (p) => p.getOtpInProcess);
export const selectGetOtpSuccess = createSelector(selectRootState, (p) => p.getOtpSuccess);

export const selectResendOtpInProcess = createSelector(selectRootState, (p) => p.resendOtpInProcess);
export const selectResendOtpSuccess = createSelector(selectRootState, (p) => p.resendOtpSuccess);

export const selectVerifyOtpData = createSelector(selectRootState, (p) => p.verifyOtpData);
export const selectVerifyOtpInProcess = createSelector(selectRootState, (p) => p.verifyOtpInProcess);
export const selectVerifyOtpSuccess = createSelector(selectRootState, (p) => p.verifyOtpSuccess);

export const selectResendCount = createSelector(selectRootState, (p) => p.resendCount);
export const selectApiErrorResponse = createSelector(selectRootState, (p) => p.apiErrorResponse);
export const closeWidgetApiFailed = createSelector(selectRootState, (p) => p.closeWidgetApiFailed);

export const selectWidgetData = createSelector(selectRootState, (p) => p.widgetData);
export const getUserProfileData = createSelector(selectRootState, (p) => p.userProfileData);
export const getUserProfileSuccess = createSelector(selectRootState, (p) => p.userDetailsSuccess);
export const getUserProfileInProcess = createSelector(selectRootState, (p) => p.userProfileDataInProcess);

export const leaveCompanyData = createSelector(selectRootState, (p) => p.leaveCompanyData);
export const leaveCompanySuccess = createSelector(selectRootState, (p) => p.leaveCompanySuccess);
export const leaveCompanyDataInProcess = createSelector(selectRootState, (p) => p.leaveCompanyDataInProcess);
