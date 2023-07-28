import { createUrl } from '../base-url';

export const RootUrls = {
    getClient: (baseUrl) => createUrl(baseUrl, 'clientSearch'),
};
