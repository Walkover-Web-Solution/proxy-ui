import { createUrl } from '@proxy/service';

export const AnalyticsUrls = {
    overview: (baseUrl: string) => createUrl(baseUrl, 'analytics/overview'),
    timeseries: (baseUrl: string) => createUrl(baseUrl, 'analytics/timeseries'),
    activeUsers: (baseUrl: string) => createUrl(baseUrl, 'analytics/active-users'),
    breakdown: (baseUrl: string) => createUrl(baseUrl, 'analytics/breakdown'),
};
