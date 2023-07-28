import { createUrl } from '@msg91/service';

export const LogsUrls = {
    getDeliveryLogs: (baseUrl) => createUrl(baseUrl, 'api/v5/:microservice/getDeliveryLogs'),
    getAllCampaigns: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/getAllCampaigns'),
    getSmsRoutes: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/getSmsRoutes'),
    deliveryDetails: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/deliveryDetails'),
    deliveryDetailsCount: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/deliveryDetailsCount'),
    resendSmsFromUser: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/resendSmsFromUser'),
    cancelScheduledSms: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/cancelScheduledSms'),
    playPauseRequest: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/playPauseRequest'),
    getFailedLogsStatus: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/getFailedSmsCodes'),
    getFailedLogs: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/getFailedApisLogs'),
    getFailedApis: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getFailedApis'),
    exportFailedLogs: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/exportFailedLogs'),
};
