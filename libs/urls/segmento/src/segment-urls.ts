import { createUrl } from '@msg91/service';

export const SegmentUrls = {
    getSegmentsUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/segments'),
    getArchivedSegmentsUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/segments?onlyTrashed=1'),
    getSegmentsDataUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/segments'),
    getSegmentDetailUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/segments/:segmentId'), // not in used
    addSegmentUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/segments'),
    updateSegmentUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/segments/:segmentId'),
    restoreSegmentUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/segments/:segmentId/restore'),
    getExportUrlForSegmentFileUrl: (baseUrl) =>
        createUrl(baseUrl, 'phonebooks/:phoneBookId/segments/:segmentId/export'),
    getCommunicationTypesUrl: (baseUrl) => createUrl(baseUrl, 'communicationTypes'),
    communication: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/communications'),
    communicationForSegment: (baseUrl) =>
        createUrl(baseUrl, 'phonebooks/:phoneBookId/segments/:segmentId/communications'),
    communicationStatues: (baseUrl) => createUrl(baseUrl, 'communicationStatuses'),
};
