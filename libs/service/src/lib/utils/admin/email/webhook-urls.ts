import { createUrl } from '../../base-url';

export const AdminEmailWebhookUrls = {
    getAllWebhooks: (baseUrl) => createUrl(baseUrl, 'webhooks?with=user'),
    webhook: (baseUrl) => createUrl(baseUrl, 'webhooks/:webhook_id'),
};
