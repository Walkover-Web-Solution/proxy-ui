import { createUrl } from '../../base-url';

export const AdminEmailMainUrls = {
    userAuthenticationByEmail: (baseUrl) => createUrl(baseUrl, 'login'),
    userLogout: (baseUrl) => createUrl(baseUrl, 'logout'),
};
