import { createUrl } from '@msg91/service';

export const LogsUrls = {
    getLogs: (baseUrl) => createUrl(baseUrl, 'proxyLogs')
}