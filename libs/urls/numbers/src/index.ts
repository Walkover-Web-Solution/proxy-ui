import { createUrl } from '@msg91/service';

export const NumbersUrls = {
    integration: (baseUrl: string) => createUrl(baseUrl, 'integration/'),
    editIntegration: (baseUrl: string) => createUrl(baseUrl, 'integration/:id/'),
    availableLongcode: (baseUrl: string) => createUrl(baseUrl, 'client/available-longcode/'),
    adminIntegration: (baseUrl: string) => createUrl(baseUrl, 'admin/integration/'),
    adminAvailableLongcode: (baseUrl: string) => createUrl(baseUrl, 'admin/available-longcode/'),
    adminDialPlan: (baseUrl: string) => createUrl(baseUrl, 'admin-panel-dialplan/'),
    adminDialPlanDropdown: (baseUrl: string) => createUrl(baseUrl, 'admin-panel-dialplan-dropdown/'),
    adminVoiceServers: (baseUrl: string) => createUrl(baseUrl, 'call-server/'),
};
