import { createUrl } from '../../base-url';

export const AdminVoiceDashboardUrls = {
    getDashboardData: (baseUrl) => createUrl(baseUrl, 'reports/'),
};
