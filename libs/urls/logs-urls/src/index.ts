import { createUrl } from '@proxy/service';

export const LogsUrls = {
    getLogs: (baseUrl) => createUrl(baseUrl, 'proxyLogs'),
    getLogsById: (baseUrl) => createUrl(baseUrl, 'proxyLogs/:id'),
    getEnvProjects: (baseUrl) => createUrl(baseUrl, 'getEnvProjects'),
};
