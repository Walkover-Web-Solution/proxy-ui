import { createUrl } from '../../base-url';

export const AdminEmailDashboardUrls = {
    getReportEventWise: (baseUrl) => createUrl(baseUrl, 'reports-event-wise'),
    getGraphData: (baseUrl) => createUrl(baseUrl, 'graph-report'),
    // getGraphData: (baseUrl) => createUrl(baseUrl, 'graph-report?from_date_time=:from_date_time&to_date_time=:to_date_time')
    getNewGraphData: (baseUrl) => createUrl(baseUrl, 'reports-graph-wise'),
};
