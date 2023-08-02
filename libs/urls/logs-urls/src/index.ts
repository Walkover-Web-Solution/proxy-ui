import { createUrl } from '@proxy/service';

export const LogsUrls = {
    getLogs: (baseUrl) => createUrl(baseUrl, 'proxyLogs')
}