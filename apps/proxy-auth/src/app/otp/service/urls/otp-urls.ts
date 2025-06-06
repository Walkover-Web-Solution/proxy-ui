import { createUrl } from '@proxy/service';

export const otpVerificationUrls = {
    getWidgetData: (baseUrl) => createUrl(baseUrl, ':referenceId/widget'),
    sendOtp: (baseUrl) => createUrl(baseUrl, ':referenceId/otp/send'),
    verifyOtp: (baseUrl) => createUrl(baseUrl, 'widget/verifyOtp'),
    resend: (baseUrl) => createUrl(baseUrl, 'widget/retryOtp'),
    register: (baseUrl) => createUrl(baseUrl, 'c/register?action=redirect'),
    login: (baseUrl) => createUrl(baseUrl, 'c/login'),
    resetPassword: (baseUrl) => createUrl(baseUrl, 'c/resetPassword'),
    verifyPasswordOtp: (baseUrl) => createUrl(baseUrl, 'c/verifyResetPassword'),
    getUserDetails: (baseUrl) => createUrl(baseUrl, 'c/getDetails'),
    leaveCompany: (baseUrl) => createUrl(baseUrl, 'c/inviteAction/leave'),
    updateUser: (baseUrl) => createUrl(baseUrl, 'c/updateUser'),
};
