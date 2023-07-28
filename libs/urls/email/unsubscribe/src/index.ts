import { createUrl } from '@msg91/service';

export const UnsubscribeUrls = {
    getUnsubscribeDataUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/email/p/unsubscribe/:id/:email'),
    addUnsubscribeUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/email/p/unsubscribe'),
    getUnsubscribeV2DataUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/email/p/v2/unsubscribe/:id/:email'),
    addUnsubscribeV2Url: (baseUrl) => createUrl(baseUrl, 'api/v5/email/p/v2/unsubscribe'),
};
