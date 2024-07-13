import { createUrl } from '@proxy/service';
import { update } from 'lodash';
export const CreatProjectUrl = {
    createProject: (baseUrl) => createUrl(baseUrl, 'projects'),
    getEnvironment: (baseUrl) => createUrl(baseUrl, 'environments'),
    createSource: (baseUrl) => createUrl(baseUrl, 'sourceDomains'),
    updateProject: (baseUrl) => createUrl(baseUrl, 'projects'),
};
