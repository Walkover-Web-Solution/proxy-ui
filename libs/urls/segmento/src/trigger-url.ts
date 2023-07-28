import { createUrl } from '@msg91/service';

export const TriggerUrls = {
    getTriggersUrl: (baseUrl) => createUrl(baseUrl, 'segments/:segmentId/triggers'),
    createTriggerUrl: (baseUrl) => createUrl(baseUrl, 'segments/:segmentId/triggers'),
    getUpdateDeleteTrigger: (baseUrl) => createUrl(baseUrl, 'segments/:segmentId/triggers/:triggerId'),
    getTriggersLogs: (baseUrl) => createUrl(baseUrl, 'segments/:segmentId/triggersLogs'),
};
