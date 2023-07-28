import { createUrl } from '@msg91/service';

export const NotificationsUrls = {
    postClientTemplate: (baseUrl) => createUrl(baseUrl, 'client-panel-template/'),
    getClientTemplate: (baseUrl) => createUrl(baseUrl, 'client-panel-template/'),
    sendNotification: (baseUrl) => createUrl(baseUrl, 'send-notification/'),
    updateClientTemplate: (baseUrl) => createUrl(baseUrl, 'client-panel-template/:id/'),
};
