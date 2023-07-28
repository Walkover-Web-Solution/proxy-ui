import { createUrl } from '@msg91/service';

export const UserSettingUrls = {
    getUserBalanceUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getRouteBalance'),
    getUserSettingsUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getUserSettings'),
    updateUserSettingUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/updateUserSettings'),
    updateUserMobileUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/updateUserMobile'),
    getUserLoginHistoryPaginatedUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getUserLoginHistoryPaginated'),
    getAllBlockedIpsUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getAllBlockedIps'),
    markLoginAsSuspiciousUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/markLoginSuspicious'),
    unBlockIpUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/unblockIp'),
    getUserSideMenuUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/sideMenu'),
    getCurrentAccountUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getCurrentAccount'),
    getAllAccountUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getAllAccounts'),
    getPermissionEditorRules: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getPermissionEditorRules'),
    switchAccountUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/switchAccount'),
};
