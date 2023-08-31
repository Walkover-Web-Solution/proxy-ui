import { createUrl } from '@proxy/service';

export const otpVerificationUrls = {
    getWidgetData: (baseUrl) => createUrl(baseUrl, ':referenceId/widget'),
    sendOtp: (baseUrl) => createUrl(baseUrl, ':referenceId/otp/send'),
    verifyOtp: (baseUrl) => createUrl(baseUrl, 'widget/verifyOtp'),
    resend: (baseUrl) => createUrl(baseUrl, 'widget/retryOtp'),
};
