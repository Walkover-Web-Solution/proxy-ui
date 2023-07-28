import { createUrl } from '@msg91/service';

export const TemplatesUrls = {
    getSenderIds: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getSenderIds'),
    getAllOtpTemplate: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/getAllOtpTemplate'),
    addOtpTemplate: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/addOtpTemplate'),
    updateOtpTemplate: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/updateOtpTemplate'),
};

export const WebhookUrls = {
    getWebhookUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/getWebhookUrl'),
    deleteWebhookUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/deleteWebhookUrl'),
    addWebhookUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/addWebhookUrl'),
};
