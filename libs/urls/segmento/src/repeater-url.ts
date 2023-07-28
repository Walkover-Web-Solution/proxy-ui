import { createUrl } from '@msg91/service';

export const RepeaterUrls = {
    repeaterFrequencies: (baseUrl) => createUrl(baseUrl, 'repeaterFrequencies'),
    repeatersUrl: (baseUrl) => createUrl(baseUrl, 'segments/:segmentId/repeaters'),
    getRepeaterUrl: (baseUrl) => createUrl(baseUrl, 'segments/:segmentId/repeaters/:repeaterId'),
    getRepeaterLogsUrl: (baseUrl) => createUrl(baseUrl, 'repeaters/:repeaterId/logs'),
    getRepeaterStatus: (baseUrl) => createUrl(baseUrl, 'repeaterStatuses'),
    getRepeatersLogs: (baseUrl) => createUrl(baseUrl, 'segments/:segmentId/repeatersLogs'),
};
