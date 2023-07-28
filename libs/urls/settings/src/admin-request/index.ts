import { createUrl } from '@msg91/service';

export const AdminRequestUrls = {
    getAllAdminLoginRequests: (baseUrl: string) => createUrl(baseUrl, 'api/v5/panel/getAllAdminLoginRequests'),
    approveAdminLoginRequest: (baseUrl: string) => createUrl(baseUrl, 'api/v5/panel/approveAdminLoginRequest'),
    declineAdminLoginRequest: (baseUrl: string) => createUrl(baseUrl, 'api/v5/panel/declineAdminLoginRequest'),
};
