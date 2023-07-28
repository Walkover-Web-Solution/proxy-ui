import { createUrl } from '@msg91/service';

export const ShortUrlsList = {
    generateURL: (baseUrl) => createUrl(baseUrl, 'api/links'),
    noOfLinkGenerated: (baseUrl) => createUrl(baseUrl, 'api/links/users?'),
    getLinkGeneratedByUser: (baseUrl) => createUrl(baseUrl, 'api/getUserUrl?'),
    updateLinkExpiry: (baseUrl) => createUrl(baseUrl, 'api/updateExpiry'),
    getURLLogs: (baseUrl) => createUrl(baseUrl, 'api/getUrlLogs?'),
    getTotalClicksCount: (baseUrl) => createUrl(baseUrl, 'api/getTotalClicks?'),
    getClickDetails: (baseUrl) => createUrl(baseUrl, 'api/getClickDetails?'),
    getShortUrlSetting: (baseUrl) => createUrl(baseUrl, 'getShortUrlSetting'),
    updateShortUrlSetting: (baseUrl) => createUrl(baseUrl, 'updateShortUrlSetting'),
    exportReport: (baseUrl) => createUrl(baseUrl, 'api/exportReport'),
};
