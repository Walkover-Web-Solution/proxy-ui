import { createUrl } from '@proxy/service';

export const TeamUrls = {
    members: (baseUrl: string) => createUrl(baseUrl, 'users'),
    invite: (baseUrl: string) => createUrl(baseUrl, 'invite'),
    updateMemberRole: (baseUrl: string) => createUrl(baseUrl, 'updateUserRole'),
    myPermissions: (baseUrl: string) => createUrl(baseUrl, 'getUserPermissions'),
    rolePermissions: (baseUrl: string) => createUrl(baseUrl, 'rolePermissions'),
    apiKeys: (baseUrl: string) => createUrl(baseUrl, 'authentications'),
    apiKey: (baseUrl: string, id: number) => createUrl(baseUrl, `authentications/${encodeURIComponent(String(id))}`),
};
