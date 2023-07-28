import { createUrl } from '@msg91/service';

export const LogUrls = {
    getDomainWiseEmailLogUrl: (baseUrl) => createUrl(baseUrl, 'outbounds'),
    getDeliveryStatusLogUrl: (baseUrl) => createUrl(baseUrl, 'exports/mail'),
    getDeliveryStatusSMTPLogUrl: (baseUrl) => createUrl(baseUrl, 'email-logs'),
    getEmailLog: (baseUrl) => createUrl(baseUrl, 'logs/mail'),
    getEvents: (baseUrl) => createUrl(baseUrl, 'events'),
    getOutboundDetailsAction: (baseUrl) => createUrl(baseUrl, 'outbounds/:outboundId'),
    getPreviewData: (baseUrl) => createUrl(baseUrl, 'preview-data'),
};
