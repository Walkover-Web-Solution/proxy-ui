import { createUrl } from '@msg91/service';

export const ReportSummaryUrls = {
    getAllCampaigns: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/getAllCampaigns'),
    getSummaryReport: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/getSummaryReport'),
    exportSummaryReport: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/exportSummaryReport'),
    getWeeklyUserReports: (baseUrl) => createUrl(baseUrl, 'api/v5/otp/getWeeklyUserReports'),
};
