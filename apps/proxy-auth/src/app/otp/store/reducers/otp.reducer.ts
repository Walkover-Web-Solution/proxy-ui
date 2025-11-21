import { Action, createReducer, on } from '@ngrx/store';
import { cloneDeep, flatMap } from 'lodash-es';
import { IGetOtpRes, IWidgetResponse } from '../../model/otp';
import * as otpActions from '../actions/otp.action';
export interface IOtpState {
    errors: string[];

    otpGenerateData: IGetOtpRes;
    getOtpInProcess: boolean;
    getOtpSuccess: boolean;
    verifyOtpV2Data: any;
    verifyOtpV2InProcess: boolean;
    verifyOtpV2Success: boolean;

    resendOtpInProcess: boolean;
    resendOtpSuccess: boolean;

    verifyOtpData: any;
    verifyOtpInProcess: boolean;
    verifyOtpSuccess: boolean;

    resendCount: number;
    apiErrorResponse: any;
    closeWidgetApiFailed: boolean;

    widgetData: any;
    theme: any;

    userProfileData: any;
    userProfileDataInProcess: boolean;
    userDetailsSuccess: boolean;

    leaveCompanyData: any;
    leaveCompanyDataInProcess: boolean;
    leaveCompanySuccess: boolean;

    subscriptionPlansData: any;
    subscriptionPlansDataInProcess: boolean;
    subscriptionPlansDataSuccess: boolean;

    updateUser: string;
    loading: boolean;
    updateSuccess: boolean;

    addUserData: any;
    addUserInProcess: boolean;
    addUserSuccess: boolean;

    rolesData: any;
    rolesDataInProcess: boolean;
    rolesSuccess: boolean;

    roleCreateData: any;
    roleCreateDataInProcess: boolean;
    roleCreateSuccess: boolean;

    companyUsersData: any;
    companyUsersDataInProcess: boolean;
    companyUsersSuccess: boolean;

    permissionCreateData: any;
    permissionCreateDataInProcess: boolean;
    permissionCreateSuccess: boolean;

    permissionData: any;
    permissionDataInProcess: boolean;
    permissionSuccess: boolean;

    updateCompanyUserData: any;
    updateCompanyUserDataInProcess: boolean;
    updateCompanyUserDataSuccess: boolean;

    updatePermissionData: any;
    updatePermissionDataInProcess: boolean;
    updatePermissionDataSuccess: boolean;

    updateRoleData: any;
    updateRoleDataInProcess: boolean;
    updateRoleDataSuccess: boolean;

    upgradeSubscriptionData: any;
    upgradeSubscriptionDataInProcess: boolean;
    upgradeSubscriptionDataSuccess: boolean;

    deleteUserData: any;
    deleteUserDataInProcess: boolean;
    deleteUserDataSuccess: boolean;

    error: any;
}

export const initialState: IOtpState = {
    errors: null,

    otpGenerateData: null,
    getOtpInProcess: false,
    getOtpSuccess: false,
    verifyOtpV2Data: null,
    verifyOtpV2InProcess: false,
    verifyOtpV2Success: false,

    resendOtpInProcess: false,
    resendOtpSuccess: false,

    verifyOtpData: null,
    verifyOtpInProcess: false,
    verifyOtpSuccess: false,

    resendCount: 0,
    apiErrorResponse: null,
    closeWidgetApiFailed: false,

    widgetData: null,
    theme: null,
    userProfileData: null,
    userProfileDataInProcess: false,
    userDetailsSuccess: false,

    leaveCompanyData: null,
    leaveCompanyDataInProcess: false,
    leaveCompanySuccess: false,

    subscriptionPlansData: null,
    subscriptionPlansDataInProcess: false,
    subscriptionPlansDataSuccess: false,

    updateUser: '',
    loading: false,
    updateSuccess: false,

    addUserData: null,
    addUserInProcess: false,
    addUserSuccess: false,

    rolesData: null,
    rolesDataInProcess: false,
    rolesSuccess: false,

    roleCreateData: null,
    roleCreateDataInProcess: false,
    roleCreateSuccess: false,

    companyUsersData: null,
    companyUsersDataInProcess: false,
    companyUsersSuccess: false,

    permissionCreateData: null,
    permissionCreateDataInProcess: false,
    permissionCreateSuccess: false,

    permissionData: null,
    permissionDataInProcess: false,
    permissionSuccess: false,

    updateCompanyUserData: null,
    updateCompanyUserDataInProcess: false,
    updateCompanyUserDataSuccess: false,

    updatePermissionData: null,
    updatePermissionDataInProcess: false,
    updatePermissionDataSuccess: false,

    updateRoleData: null,
    updateRoleDataInProcess: false,
    updateRoleDataSuccess: false,

    upgradeSubscriptionData: null,
    upgradeSubscriptionDataInProcess: false,
    upgradeSubscriptionDataSuccess: false,

    deleteUserData: null,
    deleteUserDataInProcess: false,
    deleteUserDataSuccess: false,

    error: null,
};

