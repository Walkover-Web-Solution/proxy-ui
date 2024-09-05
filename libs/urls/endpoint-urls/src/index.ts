import { createUrl } from '@proxy/service';
export const EndpointUrl = {
    getEnvProject: (baseUrl) => createUrl(baseUrl, 'getEnvProjects'),
    projectUrl: (baseUrl) => createUrl(baseUrl, 'projects'),
    verficationIntegration: (baseUrl) => createUrl(baseUrl, 'integrations'),
};
