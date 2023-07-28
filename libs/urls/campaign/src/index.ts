import { createUrl } from '@msg91/service';

export const CampaignUrls = {
    registerUser: (baseUrl) => createUrl(baseUrl, '/api/v5/services/campaignRegistration'),
    getAllCampaignTypes: (baseUrl) => createUrl(baseUrl, 'channeltypes'),
    getTemplatesByTypes: (baseUrl) => createUrl(baseUrl, 'channeltypes/:campaignTypeId/templates'),
    getTemplateDetail: (baseUrl) => createUrl(baseUrl, 'channeltypes/:campaignTypeId/templates/:templateId'),
    getEmailDomains: (baseUrl) => createUrl(baseUrl, 'email/domains'),
    campaigns: (baseUrl) => createUrl(baseUrl, 'campaigns'), // for create campaign and get all campaign
    getAndUpdateCampaign: (baseUrl) => createUrl(baseUrl, 'campaigns/:campaignId'),
    tokens: (baseUrl) => createUrl(baseUrl, 'tokens'), // create token and get all tokens
    getAndUpdateToken: (baseUrl) => createUrl(baseUrl, 'tokens/:tokenId'),
    updateTokenAssociate: (baseUrl) => createUrl(baseUrl, 'tokens/:tokenId/associate'),
    tokenIps: (baseUrl) => createUrl(baseUrl, 'tokens/:tokenId/ips'),
    removeTokenIps: (baseUrl) => createUrl(baseUrl, 'tokens/:tokenId/ips/:ipId'),
    ipTypes: (baseUrl) => createUrl(baseUrl, 'iptypes'),
    campaignWiseSnippet: (baseUrl) => createUrl(baseUrl, 'campaigns/:campaignId/snippets?version=v2'),
    runCampaign: (baseUrl) => createUrl(baseUrl, 'campaigns/:campaignId/run'),
    getCampaignReport: (baseUrl) => createUrl(baseUrl, 'campaigns/:campaignId/reports'),
    getCampaignLogs: (baseUrl) => createUrl(baseUrl, ':slug/campaignLogs?with=source'),
    getActionLogs: (baseUrl) => createUrl(baseUrl, ':slug/campaignLogs/:id'),
    getRecordActionLogs: (baseUrl) => createUrl(baseUrl, 'campaigns/:slug/actionLogs/:id'),
    getStatusList: (baseUrl) => createUrl(baseUrl, 'status?field=:field'),
    getCompanyCampaignLogs: (baseUrl) => createUrl(baseUrl, 'companyLogs'),
    getPluginSource: (baseUrl) => createUrl(baseUrl, 'pluginsources?getAll=true'),
    getCampaignAnalytics: (baseUrl) => createUrl(baseUrl, 'analytics/campaigns'),
    getRefIds: (baseUrl) => createUrl(baseUrl, 'campaigns/:slug/refIds'),
    getNodeName: (baseUrl) => createUrl(baseUrl, 'campaigns/:slug/nodeDetails'),
    getCampaignLogData: (baseUrl) => createUrl(baseUrl, ':slug/campaignLogs?with=source&logId=:logId'),
    getGroupCompanyLogs: (baseUrl) => createUrl(baseUrl, 'groupCompanyLogs'),
};
