import { createUrl } from '@proxy/service';

export const FeaturesUrls = {
    getFeature: (baseUrl) => createUrl(baseUrl, 'features'),
    getFeatureType: (baseUrl) => createUrl(baseUrl, 'getFeatures'),
    getMethodService: (baseUrl) => createUrl(baseUrl, 'getMethodsService/:id'),
    getLagoFeature: (baseUrl) => createUrl(baseUrl, 'features'),
    getBillableMetrics: (baseUrl, refId) => createUrl(baseUrl, `lago/${refId}/billable-metrics`),
    updateBillableMetric: (baseUrl, refId) => createUrl(baseUrl, `lago/${refId}/billable-metrics/storage_1`),
    deleteBillableMetric: (baseUrl, refId) => createUrl(baseUrl, `lago/${refId}/billable-metrics/storage`),
    getBillableMetricForm: (baseUrl) => createUrl(baseUrl, 'getBillableMetricForm'),
};
