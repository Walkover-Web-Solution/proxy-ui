import { createUrl } from '@msg91/service';

export const RcsUrls = {
    createRcsIntegration: (baseUrl) => createUrl(baseUrl, 'rcs-integration/'),
    getRcsIntegration: (baseUrl) => createUrl(baseUrl, 'rcs-integration/'),
    getRcsIntegrationImageById: (baseUrl) => createUrl(baseUrl, 'rcs-integration/:id'),
    deleteIntegration: (baseUrl) => createUrl(baseUrl, 'rcs-integration/'),
    getRcsIntegrationBannerImage: (baseUrl, id) => createUrl(baseUrl, `rcs-integration/${id}/?image=banner_image`),
    getRcsIntegrationLogoImage: (baseUrl, id) => createUrl(baseUrl, `rcs-integration/${id}/?image=small_logo`),
    updateRcsIntegrationById: (baseUrl) => createUrl(baseUrl, 'rcs-integration/:id'),
    deleteRcsIntegrationById: (baseUrl) => createUrl(baseUrl, 'rcs-integration/manager/:id'),
    getRcsIntegrationDropdown: (baseUrl) => createUrl(baseUrl, 'client-panel-registration-dropdown/'),
    getRcsLogsDropdown: (baseUrl) => createUrl(baseUrl, 'client-panel-log-dropdown/'),

    getRcsLog: (baseUrl) => createUrl(baseUrl, 'rcs-client-panel/log/'),
    getRcsReport: (baseUrl) => createUrl(baseUrl, 'rcs-client-panel/report/'),

    rcsUserCreds: (baseUrl) => createUrl(baseUrl, 'rcs-user-creds/'),
    rcsMessage: (baseUrl) => createUrl(baseUrl, 'send-rcs-message/'),
    rcsReceiveMessage: (baseUrl) => createUrl(baseUrl, 'receive-rcs-message/'),

    getAdminUsers: (baseUrl) => createUrl(baseUrl, 'rcs-admin-panel/user/'),
    getAdminLogByCompanyId: (baseUrl) => createUrl(baseUrl, 'rcs-admin-panel/log/:company_id'),
    getAdminReportByCompanyId: (baseUrl) => createUrl(baseUrl, 'rcs-admin-panel/report/:company_id & from_date='),
};

export const RCSTemplateUrls = {
    getRCSClientPanelTemplateDropdown: (baseUrl) => createUrl(baseUrl, 'client-panel-template-dropdown/'),
    createRCSTemplate: (baseUrl) => createUrl(baseUrl, 'rcs-client-panel/template/'),
    getTemplateData: (baseUrl) => createUrl(baseUrl, 'rcs-client-panel/template/'),
};
