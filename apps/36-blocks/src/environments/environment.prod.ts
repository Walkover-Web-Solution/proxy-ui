import { envVariables } from './env-variables';

export const environment = {
    production: true,
    env: 'prod',
    proxyServer: 'https://proxy.msg91.com',
    baseUrl: 'https://routes.msg91.com/api',
    ...envVariables,
};
