import { createSelector } from '@ngrx/store';
import { IAppState } from '../app.state';

export const selectState = (state: IAppState) => state;

export const selectRootState = createSelector(selectState, (p) => p.otp);

export const errors = createSelector(selectRootState, (p) => p.errors);

export const selectGetOtpRes = createSelector(selectRootState, (p) => p.otpGenerateData);
export const selectGetOtpInProcess = createSelector(selectRootState, (p) => p.getOtpInProcess);
export const selectGetOtpSuccess = createSelector(selectRootState, (p) => p.getOtpSuccess);

export const selectVerifyOtpV2Data = createSelector(selectRootState, (p) => p.verifyOtpV2Data);
export const selectVerifyOtpV2InProcess = createSelector(selectRootState, (p) => p.verifyOtpV2InProcess);
export const selectVerifyOtpV2Success = createSelector(selectRootState, (p) => p.verifyOtpV2Success);

export const selectResendOtpInProcess = createSelector(selectRootState, (p) => p.resendOtpInProcess);
export const selectResendOtpSuccess = createSelector(selectRootState, (p) => p.resendOtpSuccess);

export const selectVerifyOtpData = createSelector(selectRootState, (p) => p.verifyOtpData);
export const selectVerifyOtpInProcess = createSelector(selectRootState, (p) => p.verifyOtpInProcess);
export const selectVerifyOtpSuccess = createSelector(selectRootState, (p) => p.verifyOtpSuccess);

export const selectResendCount = createSelector(selectRootState, (p) => p.resendCount);
export const selectApiErrorResponse = createSelector(selectRootState, (p) => p.apiErrorResponse);
export const closeWidgetApiFailed = createSelector(selectRootState, (p) => p.closeWidgetApiFailed);

export const selectWidgetData = createSelector(selectRootState, (p) => p.widgetData);
export const selectWidgetTheme = createSelector(selectRootState, (p) => p.theme);
export const getUserProfileData = createSelector(selectRootState, (p) => p.userProfileData);
export const getUserProfileSuccess = createSelector(selectRootState, (p) => p.userDetailsSuccess);
export const getUserProfileInProcess = createSelector(selectRootState, (p) => p.userProfileDataInProcess);

export const leaveCompanyData = createSelector(selectRootState, (p) => p.leaveCompanyData);
export const leaveCompanySuccess = createSelector(selectRootState, (p) => p.leaveCompanySuccess);
export const leaveCompanyDataInProcess = createSelector(selectRootState, (p) => p.leaveCompanyDataInProcess);

export const subscriptionPlansData = createSelector(selectRootState, (p) => p.subscriptionPlansData);
export const subscriptionPlansDataInProcess = createSelector(selectRootState, (p) => p.subscriptionPlansDataInProcess);
export const subscriptionPlansDataSuccess = createSelector(selectRootState, (p) => p.subscriptionPlansDataSuccess);

export const updateUser = createSelector(selectRootState, (p) => p.updateUser);
export const updateSuccess = createSelector(selectRootState, (p) => p.updateSuccess);
export const loading = createSelector(selectRootState, (p) => p.loading);

export const addUserData = createSelector(selectRootState, (p) => p.addUserData);
export const addUserInProcess = createSelector(selectRootState, (p) => p.addUserInProcess);
export const addUserSuccess = createSelector(selectRootState, (p) => p.addUserSuccess);

export const rolesData = createSelector(selectRootState, (p) => p.rolesData);
export const rolesDataInProcess = createSelector(selectRootState, (p) => p.rolesDataInProcess);
export const rolesSuccess = createSelector(selectRootState, (p) => p.rolesSuccess);

export const roleCreateData = createSelector(selectRootState, (p) => p.roleCreateData);
export const roleCreateDataInProcess = createSelector(selectRootState, (p) => p.roleCreateDataInProcess);
export const roleCreateSuccess = createSelector(selectRootState, (p) => p.roleCreateSuccess);

export const permissionCreateData = createSelector(selectRootState, (p) => p.permissionCreateData);
export const permissionCreateDataInProcess = createSelector(selectRootState, (p) => p.permissionCreateDataInProcess);
export const permissionCreateSuccess = createSelector(selectRootState, (p) => p.permissionCreateSuccess);

export const permissionData = createSelector(selectRootState, (p) => p.permissionData);
export const permissionDataInProcess = createSelector(selectRootState, (p) => p.permissionDataInProcess);
export const permissionSuccess = createSelector(selectRootState, (p) => p.permissionSuccess);

export const companyUsersData = createSelector(selectRootState, (p) => p.companyUsersData);
export const companyUsersDataInProcess = createSelector(selectRootState, (p) => p.companyUsersDataInProcess);
export const companyUsersSuccess = createSelector(selectRootState, (p) => p.companyUsersSuccess);

export const updateCompanyUserData = createSelector(selectRootState, (p) => p.updateCompanyUserData);
export const updateCompanyUserDataInProcess = createSelector(selectRootState, (p) => p.updateCompanyUserDataInProcess);
export const updateCompanyUserDataSuccess = createSelector(selectRootState, (p) => p.updateCompanyUserDataSuccess);

export const updatePermissionData = createSelector(selectRootState, (p) => p.updatePermissionData);
export const updatePermissionDataInProcess = createSelector(selectRootState, (p) => p.updatePermissionDataInProcess);
export const updatePermissionDataSuccess = createSelector(selectRootState, (p) => p.updatePermissionDataSuccess);

export const updateRoleData = createSelector(selectRootState, (p) => p.updateRoleData);
export const updateRoleDataInProcess = createSelector(selectRootState, (p) => p.updateRoleDataInProcess);
export const updateRoleDataSuccess = createSelector(selectRootState, (p) => p.updateRoleDataSuccess);

export const upgradeSubscriptionData = createSelector(selectRootState, (p) => p.upgradeSubscriptionData);
export const upgradeSubscriptionDataInProcess = createSelector(
    selectRootState,
    (p) => p.upgradeSubscriptionDataInProcess
);
export const upgradeSubscriptionDataSuccess = createSelector(selectRootState, (p) => p.upgradeSubscriptionDataSuccess);

export const deleteUserData = createSelector(selectRootState, (p) => p.deleteUserData);
export const deleteUserDataInProcess = createSelector(selectRootState, (p) => p.deleteUserDataInProcess);
export const deleteUserDataSuccess = createSelector(selectRootState, (p) => p.deleteUserDataSuccess);

export const error = createSelector(selectRootState, (p) => p.error);
