import { createUrl } from '@msg91/service';

export const DialPlanUrls = {
    getAllDialPlans: (baseUrl) => createUrl(baseUrl, 'admin-panel-dialplan/'),
    createDialPlans: (baseUrl) => createUrl(baseUrl, 'admin-panel-dialplan/'),
    deleteDialPlan: (baseUrl) => createUrl(baseUrl, 'admin-panel-dialplan/'),
    getDialPlanDetails: (baseUrl) => createUrl(baseUrl, 'admin-panel-dialplan/'),
    createDialPlanPricing: (baseUrl) => createUrl(baseUrl, 'admin-panel-dialplan/'),
    updateDialPlanPricing: (baseUrl) => createUrl(baseUrl, 'admin-panel-dialplan/'),
    getCurrencies: (baseUrl) => createUrl(baseUrl, 'admin-panel-dialplan-dropdown/'),
};
