import { createUrl } from '@msg91/service';

export const DashboardUrls = {
    getUsersDomainsMailStatus: (baseUrl) => createUrl(baseUrl, 'reports-event-wise'),
    getGraphData: (baseUrl) => createUrl(baseUrl, 'reports/graph-report'),
};
