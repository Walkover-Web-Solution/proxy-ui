import { createUrl } from '../../base-url';

export const AdminEmailLogUrls = {
    getAllLogs: (baseUrl) => createUrl(baseUrl, 'logs/mail'),
    exportLogs: (baseUrl) => createUrl(baseUrl, 'exports/mail'),
    getOutboundDetailsAction: (baseUrl) => createUrl(baseUrl, 'outbounds/:outboundId'),
    getEvents: (baseUrl) => createUrl(baseUrl, 'events'),
    getInboundLogs: (baseUrl) => createUrl(baseUrl, 'inbounds'),
    getInboundLogsDetails: (baseUrl) => createUrl(baseUrl, 'inbounds/:id'),
    getPreviewData: (baseUrl) => createUrl(baseUrl, 'preview-data'),
};
