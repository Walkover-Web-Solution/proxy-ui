import { createUrl } from '@msg91/service';

export const webhookUrls = {
    getAllWebhookUrl: (baseUrl) => createUrl(baseUrl, 'webhooks'),
    addWebhookUrl: (baseUrl) => createUrl(baseUrl, 'webhooks'),
    getWebhookByIdUrl: (baseUrl) => createUrl(baseUrl, 'webhooks/:webhookId'),
};
