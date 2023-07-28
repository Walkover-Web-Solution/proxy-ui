import { createUrl } from '../../base-url';

export const AdminRCSUrls = {
    getClients: (baseUrl) => createUrl(baseUrl, `rcs-admin-panel/client/`),
    getLogs: (baseUrl) => createUrl(baseUrl, `rcs-admin-panel/log/`),
    getDashboardData: (baseUrl) => createUrl(baseUrl, `rcs-admin-panel/dashboard/`),
    getLogDropDownData: (baseUrl) => createUrl(baseUrl, `admin-panel-log-dropdown/`),
};
