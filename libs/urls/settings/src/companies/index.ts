import { createUrl } from '@msg91/service';

export const CompanyUrls = {
    getAllInvitations: (baseUrl: string) => createUrl(baseUrl, 'api/v5/access/getMemberAllInvitations'),
    memberInvitationAction: (baseUrl: string) => createUrl(baseUrl, 'api/v5/access/memberInvitationAction'),
    createNewCompany: (baseUrl: string) => createUrl(baseUrl, 'api/v5/panel/createCompany'),
};
