import { createUrl } from '@proxy/service';

export const LogsUrls = {
    getLogs: (baseUrl) => createUrl(baseUrl, 'proxyLogs'),
    getEnvProjects: (baseUrl) => createUrl(baseUrl, 'getEnvProjects')
}