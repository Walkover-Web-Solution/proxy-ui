import { createUrl } from '../../base-url';

export const AdminEmailOperationPermissionUrls = {
    getAdminList: (baseUrl) => createUrl(baseUrl, 'users'),
    getAdminAllPermission: (baseUrl) => createUrl(baseUrl, 'allPermissions'),
    updateAdminPermission: (baseUrl) => createUrl(baseUrl, 'users/:userId'),
    getLoggedInUser: (baseUrl) => createUrl(baseUrl, 'users/me'),
    getQueuedMail: (baseUrl) => createUrl(baseUrl, 'operations/queued-mails?with=domain'),
    moveMails: (baseUrl) => createUrl(baseUrl, 'operations/move-mails'),
    changeQueueStatus: (baseUrl) => createUrl(baseUrl, 'operations/change-queue-status'),
    getListQuickReports: (baseUrl) => createUrl(baseUrl, 'list-quick-reports'),
    getQuickReports: (baseUrl) => createUrl(baseUrl, 'get-quick-reports'),
};
