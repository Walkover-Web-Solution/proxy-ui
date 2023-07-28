import { createUrl } from '@msg91/service';

export const PaymentMethodUrls = {
    getPaymentGateways: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getPaymentGateways'),
    getPriceList: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getPriceList'),
    makeOrder: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/makeOrder'),
    makePayment: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/makePayment'),
    getExtraBenefit: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/paymentOffers'),
    getCountrySlabPrice: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getCountrySlabPrice'),

    stripeSubscription: (baseUrl) => createUrl(baseUrl, 'api/v5/paymentAutomation/stripe/subscribe/'),
    stripeUpdateSubscription: (baseUrl) => createUrl(baseUrl, 'api/v5/paymentAutomation/stripe/updateSubscription/'),
    stripeGetSubscription: (baseUrl) => createUrl(baseUrl, 'api/v5/paymentAutomation/stripe/getSubscriptionDetails/'),
    stripeGetLinkForAddSubscription: (baseUrl) =>
        createUrl(baseUrl, 'api/v5/paymentAutomation/stripe/initiateManualPayment/'),

    cashFreeSubscription: (baseUrl) => createUrl(baseUrl, 'api/v5/paymentAutomation/cashfree/autoRecharge'),
    cashFreeGetSubscription: (baseUrl) => createUrl(baseUrl, 'api/v5/paymentAutomation/cashfree/autoRecharge'),
    cashFreeCancelSubscription: (baseUrl) => createUrl(baseUrl, 'api/v5/paymentAutomation/cashfree/cancelSubscription'),
    cashFreeGetAllSubscription: (baseUrl) =>
        createUrl(baseUrl, 'api/v5/paymentAutomation/cashfree/getAllSubscriptions'),
    cashFreeUpdateSubscription: (baseUrl) => createUrl(baseUrl, 'api/v5/paymentAutomation/cashfree/autoRecharge'),

    cashFreeMandate: (baseUrl) => createUrl(baseUrl, 'api/v5/paymentAutomation/cashfree/eMandate'),
    removeCashFreeMandate: (baseUrl) => createUrl(baseUrl, 'api/v5/paymentAutomation/cashfree/eMandate?mandateId=:Id'),
    mandatePayment: (baseUrl) => createUrl(baseUrl, 'api/v5/paymentAutomation/cashfree/mandatePayment'),
};
