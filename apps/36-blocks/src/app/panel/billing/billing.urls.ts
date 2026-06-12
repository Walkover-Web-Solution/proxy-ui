import { createUrl } from '@proxy/service';

export const BillingUrls = {
    getPlans: (baseUrl: string) => createUrl(baseUrl, 'v1/billing/plans'),
    getPlanByCode: (baseUrl: string, planCode: string) =>
        createUrl(baseUrl, `v1/billing/plans/${encodeURIComponent(planCode)}`),
    getSubscriptionStatus: (baseUrl: string) => createUrl(baseUrl, 'v1/billing/subscription/status'),
    getSubscriptionUsage: (baseUrl: string) => createUrl(baseUrl, 'v1/billing/subscription/usage'),
    createCustomer: (baseUrl: string) => createUrl(baseUrl, 'v1/billing/customer'),
    upgradeSubscription: (baseUrl: string) => createUrl(baseUrl, 'v1/billing/subscription/upgrade'),
    addPaymentMethod: (baseUrl: string) => createUrl(baseUrl, 'v1/billing/customer/checkout-url'),
    getPaymentMethods: (baseUrl: string) => createUrl(baseUrl, 'v1/billing/customer/payment-methods'),
    setDefaultPaymentMethod: (baseUrl: string) => createUrl(baseUrl, 'v1/billing/customer/default-payment-method'),
};
