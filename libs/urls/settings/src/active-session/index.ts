import { createUrl } from '@msg91/service';

export const ActiveSessionUrls = {
    getAllActiveSessionUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getActiveSessionsPaginated'),
    logoutSelectedSessionsUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/logoutSelectedSessions'),
};
