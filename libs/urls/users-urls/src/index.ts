import { createUrl } from '@proxy/service';

export const UsersUrl = {
    getUsers: (baseUrl) => createUrl(baseUrl, 'clientUsers'),
    register: (baseUrl) => createUrl(baseUrl, 'register'),
    getRoles: (baseUrl) => createUrl(baseUrl, ':referenceId/cRoles'),
    createRole: (baseUrl) => createUrl(baseUrl, ':referenceId/cRoles'),
    updateRole: (baseUrl) => createUrl(baseUrl, ':referenceId/cRoles/:id'),
    deleteRole: (baseUrl) => createUrl(baseUrl, ':referenceId/cRoles/:id'),
    getPermissions: (baseUrl) => createUrl(baseUrl, ':referenceId/cPermission'),
    createPermission: (baseUrl) => createUrl(baseUrl, ':referenceId/cPermission'),
    deletePermission: (baseUrl) => createUrl(baseUrl, ':referenceId/cPermission/:id'),
    updatePermission: (baseUrl) => createUrl(baseUrl, ':referenceId/cPermission/:id'),
};
