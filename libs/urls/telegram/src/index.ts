import { createUrl } from '@msg91/service';

export const TelegramAdminClientUrls = {
    getClientData: (baseUrl) => createUrl(baseUrl, 'telegram/admin-panel/client/'),
    updateClientData: (baseUrl) => createUrl(baseUrl, 'telegram/admin-panel/client/:integrationId/'),
};

export const TelegramClientUrls = {
    integrateBot: (baseUrl) => createUrl(baseUrl, 'telegram/client-panel/integration/'),
    qrIntegration: (baseUrl) => createUrl(baseUrl, 'telegram/client-panel/qr-integration/'),
    getIntegration: (baseUrl) => createUrl(baseUrl, 'telegram/client-panel/integration/'),
    getQrUrl: (baseUrl) => createUrl(baseUrl, 'telegram/client-panel/qr-integration/'),
    updateIntegration: (baseUrl) => createUrl(baseUrl, 'telegram/client-panel/integration/:integrationId/'),
    getClientData: (baseUrl) => createUrl(baseUrl, 'telegram/admin-panel/client'),
    updateClientData: (baseUrl) => createUrl(baseUrl, 'telegram/admin-panel/client/:integrationId'),
    createTemplate: (baseUrl) => createUrl(baseUrl, 'telegram/client-panel/template/'),
    editTemplateStatus: (baseUrl) => createUrl(baseUrl, 'telegram/client-panel/template/:id/'),
    getTemplates: (baseUrl) => createUrl(baseUrl, 'telegram/client-panel/template/'),
    getTemplateStruct: (baseUrl) => createUrl(baseUrl, 'telegram/client-panel/dropdown/'),
};
