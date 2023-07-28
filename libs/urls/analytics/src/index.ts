import { createUrl } from '@msg91/service';

export const AdminAnalyticsUsersUrls = {
    getUsersData: (baseUrl) => createUrl(baseUrl, 'analytics/:serviceType/'),
    getEmailEvents: (baseUrl) => createUrl(baseUrl, 'events'),
    exportLogs: (baseUrl) => createUrl(baseUrl, 'exports/:serviceType/'),
    exportReport: (baseUrl) => createUrl(baseUrl, 'analytics/:serviceType/export/'),
};

export const AdminAnalyticsVendorsUrls = {
    getVendorsData: (baseUrl) => createUrl(baseUrl, 'analytics/sms/'),
};

export const AdminAnalyticsProfitUrls = {
    getVendorsProfitData: (baseUrl) => createUrl(baseUrl, 'profits/vendors'),
    getAllUsersProfitData: (baseUrl) => createUrl(baseUrl, 'profits/sms'),
    getUserProfitData: (baseUrl) => createUrl(baseUrl, 'profits/sms'),
};
