export const URLS = {
    AUDIO: {
        GET: `/files/`,
        UPLOAD: `/files/`,
        PREVIEW_TTS: `/preview-tts/`,
        PHONE_RECORD: `/phone-record/`,
    },
    DID_NUMBERS: {
        GET_ALL_LOGS: `/numbers/`,
        UPDATE_DID_NUMBER: `/did-assign/:id`,
        GET_COUNTRY: `/country/`,
        GET_NUMBERS: `/public-numbers/country/:id`,
        GET_TOLLFREE_NUMBERS: `/public-numbers/toll-free/:id`,
        GET_MOBILE_NUMBERS: `/public-numbers/mobile/:id`,
        GET_DID_NUMBERS_BY_CITY: `/public-numbers/city/:id`,
        BUY_NUMBER: `/buy-number/`,
        REQUEST_NUMBER: `/request-number/`,
    },
    FLOW: {
        GET_ALL_FLOW: `/flow/`,
        COPY_FLOW: `/flow/copy`,
        CONDITIONS: `/conditions`,
        CHANNEL_TYPES: `/channeltypes`,
        FETCH_ALL_CAMPAIGNS: `/campaigns?getAll=true`,
        CAMPAIGNS: `/campaigns`,
        CAMPAIGNS_V2: `/v2/campaigns`,
        FLOWACTION: `/:slug/flowActions`,
        EMAIL_TEMPLATE: `/templates?status_id=2`,
        GET_TEMPLATE: `/getTemplateList`,
        COPY_CAMPAIGN_FLOW: `/campaigns/:slug/copy`,
        CAMPAIGN_SNIPPET: `/campaigns/:slug/snippets?version=v2`,
        CAMPAIGN_FIELD: `/campaigns/:slug/fields`,
        DRY_RUN: `/campaigns/:slug/run`,
        CHECK_DRY_RUN: `/campaigns/:slug/dryrun`,
        FILTERS: `/conditions`,
        GET_PROJECT_ID_FOR_RCS_TEMPLATE: 'client-panel-template-dropdown/',
        FLOW_LOG_ACTIVITY: `/:slug/activity/:campaign_log_id?activity=:activity`,
        FLOW_ACTIVITY: `/:slug/activity?activity=:activity`,
        CAMPAIGN_REPORTS: `/analytics/campaigns`,
        GET_CAMPAIGN_NODES: `/campaigns/:slug/actionIds`,
        GET_REFERENCE_IDS: `/campaigns/:slug/refIds?campaignLogId=:campaignLogId`,
        ONE_API_CREATE_CAMPAIGN: `/channelCampaign`,
        GET_CAMPAIGN_VARIABLES: '/campaigns/:slug/variables?plugin=hubspot',
        GET_CAMPAIGN_LOGS_GROUPED_BY_PLUGIN_SOURCE: `/campaigns/:slug/logs`,
        GET_CSV_LOGS_BY_PLUGIN_SOURCE: `/:slug/campaignLogs?pluginsource=:source`,
        GET_PLUGIN_SOURCES: `/pluginsources?getAll=true`,
    },
};