export function otpReducer(state: IOtpState, action: Action) {
    return _otpReducer(state, action);
}

const _otpReducer = createReducer(
    initialState,
    on(otpActions.resetAnyState, (state, { request }) => {
        return {
            ...state,
            ...request,
        };
    }),
    on(otpActions.resetAll, (state) => {
        return {
            ...state,
            ...initialState,
        };
    }),

    on(otpActions.sendOtpAction, (state, { request }) => {
        return {
            ...state,
            getOtpInProcess: true,
            getOtpSuccess: false,
            errors: null,
        };
    }),
    on(otpActions.sendOtpActionComplete, (state, { response }) => {
        return {
            ...state,
            otpGenerateData: {
                reqId: response.message,
            },
            getOtpInProcess: false,
            getOtpSuccess: true,
        };
    }),
    on(otpActions.sendOtpActionError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            getOtpInProcess: false,
            getOtpSuccess: false,
            errors: errors,
            apiErrorResponse: errorResponse,
        };
    }),

    on(otpActions.verifyOtpAction, (state, { request }) => {
        return {
            ...state,
            verifyOtpV2InProcess: true,
            verifyOtpV2Success: false,
            errors: null,
        };
    }),
    on(otpActions.verifyOtpActionComplete, (state, { response }) => {
        return {
            ...state,
            verifyOtpV2Data: response,
            verifyOtpV2InProcess: false,
            verifyOtpV2Success: true,
        };
    }),
    on(otpActions.verifyOtpActionError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            verifyOtpV2Data: null,
            verifyOtpV2InProcess: false,
            verifyOtpV2Success: false,
            errors: errors,
            apiErrorResponse: errorResponse,
        };
    }),

    on(otpActions.getOtpResendAction, (state, { request }) => {
        return {
            ...state,
            resendOtpInProcess: true,
            resendOtpSuccess: false,
            errors: null,
        };
    }),
    on(otpActions.getOtpResendActionComplete, (state, { response }) => {
        let oldResendCount = cloneDeep(state.resendCount);
        oldResendCount += 1;
        return {
            ...state,
            resendOtpInProcess: false,
            resendOtpSuccess: true,
            resendCount: oldResendCount,
        };
    }),
    on(otpActions.getOtpResendActionError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            resendOtpInProcess: false,
            resendOtpSuccess: false,
            errors: errors,
            apiErrorResponse: errorResponse,
        };
    }),

    on(otpActions.getOtpVerifyAction, (state, { request }) => {
        return {
            ...state,
            verifyOtpData: null,
            verifyOtpInProcess: true,
            verifyOtpSuccess: false,
            errors: null,
            apiErrorResponse: null,
        };
    }),
    on(otpActions.getOtpVerifyActionComplete, (state, { response }) => {
        return {
            ...state,
            verifyOtpData: response,
            verifyOtpInProcess: false,
            verifyOtpSuccess: true,
        };
    }),
    on(otpActions.getOtpVerifyActionError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            verifyOtpData: null,
            verifyOtpInProcess: false,
            verifyOtpSuccess: false,
            errors: errors,
            apiErrorResponse: errorResponse,
        };
    }),
    on(otpActions.getWidgetData, (state) => {
        return {
            ...state,
            widgetDataInProcess: true,
            widgetDataSuccess: false,
            errors: null,
            closeWidgetApiFailed: false,
        };
    }),
    on(otpActions.getWidgetDataComplete, (state, { response, theme }) => {
        return {
            ...state,
            widgetData: response,
            theme: theme,
            widgetDataInProcess: false,
            widgetDataSuccess: true,
            closeWidgetApiFailed: false,
        };
    }),
    on(otpActions.getWidgetDataError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            widgetDataInProcess: false,
            widgetDataSuccess: false,
            errors: errors,
            apiErrorResponse: errorResponse,
            closeWidgetApiFailed: true,
        };
    }),
    on(otpActions.getUserDetails, (state, { request }) => {
        return {
            ...state,
            userProfileDataInProcess: true,
            userDetailsSuccess: false,
            errors: null,
        };
    }),
    on(otpActions.getUserDetailsComplete, (state, { response }) => {
        return {
            ...state,
            userProfileDataInProcess: false,
            userDetailsSuccess: true,
            userProfileData: response,
        };
    }),
    on(otpActions.getUserDetailsError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            userProfileDataInProcess: false,
            userDetailsSuccess: false,
            errors: errors,
            apiErrorResponse: errorResponse,
        };
    }),

    on(otpActions.leaveCompany, (state, { companyId }) => {
        return {
            ...state,
            leaveCompanyDataInProcess: true,
            leaveCompanySuccess: false,
            errors: null,
        };
    }),
    on(otpActions.leaveCompanyComplete, (state, { response }) => {
        return {
            ...state,
            leaveCompanyDataInProcess: false,
            leaveCompanySuccess: true,
            leaveCompanyData: response,
        };
    }),
    on(otpActions.leaveCompanyError, (state, { errors, errorResponse }) => {
        return {
            ...state,
            leaveCompanyDataInProcess: false,
            leaveCompanySuccess: false,
            errors: errors,
            apiErrorResponse: errorResponse,
        };
    }),

    on(otpActions.updateUser, (state) => ({
        ...state,
        loading: false,
        error: null,
        updateSuccess: false,
    })),

    on(otpActions.updateUserComplete, (state, { response }) => ({
        ...state,
        name: response.name,
        loading: true,
        error: null,
        updateSuccess: true,
    })),

    on(otpActions.updateUserError, (state, { errors, errorResponse }) => ({
        ...state,
        loading: false,
        error: errors,
        apiErrorResponse: errorResponse,
        updateSuccess: false,
    })),

    on(otpActions.addUser, (state) => ({
        ...state,
        addUserInProcess: false,
        error: null,
        addUserSuccess: false,
    })),

    on(otpActions.addUserComplete, (state, { response }) => ({
        ...state,
        addUserData: response,
        addUserInProcess: true,
        error: null,
        addUserSuccess: true,
    })),

    on(otpActions.addUserError, (state, { errors, errorResponse }) => ({
        ...state,
        addUserInProcess: false,
        error: errors,
        apiErrorResponse: errorResponse,
        addUserSuccess: false,
    })),

    on(otpActions.getRoles, (state) => ({
        ...state,
        rolesDataInProcess: false,
        error: null,
        rolesSuccess: false,
    })),
    on(otpActions.getRolesComplete, (state, { response }) => ({
        ...state,
        rolesData: response,
        rolesDataInProcess: true,
        error: null,
        rolesSuccess: true,
    })),
    on(otpActions.getRolesError, (state, { errors, errorResponse }) => ({
        ...state,
        rolesDataInProcess: false,
        error: errors,
        apiErrorResponse: errorResponse,
        rolesSuccess: false,
    })),

    on(otpActions.getCompanyUsers, (state) => ({
        ...state,
        companyUsersDataInProcess: false,
        error: null,
        companyUsersSuccess: false,
    })),

    on(otpActions.getCompanyUsersComplete, (state, { response }) => ({
        ...state,
        companyUsersData: response,
        companyUsersDataInProcess: true,
        error: null,
        companyUsersSuccess: true,
    })),

    on(otpActions.getCompanyUsersError, (state, { errors, errorResponse }) => ({
        ...state,
        companyUsersDataInProcess: false,
        error: errors,
        apiErrorResponse: errorResponse,
        companyUsersSuccess: false,
    })),

    on(otpActions.createRole, (state) => ({
        ...state,
        roleCreateDataInProcess: false,
        error: null,
        roleCreateSuccess: false,
    })),

    on(otpActions.createRoleComplete, (state, { response }) => ({
        ...state,
        roleCreateData: response,
        roleCreateDataInProcess: true,
        error: null,
        roleCreateSuccess: true,
    })),
    on(otpActions.createRoleError, (state, { errors, errorResponse }) => ({
        ...state,
        roleCreateDataInProcess: false,
        error: errors,
        apiErrorResponse: errorResponse,
        roleCreateSuccess: false,
    })),

    on(otpActions.createPermission, (state) => ({
        ...state,
        permissionCreateDataInProcess: false,
        error: null,
        permissionCreateSuccess: false,
    })),

    on(otpActions.createPermissionComplete, (state, { response }) => ({
        ...state,
        permissionCreateData: response,
        permissionCreateDataInProcess: true,
        error: null,
        permissionCreateSuccess: true,
    })),

    on(otpActions.createPermissionError, (state, { errors, errorResponse }) => ({
        ...state,
        permissionCreateDataInProcess: false,
        error: errors,
        apiErrorResponse: errorResponse,
        permissionCreateSuccess: false,
    })),
    on(otpActions.getPermissions, (state) => ({
        ...state,
        permissionDataInProcess: false,
        error: null,
        permissionSuccess: false,
    })),

    on(otpActions.getPermissionsComplete, (state, { response }) => ({
        ...state,
        permissionData: response,
        permissionDataInProcess: true,
        error: null,
        permissionSuccess: true,
    })),

    on(otpActions.getPermissionsError, (state, { errors, errorResponse }) => ({
        ...state,
        permissionDataInProcess: false,
        error: errors,
        apiErrorResponse: errorResponse,
        permissionSuccess: false,
    })),
    on(otpActions.updateCompanyUser, (state) => ({
        ...state,
        updateCompanyUserDataInProcess: false,
        error: null,
        updateCompanyUserDataSuccess: false,
    })),

    on(otpActions.updateCompanyUserComplete, (state, { response }) => ({
        ...state,
        updateCompanyUserData: response,
        updateCompanyUserDataInProcess: true,
        error: null,
        updateCompanyUserDataSuccess: true,
    })),
    on(otpActions.updateCompanyUserError, (state, { errors, errorResponse }) => ({
        ...state,
        updateCompanyUserDataInProcess: false,
        error: errors,
        apiErrorResponse: errorResponse,
        updateCompanyUserDataSuccess: false,
    })),
    on(otpActions.updatePermission, (state) => ({
        ...state,
        updatePermissionDataInProcess: false,
        error: null,
        updatePermissionDataSuccess: false,
    })),
    on(otpActions.updatePermissionComplete, (state, { response }) => ({
        ...state,
        updatePermissionData: response,
        updatePermissionDataInProcess: true,
        error: null,
        updatePermissionDataSuccess: true,
    })),
    on(otpActions.updatePermissionError, (state, { errors, errorResponse }) => ({
        ...state,
        updatePermissionDataInProcess: false,
        error: errors,
        apiErrorResponse: errorResponse,
        updatePermissionDataSuccess: false,
    })),
    on(otpActions.updateRole, (state) => ({
        ...state,
        updateRoleDataInProcess: false,
        error: null,
        updateRoleDataSuccess: false,
    })),
    on(otpActions.updateRoleComplete, (state, { response }) => ({
        ...state,
        updateRoleData: response,
        updateRoleDataInProcess: true,
        error: null,
        updateRoleDataSuccess: true,
    })),
    on(otpActions.updateRoleError, (state, { errors, errorResponse }) => ({
        ...state,
        updateRoleDataInProcess: false,
        error: errors,
        apiErrorResponse: errorResponse,
        updateRoleDataSuccess: false,
    })),

    on(otpActions.getSubscriptionPlans, (state, { referenceId }) => ({
        ...state,
        subscriptionPlansDataInProcess: true,
        subscriptionPlansDataSuccess: false,
        errors: null,
    })),
    on(otpActions.getSubscriptionPlansComplete, (state, { response }) => ({
        ...state,
        subscriptionPlansDataInProcess: false,
        subscriptionPlansDataSuccess: true,
        subscriptionPlansData: response,
    })),

    on(otpActions.upgradeSubscription, (state, { referenceId, payload, authToken }) => ({
        ...state,
        upgradeSubscriptionDataInProcess: true,
        upgradeSubscriptionDataSuccess: false,
        errors: null,
    })),
    on(otpActions.upgradeSubscriptionComplete, (state, { response }) => ({
        ...state,
        upgradeSubscriptionData: response,
        upgradeSubscriptionDataInProcess: false,
        upgradeSubscriptionDataSuccess: true,
    })),
    on(otpActions.upgradeSubscriptionError, (state, { errors, errorResponse }) => ({
        ...state,
        upgradeSubscriptionDataInProcess: false,
        upgradeSubscriptionDataSuccess: false,
        errors: errors,
        apiErrorResponse: errorResponse,
    })),
    on(otpActions.getSubscriptionPlansError, (state, { errors, errorResponse }) => ({
        ...state,
        subscriptionPlansDataInProcess: false,
        subscriptionPlansDataSuccess: false,
        errors: errors,
        apiErrorResponse: errorResponse,
    })),
    on(otpActions.deleteUser, (state, { companyId }) => ({
        ...state,
        deleteUserDataInProcess: true,
        deleteUserDataSuccess: false,
        errors: null,
    })),
    on(otpActions.deleteUserComplete, (state, { response }) => ({
        ...state,
        deleteUserData: response,
        deleteUserDataInProcess: false,
        deleteUserDataSuccess: true,
    })),
    on(otpActions.deleteUserError, (state, { errors, errorResponse }) => ({
        ...state,
        deleteUserDataInProcess: false,
        deleteUserDataSuccess: false,
        errors: errors,
        apiErrorResponse: errorResponse,
    }))
);
