import { createUrl } from '@msg91/service';

export const DomainUrls = {
    getAllDomainsUrl: (baseUrl) => createUrl(baseUrl, 'domains'),
    addDomainUrl: (baseUrl) => createUrl(baseUrl, 'domains'),
    verifyDomainUrl: (baseUrl) => createUrl(baseUrl, 'domains/verify'),
    updateSettingUrl: (baseUrl) => createUrl(baseUrl, 'settings/:settingId'),
    domainURL: (baseUrl) => createUrl(baseUrl, 'domains/:domainId'),
    sendRecords: (baseUrl) => createUrl(baseUrl, 'send-records'),
    updateSMTPData: (baseUrl) => createUrl(baseUrl, 'smtp-credentials/:smtpId'),
    activateSMTP: (baseUrl) => createUrl(baseUrl, 'smtp-credentials'),
    mailTypes: (baseUrl) => createUrl(baseUrl, 'mail-types'),
};
