import { createUrl } from 'libs/service/src/lib/utils/base-url';

export const otpVerificationUrls = {
    getWidgetData: (baseUrl) => createUrl(baseUrl, ':referenceId/widget'),
    sendOtp: (baseUrl) => createUrl(baseUrl, ':referenceId/otp/send'),
    verifyOtp: (baseUrl) => createUrl(baseUrl, 'widget/verifyOtp'),
    resend: (baseUrl) => createUrl(baseUrl, 'widget/retryOtp'),
};
