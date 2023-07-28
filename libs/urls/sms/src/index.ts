import { createUrl } from '@msg91/service';

export const SmsTemplateUrls = {
    getSenderIds: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getSenderIds'),
    // Get Urls
    getAllSmsTemplateUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/getAllSmsTemplate'),
    getTemplateVersions: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/getTemplateVersions'),
    getTemplateVersionDetails: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/getTemplateVersionDetails'),

    // Post Urls
    addTemplate: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/addTemplate'),
    addTemplateVersion: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/addTemplateVersion'),
    updateTemplateVersion: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/updateTemplateVersion'),
    markVersionActive: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/markActive'),
    testDLT: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/testDLT'),

    // Delete Urls
    deleteTemplateVersion: (baseUrl) => createUrl(baseUrl, 'api/v5/sms/deleteTemplateVersion'),
};

export const AuthKeyUrls = {
    getAllAuthenticationKeys: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getAllAuthenticationKeys'),
    generateAuthKey: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/generateAuthKey'),
    editNewAuthkey: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/editNewAuthkey'),
    deleteAuthkey: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/deleteAuthkey?authkey=:authkey'),
    getWhitelistedIPs: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getWhitelistedIPs'),
    enableDisableAuthkeyIPSecurity: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/enableDisableAuthkeyIPSecurity'),
    enableDisableAuthkey: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/enableDisableAuthkey'),
    addWhitelistIp: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/addWhitelistIp'),
    deleteWhitelistIP: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/deleteWhitelistIP'),
    getAllNonWhitelistedIPs: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getAllNonWhitelistedIPs'),
    apiPageAccessValidation: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/apiPageAccessValidation'),
    getIpSecuritySetting: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getIpSecuritySetting'),
    enableDisableIPSecurity: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/enableDisableIPSecurity'),
    getAuthenticationKeyActionDetails: (baseUrl) =>
        createUrl(baseUrl, 'api/v5/panel/getAuthenticationKeyActionDetails'),
    getAuthkeyUsecase: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/authkeyUsecase'),
};
