import { createUrl } from '@msg91/service';

export const FailedLogsUrls = {
    getFailedLogs: (baseUrl) => createUrl(baseUrl, 'activity-logs'),
    getFailedLogsDetails: (baseUrl) => createUrl(baseUrl, 'activity-logs/:logId?with=user'),
    bulkRemove: (baseUrl) => createUrl(baseUrl, 'activity-logs/bulk-remove'),
    getFailedLogsStatuses: (baseUrl) => createUrl(baseUrl, 'status-codes?types=failed-logs'),
};
