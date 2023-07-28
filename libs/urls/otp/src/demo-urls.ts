import { createUrl } from '@msg91/service';

export const DemoUrls = {
    sendDemoOtp: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/sendDemoOtp'),
    verifyDemoOtp: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/verifyDemoOtp'),
    resendDemoOtpViaCall: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/resendDemoOtpViaCall'),
    getAllWidgetIntegrations: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/getAllWidgetIntegrations'),
    addWidgetIntegraion: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/addWidgetIntegraion'),
    enableDisableWidgetIntegration: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/enableDisableWidgetIntegration'),
    getWidgetProcess: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/getWidgetProcess?widgetId='),
    getChannels: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/getChannels'),
    updateWidgetIntegraion: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/updateWidgetIntegraion'),
};
