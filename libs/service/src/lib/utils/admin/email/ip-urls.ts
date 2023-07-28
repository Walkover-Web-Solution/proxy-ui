import { createUrl } from '../../base-url';

export const AdminEmailIpUrls = {
    getAvailableIps: (baseUrl) => createUrl(baseUrl, 'availableIps'),
    getUsedIps: (baseUrl) => createUrl(baseUrl, 'usedIps'),
    getFailedLogs: (baseUrl) => createUrl(baseUrl, 'user-activity-logs'),
    getFailedLogsStatuses: (baseUrl) => createUrl(baseUrl, 'api/status-codes?types=failed-logs'),
    getFailedLogDetails: (baseUrl) => createUrl(baseUrl, 'user-activity-logs/:logId'),
};
