import { createUrl } from '@proxy/service';

export const UsersUrl = {
    getUsers: (baseUrl) => createUrl(baseUrl, 'clientUsers'),
    register: (baseUrl) => createUrl(baseUrl, 'register'),
};
