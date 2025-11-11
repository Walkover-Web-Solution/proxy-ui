import { createUrl } from '@proxy/service';

export const FeaturesUrls = {
    getFeature: (baseUrl) => createUrl(baseUrl, 'features'),
    getFeatureType: (baseUrl) => createUrl(baseUrl, 'getFeatures'),
    getMethodService: (baseUrl) => createUrl(baseUrl, 'getMethodsService/:id'),
    getLagoFeature: (baseUrl) => createUrl(baseUrl, 'features'),
    getBillableMetrics: (baseUrl, refId) => createUrl(baseUrl, `subscription/${refId}/billableMetrics`),
    updateBillableMetric: (baseUrl, refId, code) => createUrl(baseUrl, `subscription/${refId}/billableMetrics/${code}`),
    deleteBillableMetric: (baseUrl, refId, code) => createUrl(baseUrl, `subscription/${refId}/billableMetrics/${code}`),
    getBillableMetricForm: (baseUrl) => createUrl(baseUrl, 'getBillableMetricForm'),
    getPlansForm: (baseUrl, refId) => createUrl(baseUrl, `subscription/${refId}/plans`),
    getTaxes: (baseUrl, refId) => createUrl(baseUrl, `subscription/${refId}/taxes`),
    createTax: (baseUrl, refId) => createUrl(baseUrl, `subscription/${refId}/taxes`),
    deleteTax: (baseUrl, refId, code) => createUrl(baseUrl, `subscription/${refId}/taxes/${code}`),
    createPlan: (baseUrl, refId) => createUrl(baseUrl, `subscription/${refId}/plans`),
    updatePlan: (baseUrl, refId, code) => createUrl(baseUrl, `subscription/${refId}/plans/${code}`),
    deletePlan: (baseUrl, refId, code) => createUrl(baseUrl, `subscription/${refId}/plans/${code}`),
    getPaymentDetailsForm: (baseUrl) => createUrl(baseUrl, `paymentCredentialsForm`),
    getPaymentDetailsFormById: (baseUrl, refid) => createUrl(baseUrl, `${refid}/paymentForm`),
    updatePaymentDetails: (baseUrl, refid) => createUrl(baseUrl, `subscription/${refid}/updateCredentials`),
};
