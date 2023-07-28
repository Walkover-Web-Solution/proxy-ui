import { createUrl } from '@msg91/service';

export const AudioUrls = {
    getAudio: (baseUrl) => createUrl(baseUrl, `files/`),
    uploadAudio: (baseUrl) => createUrl(baseUrl, `files/`),
    previewTTS: (baseUrl) => createUrl(baseUrl, `preview-tts/`),
    phoneRecord: (baseUrl) => createUrl(baseUrl, `phone-record/`),
};

export const DidNumbersUrls = {
    getAllLogs: (baseUrl) => createUrl(baseUrl, `numbers/`),
    updateDidNumbers: (baseUrl) => createUrl(baseUrl, `did-assign/:id`),
    getCountry: (baseUrl) => createUrl(baseUrl, `country/`),
    getNumbers: (baseUrl) => createUrl(baseUrl, `public-numbers/country/:id`),
    getTollFreeNumbers: (baseUrl) => createUrl(baseUrl, `public-numbers/toll-free/:id`),
    getMobileNumbers: (baseUrl) => createUrl(baseUrl, `public-numbers/mobile/:id`),
    getDidNumbersByCity: (baseUrl) => createUrl(baseUrl, `public-numbers/city/:id`),
    buyNumber: (baseUrl) => createUrl(baseUrl, `buy-number/`),
    requestNumber: (baseUrl) => createUrl(baseUrl, `request-number/`),
};

export const FlowUrls = {
    getAllFlows: (baseUrl) => createUrl(baseUrl, `flow/`),
    copyFlow: (baseUrl) => createUrl(baseUrl, `copy-flow/`),
    conditions: (baseUrl) => createUrl(baseUrl, `conditions`),
    channelTypes: (baseUrl) => createUrl(baseUrl, `channeltypes`),
    fetchAllCampaigns: (baseUrl) => createUrl(baseUrl, `campaigns?getAll=true`),
    campaigns: (baseUrl) => createUrl(baseUrl, `campaigns`),
    campaignsV2: (baseUrl) => createUrl(baseUrl, `v2/campaigns`),
    flowActions: (baseUrl) => createUrl(baseUrl, `:slug/flowActions`),
    emailTemplate: (baseUrl) => createUrl(baseUrl, `templates?status_id=2`),
    getTemplate: (baseUrl) => createUrl(baseUrl, `getTemplateList`),
    copyCampaignFlow: (baseUrl) => createUrl(baseUrl, `campaigns/:slug/copy`),
    campaignSnippet: (baseUrl) => createUrl(baseUrl, `campaigns/:slug/snippets?version=v2`),
    campaignField: (baseUrl) => createUrl(baseUrl, `campaigns/:slug/fields`),
    dryRun: (baseUrl) => createUrl(baseUrl, `campaigns/:slug/run`),
    checkDryRun: (baseUrl) => createUrl(baseUrl, `campaigns/:slug/dryrun`),
    filters: (baseUrl) => createUrl(baseUrl, `conditions`),
    getProjectIdForRcsTemplate: (baseUrl) => createUrl(baseUrl, `client-panel-template-dropdown/`),
    flowLogActivity: (baseUrl) => createUrl(baseUrl, `:slug/activity/:campaign_log_id?activity=:activity`),
    flowActivity: (baseUrl) => createUrl(baseUrl, `:slug/activity?activity=:activity`),
    campaignReports: (baseUrl) => createUrl(baseUrl, `analytics/campaigns`),
    getCampaignNodes: (baseUrl) => createUrl(baseUrl, `campaigns/:slug/actionIds`),
};
