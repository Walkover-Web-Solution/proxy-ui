import { createUrl } from '@proxy/service';

export const RootUrls = {
    getClientSettings: (baseUrl) => createUrl(baseUrl, 'getClientSettings'),
    getClients: (baseUrl) => createUrl(baseUrl, 'clients'),
    switchClient: (baseUrl) => createUrl(baseUrl, 'switchclient'),
};
