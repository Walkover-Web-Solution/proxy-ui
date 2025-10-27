import { createUrl } from '@proxy/service';

export const otpVerificationUrls = {
    getWidgetData: (baseUrl) => createUrl(baseUrl, ':referenceId/widget'),
    sendOtp: (baseUrl) => createUrl(baseUrl, ':referenceId/otp/send'),
    verifyOtpV2: (baseUrl) => createUrl(baseUrl, ':referenceId/otp/verify'),
    verifyOtp: (baseUrl) => createUrl(baseUrl, 'widget/verifyOtp'),
    resend: (baseUrl) => createUrl(baseUrl, 'widget/retryOtp'),
    register: (baseUrl) => createUrl(baseUrl, 'c/register?action=redirect'),
    login: (baseUrl) => createUrl(baseUrl, 'c/login'),
    resetPassword: (baseUrl) => createUrl(baseUrl, 'c/resetPassword'),
    verifyPasswordOtp: (baseUrl) => createUrl(baseUrl, 'c/verifyResetPassword'),
    getUserDetails: (baseUrl) => createUrl(baseUrl, 'c/getDetails'),
    leaveCompany: (baseUrl) => createUrl(baseUrl, 'c/inviteAction/leave'),
    updateUser: (baseUrl) => createUrl(baseUrl, 'c/updateUser'),
    addUser: (baseUrl) => createUrl(baseUrl, 'c/addUser'),
    createRole: (baseUrl) => createUrl(baseUrl, 'c/roles'),
    getCompanyUsers: (baseUrl) => createUrl(baseUrl, 'c/getCompanyUsers'),
    createPermission: (baseUrl) => createUrl(baseUrl, 'c/Permission'),
    updatePermission: (baseUrl) => createUrl(baseUrl, 'c/Permission/:id'),
    updateRole: (baseUrl) => createUrl(baseUrl, 'c/roles/:id'),
    getSubscriptionPlans: (baseUrl) => createUrl(baseUrl, 'subscription/:referenceId/getSnippetsData'),
    upgradeSubscription: (baseUrl) => createUrl(baseUrl, 'subscription/:referenceId/subscribe'),
};
