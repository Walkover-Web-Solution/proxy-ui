import { createUrl } from '../../base-url';

export const AdminHelloUrls = {
    authentication: (baseUrl) => createUrl(baseUrl, `admin/login/`),
    getClient: (baseUrl, param) => createUrl(baseUrl, `admin/client/?${param}`),
    updateClient: (baseUrl, id) => createUrl(baseUrl, `admin/client/${id}`),
    getClientWithId: (baseUrl, id) => createUrl(baseUrl, `admin/client/${id}`),
    getCount: (baseUrl, param) => createUrl(baseUrl, `admin/count/?${param}`),
    getCountWithId: (baseUrl, id) => createUrl(baseUrl, `admin/count/${id}`),
    getDashboard: (baseUrl, param, id = null) => createUrl(baseUrl, `admin/concurrent/${id}?${param}`),
    getReportGraph: (baseUrl) => createUrl(baseUrl, `admin/analytics/`),
};
