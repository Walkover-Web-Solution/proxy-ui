import { createUrl } from '../../base-url';

export const AdminEmailDomainUrls = {
    getAllDomains: (baseUrl) => createUrl(baseUrl, 'domains'),
    assignIpsToDomain: (baseUrl) => createUrl(baseUrl, 'assignIP'),
    toggleDomain: (baseUrl) => createUrl(baseUrl, 'toggleDomain'),
    verfiyDomain: (baseUrl) => createUrl(baseUrl, 'verify-domain'),
    getIpDetailsDomain: (baseUrl) => createUrl(baseUrl, 'ipDetails'),
    getIpsDomain: (baseUrl) => createUrl(baseUrl, 'ips'),
    unAssignIpsFromDomain: (baseUrl) => createUrl(baseUrl, 'unassignIP'),
    updatePerHourEmailLimit: (baseUrl) => createUrl(baseUrl, 'increasePerHourLimit'),
    updatePermissionDomain: (baseUrl) => createUrl(baseUrl, 'updateDomainPermissions'),
    updateAdminPermissionAndFailedRate: (baseUrl) => createUrl(baseUrl, 'updateDomain'),
    smtpActivate: (baseUrl) => createUrl(baseUrl, 'smtp-credentials'),
};
