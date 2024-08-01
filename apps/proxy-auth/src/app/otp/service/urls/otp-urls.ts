import { createUrl } from '@proxy/service';

export const otpVerificationUrls = {
    getWidgetData: (baseUrl) => createUrl(baseUrl, ':referenceId/widget'),
    sendOtp: (baseUrl) => createUrl(baseUrl, ':referenceId/otp/send'),
    verifyOtp: (baseUrl) => createUrl(baseUrl, 'widget/verifyOtp'),
    resend: (baseUrl) => createUrl(baseUrl, 'widget/retryOtp'),
    register: (baseUrl) => createUrl(baseUrl, 'c/register'),
    login: (baseUrl) => createUrl(baseUrl, 'c/login'),
    resetPassword: (baseUrl) => createUrl(baseUrl, 'c/resetPassword'),
    verifyPasswordOtp: (baseUrl) => createUrl(baseUrl, 'c/verifyResetPassword'),
};
