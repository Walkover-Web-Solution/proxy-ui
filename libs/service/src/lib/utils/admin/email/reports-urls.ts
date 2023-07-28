import { createUrl } from '../../base-url';

export const AdminReportsUrls = {
    getReportsDashboard: (baseUrl) => createUrl(baseUrl, 'total-reports'),
    getReportsIp: (baseUrl) => createUrl(baseUrl, 'ip-reports'),
    getReportsTemplate: (baseUrl) => createUrl(baseUrl, 'template-reports'),
    exportIpReport: (baseUrl) => createUrl(baseUrl, 'ip-reports/export'),
    exportTemplateReport: (baseUrl) => createUrl(baseUrl, 'template-reports/export'),
    getEmailClientList: (baseUrl) => createUrl(baseUrl, 'users'),
};
