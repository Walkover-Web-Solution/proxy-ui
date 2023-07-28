import { createUrl } from '@msg91/service';

export const ReportUrls = {
    getDomainMailStatusDayWise: (baseUrl) => createUrl(baseUrl, 'reports-day-wise'),
    exportDomainMailStatusDayWise: (baseUrl) => createUrl(baseUrl, 'reports-day-wise/export'),
    getUsersDomainsMailStatus: (baseUrl) => createUrl(baseUrl, 'reports-event-wise'),
    fetchEmailReports: (baseUrl) => createUrl(baseUrl, `analytics/mail`),
    exportEmailReports: (baseUrl) => createUrl(baseUrl, `analytics/mail/export`),
    // exportEmailReports: (baseUrl) => createUrl(baseUrl, `exports/mail`),
};
