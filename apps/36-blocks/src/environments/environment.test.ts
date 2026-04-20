import { envVariables } from './env-variables';

export const environment = {
    production: true,
    env: 'test',
    googleClientId: '',
    proxyServer: 'https://test.proxy.msg91.com',
    baseUrl: 'https://apitest.msg91.com/api',
    ...envVariables,
};
