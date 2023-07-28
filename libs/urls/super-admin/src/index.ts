import { createUrl } from '@msg91/service';

export const SuperAdminUrls = {
    getUsersList: (baseUrl) => createUrl(baseUrl, 'users'),
    updateUser: (baseUrl) => createUrl(baseUrl, 'users/:userID'),
    getMicroservices: (baseUrl) => createUrl(baseUrl, 'microservices'),
    getPermissions: (baseUrl) => createUrl(baseUrl, 'permissions'),
    updatePermission: (baseUrl) => createUrl(baseUrl, 'permissions/:permissionId'),
    getLogs: (baseUrl) => createUrl(baseUrl, 'proxyLogs/:route'),
};
