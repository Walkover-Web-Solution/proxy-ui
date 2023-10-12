import { createUrl } from '@proxy/service';

export const LogsUrls = {
    getLogs: (baseUrl) => createUrl(baseUrl, 'proxyLogs'),
    getLogsById: (baseUrl) => createUrl(baseUrl, 'proxyLogs/:id'),
    getEnvironment: (baseUrl) => createUrl(baseUrl, 'environments'),
    getProjects: (baseUrl) => createUrl(baseUrl, 'projects'),
};
