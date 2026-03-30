import { envVariables } from './env-variables';

export const environment = {
    production: true,
    env: 'prod',
    apiUrl: 'https://routes.msg91.com/api',
    baseUrl: 'https://proxy.msg91.com',
    msgMidProxy: '',
    ...envVariables,
};
