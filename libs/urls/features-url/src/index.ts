import { createUrl } from '@proxy/service';

export const FeaturesUrls = {
    getFeature: (baseUrl) => createUrl(baseUrl, 'features'),
    getFeatureType: (baseUrl) => createUrl(baseUrl, 'getFeatures'),
    getMethodService: (baseUrl) => createUrl(baseUrl, 'getMethodsService/:id'),
};
