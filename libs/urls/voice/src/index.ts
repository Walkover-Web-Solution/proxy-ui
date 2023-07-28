import { createUrl } from '@msg91/service';

export const VoiceDialPlanUrls = {
    fetchUserDialPlans: (baseUrl) => createUrl(baseUrl, `dialplans/`),
    fetchVendorDialPlans: (baseUrl) => createUrl(baseUrl, `vendors/`),
    fetchCurrencies: (baseUrl) => createUrl(baseUrl, `currencies`),
    createUserDialPlan: (baseUrl) => createUrl(baseUrl, `dialplans/`),
    createVendorDialPlan: (baseUrl) => createUrl(baseUrl, `vendors/`),
    deleteUserDialPlan: (baseUrl) => createUrl(baseUrl, `dialplans/`),
    deleteVendorDialPlan: (baseUrl) => createUrl(baseUrl, `vendors/`),
    fetchUserDialPlanDetails: (baseUrl) => createUrl(baseUrl, `dialplans/`),
    fetchVendorDialPlanDetails: (baseUrl) => createUrl(baseUrl, `vendors/`),
    exportUserDialPlanCsv: (baseUrl) => createUrl(baseUrl, `dialplans/`),
    exportVendorDialPlanCsv: (baseUrl) => createUrl(baseUrl, `vendors/`),
    didNumberAndDialPlanAssignment: (baseUrl) => createUrl(baseUrl, `assign-dialplan/`),
};
