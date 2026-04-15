import { createUrl } from '@proxy/service';

export const AnalyticsUrls = {
    overview: (baseUrl: string) => createUrl(baseUrl, 'analytics/overview'),
    timeseries: (baseUrl: string) => createUrl(baseUrl, 'analytics/timeseries'),
    breakdown: (baseUrl: string) => createUrl(baseUrl, 'analytics/breakdown'),
};
