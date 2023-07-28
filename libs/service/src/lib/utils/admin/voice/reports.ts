import { createUrl } from '../../base-url';

export const AdminVoiceReportsUrls = {
    getAdminVoiceReports: (baseUrl) => createUrl(baseUrl, 'call-logs/'),
    getAdminVoiceCallRecording: (baseUrl) => createUrl(baseUrl, 'call-logs/recording/:id'),
    getCallServersList: (baseUrl) => createUrl(baseUrl, 'call-server/'),
    columnsFilter: (baseUrl) => createUrl(baseUrl, 'call-logs/columns/'),
};
