import { createUrl } from '@msg91/service';

export const SupressionUrls = {
    getEmailByEventTypeUrl: (baseUrl) => createUrl(baseUrl, 'delivery-status'),
    getRemoveUnsubscribeUrl: (baseUrl) => createUrl(baseUrl, 'unsubscribes/bulk-remove'),
    getUnsubscribeUrl: (baseUrl) => createUrl(baseUrl, 'unsubscribes'),
    getRecipientsUrl: (baseUrl) => createUrl(baseUrl, 'domain-recipients'),
    deleteRecipients: (baseUrl) => createUrl(baseUrl, 'domain-recipients/bulk-remove'),
    exportUnsubscribeUrl: (baseUrl) => createUrl(baseUrl, 'unsubscribes/export'),
    exportEmailByEventTypeUrl: (baseUrl) => createUrl(baseUrl, 'delivery-status/export'),
    addRecipientsUrl: (baseUrl) => createUrl(baseUrl, 'domain-recipients'),
    addCSVRecipientsUrl: (baseUrl) => createUrl(baseUrl, 'domain-recipients/import'),
};
