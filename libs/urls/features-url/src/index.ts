import { createUrl } from '@proxy/service';

export const FeaturesUrls = {
    getFeature: (baseUrl) => createUrl(baseUrl, 'features'),
    getFeatureType: (baseUrl) => createUrl(baseUrl, 'getFeatures'),
    getMethod: (baseUrl) => createUrl(baseUrl, 'getMethodsService/:id'),
};
