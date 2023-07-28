import { createUrl } from '@msg91/service';

export const BillingUrls = {
    fetchCurrencies: (baseUrl) => createUrl(baseUrl, `currencies`),
    fetchMicroservices: (baseUrl) => createUrl(baseUrl, `microservices`),
    fetchDiscounts: (baseUrl) => createUrl(baseUrl, `discountTypes`),
    fetchServiceTypes: (baseUrl) => createUrl(baseUrl, `services`),
    fetchPlanTypes: (baseUrl) => createUrl(baseUrl, `planTypes`),
};

export const ClientUrls = {
    getCompanies: (baseUrl) => createUrl(baseUrl, `companies`),
    getPlans: (baseUrl) => createUrl(baseUrl, `getPlans`),
    fetchServiceCredits: (baseUrl) => createUrl(baseUrl, `services`),
    assignNewPlan: (baseUrl) => createUrl(baseUrl, `assignPlan`),
    fetchSubscriptionDetails: (baseUrl) => createUrl(baseUrl, `subscriptions`),
    fetchPlansForUpgradeDowngrade: (baseUrl) => createUrl(baseUrl, `companyPlans`),
    modifySubscription: (baseUrl) => createUrl(baseUrl, `companyPlans`),
    modifySubscriptionStatus: (baseUrl) => createUrl(baseUrl, `companyPlans/updateStatus`),
    calculateProRatedAmount: (baseUrl) => createUrl(baseUrl, `getProratedAmount?`),
    loadVoiceDidNumbers: (baseUrl) => createUrl(baseUrl, `numbers/`),
    checkIfGlobalNumberAssigned: (baseUrl) => createUrl(baseUrl, `company-settings/:companyId`),
    fetchWhatsappIntegratedNumbers: (baseUrl) => createUrl(baseUrl, `whatsapp-numbers/?assigned_dialplan=false`),
    fetchPlanServiceDetails: (baseUrl) => createUrl(baseUrl, `PlanServices/?plan_id=:plan_id`),
};

export const AdminPaymentLogsUrls = {
    getPaymentLogs: (baseUrl) => createUrl(baseUrl, `paymentLogs`),
    fetchPlans: (baseUrl) => createUrl(baseUrl, `getPlans`),
    retryPayment: (baseUrl) => createUrl(baseUrl, `paymentLogs/:id`),
    toggleRetryPayment: (baseUrl) => createUrl(baseUrl, `paymentLog/:id`),
};

export const SubscriptionUrls = {
    fetchSubscription: (baseUrl) => createUrl(baseUrl, `subscriptions`),
    fetchPlans: (baseUrl) => createUrl(baseUrl, `getPlans`),
    getClient: (baseUrl) => createUrl(baseUrl, 'clientSearch'),
    updateSubscriptionLimit: (baseUrl) => createUrl(baseUrl, 'companyPlans/:companyPlanId'),
};

export const BillingServicesUrls = {
    fetchServiceCredits: (baseUrl) => createUrl(baseUrl, `getServiceCredits`),
    createService: (baseUrl) => createUrl(baseUrl, `serviceCredits`),
    updateService: (baseUrl) => createUrl(baseUrl, `serviceCredits/:id`),
};

export const AdminPlanUrls = {
    fetchPlan: (baseUrl) => createUrl(baseUrl, `getPlans`),
    createPlan: (baseUrl) => createUrl(baseUrl, `plans`),
    updatePlan: (baseUrl) => createUrl(baseUrl, `plans/:id`),
    fetchServiceCredits: (baseUrl) => createUrl(baseUrl, `getServiceCredits`),
    loadVoiceDialPlans: (baseUrl) => createUrl(baseUrl, `dialplans/`),
    getAllDialPlans: (baseUrl) => createUrl(baseUrl, 'admin-panel-dialplan/'),
};

export const ClientTransactionLogsUrls = {
    fetchLogs: (baseUrl) => createUrl(baseUrl, `api/v5/panel/getTransactionLog`),
    fetchLedgerMagicLink: (baseUrl) => createUrl(baseUrl, `api/v5/panel/getLedgerMagicLink`),
};

export const AdminSubscriptionOperationPermissionUrls = {
    getAdminList: (baseUrl) => createUrl(baseUrl, 'getAdmins'),
    getAdminAllPermission: (baseUrl) => createUrl(baseUrl, 'allPermissions'),
    updateAdminPermission: (baseUrl) => createUrl(baseUrl, 'updateCompanyPermissions'),
    getLoggedInUser: (baseUrl) => createUrl(baseUrl, 'users/me'),
};
