import { createUrl } from '@proxy/service';
export const CreatProjectUrl = {
    createProject: (baseUrl) => createUrl(baseUrl, 'projects'),
    getEnvironment: (baseUrl) => createUrl(baseUrl, 'environments'),
    createSource: (baseUrl) => createUrl(baseUrl, 'sourceDomains'),
    updateProject: (baseUrl) => createUrl(baseUrl, 'projects'),
    getClient: (baseUrl) => createUrl(baseUrl, 'clients'),
};
