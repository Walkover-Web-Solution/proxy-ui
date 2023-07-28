import { createUrl } from '../../base-url';

export const WhatsappUrls = {
    getDashboardData: (baseUrl) => createUrl(baseUrl, `whatsapp-admin-panel/dashboard/`),
    getClients: (baseUrl) => createUrl(baseUrl, `whatsapp-admin-panel/client/`),
    getLogs: (baseUrl) => createUrl(baseUrl, `whatsapp-admin-panel/log/`),
    createWhatsAppClient: (baseUrl) => createUrl(baseUrl, `whatsapp-activation/`),
    updateWhatsAppClient: (baseUrl) => createUrl(baseUrl, `whatsapp-activation/:id/`),
    exportLog: (baseUrl) => createUrl(baseUrl, `whatsapp-admin-panel/log/export/`),
    getLogsDropdown: (baseUrl) => createUrl(baseUrl, `admin-panel-log-dropdown/`),
    getClientsDropdown: (baseUrl) => createUrl(baseUrl, `admin-panel-client-dropdown/`),
    getFailedLogs: (baseUrl) => createUrl(baseUrl, 'admin-panel-failed-logs/'),
    getLogDropDownData: (baseUrl) => createUrl(baseUrl, `admin-panel-log-dropdown/`),
    exportFailedLogs: (baseUrl) => createUrl(baseUrl, `admin-panel-failed-logs/export/`),
};
