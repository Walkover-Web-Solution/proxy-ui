import { createUrl } from '@msg91/service';

export const SegmentoUrls = {
    getAllPhoneBooksUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks'),
    getSegmentoCampaignListsUrl: (baseUrl) => createUrl(baseUrl, 'campaigns'),
    getSegmentsUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/segments'),
    getAllInboxesUrl: (baseUrl) => createUrl(baseUrl, 'v2/inbox/'),
    getCustomAttributesUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/fields'),
    getAllContactsUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/contacts/filters'),
    getCampaignFieldsUrl: (baseUrl) => createUrl(baseUrl, 'campaigns/:slug/fields'),
    runCampaignUrl: (baseUrl, phoneBookId, segmentId) => {
        if (segmentId) {
            return createUrl(baseUrl, `phonebooks/${phoneBookId}/segments/${segmentId}/communications`);
        } else {
            return createUrl(baseUrl, `phonebooks/${phoneBookId}/communications`);
        }
    },
    dryRunCampaignUrl: (baseUrl) => createUrl(baseUrl, 'campaigns/:slug/dryrun'),
    runCampaignWithCsv: (baseUrl) => createUrl(baseUrl, 'campaigns/:slug/run'),
    getEmailTemplateDetails: (baseUrl) => createUrl(baseUrl, 'templates/'),
    getSmsTemplateDetails: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/getAllSmsTemplate'),
    getWhatsappTemplateDetails: (baseUrl) => createUrl(baseUrl, 'get-template/:number/'),
    getCampaignTemplates: (baseUrl) => createUrl(baseUrl, 'campaigns/:slug/templates/'),
    segmentoRegisterUser: (baseUrl) => createUrl(baseUrl, 'api/v5/segmento/register/'),
};
