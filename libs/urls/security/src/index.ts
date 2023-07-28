import { createUrl } from '@msg91/service';

export const AdminSecurityLogUrls = {
    getEmailActivityLogs: (baseUrl) => createUrl(baseUrl, 'activity-logs'),
};
