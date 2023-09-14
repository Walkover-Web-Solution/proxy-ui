import { createUrl } from '@proxy/service';

export const RootUrls = {
    getClientSettings: (baseUrl) => createUrl(baseUrl, 'getClientSettings'),
    getCompany: (baseUrl) => createUrl(baseUrl, 'getCompany'),
    switchCompany: (baseUrl) => createUrl(baseUrl, 'switchCompany'),
};
